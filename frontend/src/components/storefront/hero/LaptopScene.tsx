import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { CanvasTexture, Color, MathUtils, Object3D, SRGBColorSpace } from 'three';
import type { Group, InstancedMesh } from 'three';
import type { MotionValue } from 'framer-motion';
import { readTokenColor } from '../utils';
import type { Theme } from '../theme';

export interface PointerRef {
  current: { x: number; y: number };
}

interface LaptopSceneProps {
  /** Hero scroll progress (0 at top → 1 when the hero has scrolled away). */
  progress: MotionValue<number>;
  /** Normalised cursor position (-1..1), written by the parent without re-rendering. */
  pointer: PointerRef;
  /** Render loop runs only while the hero is on screen and the tab is visible. */
  active: boolean;
  theme: Theme;
  onReady: () => void;
}

const BASE = { width: 3.2, height: 0.12, depth: 2.2 };
const LID_THICKNESS = 0.07;
const MAX_LID_ANGLE = 1.9; // ~109°

/** Draws the "display" into a canvas texture using the brand tokens. */
const drawScreen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const accent = readTokenColor('accent-strong');
  const violet = readTokenColor('violet-strong');
  const cyan = readTokenColor('cyan', 0.55);
  const ink = (alpha = 1) => readTokenColor('on-accent', alpha);

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, accent);
  base.addColorStop(1, violet);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.2, height * 0.15, 0, width * 0.2, height * 0.15, width * 0.6);
  glow.addColorStop(0, cyan);
  glow.addColorStop(1, readTokenColor('cyan', 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid
  ctx.strokeStyle = ink(0.06);
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const roundRect = (x: number, y: number, w: number, h: number, r: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  };

  // Menu bar + dock
  roundRect(0, 0, width, 30, 0, ink(0.12));
  roundRect(width / 2 - 170, height - 70, 340, 50, 18, ink(0.16));
  for (let i = 0; i < 6; i += 1) {
    roundRect(width / 2 - 150 + i * 52, height - 62, 36, 34, 9, ink(0.35 + (i % 3) * 0.15));
  }

  // Wordmark
  ctx.fillStyle = ink();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 96px "Space Grotesk", Inter, system-ui, sans-serif';
  ctx.fillText('LaptopWorld', width / 2, height / 2 - 24);
  ctx.globalAlpha = 0.78;
  ctx.font = '500 30px Inter, system-ui, sans-serif';
  ctx.fillText('Premium Laptops & Accessories', width / 2, height / 2 + 48);
  ctx.globalAlpha = 1;
};

const useScreenTexture = (theme: Theme) => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 656;
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 4;
    return map;
    // theme is a dependency so the screen redraws with the active tokens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const paint = () => {
      drawScreen(ctx, canvas.width, canvas.height);
      texture.needsUpdate = true;
    };
    paint();
    // Repaint once the display font has loaded.
    document.fonts?.ready.then(paint).catch(() => undefined);
    return () => texture.dispose();
  }, [texture]);

  return texture;
};

const Laptop: React.FC<Omit<LaptopSceneProps, 'active' | 'onReady'>> = ({ progress, pointer, theme }) => {
  const root = useRef<Group>(null);
  const lid = useRef<Group>(null);
  const keys = useRef<InstancedMesh>(null);
  const startedAt = useRef<number | null>(null);
  const screen = useScreenTexture(theme);

  const colors = useMemo(
    () => ({
      alu: new Color(readTokenColor('alu-from')),
      aluDark: new Color(readTokenColor('alu-to')),
      device: new Color(readTokenColor('device')),
      accent: new Color(readTokenColor('accent-strong')),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  // Lay out the keyboard as a single instanced mesh (one draw call).
  useLayoutEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const dummy = new Object3D();
    let index = 0;
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 13; col += 1) {
        dummy.position.set(-1.2 + col * 0.2, 0, -0.68 + row * 0.19);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (startedAt.current === null) startedAt.current = t;
    const intro = MathUtils.smootherstep(t - startedAt.current, 0, 1.8);
    const scrolled = MathUtils.clamp(progress.get() * 2.2, 0, 1);

    // Lid: opens on load, then fully as the hero scrolls.
    const open = (0.62 + 0.38 * scrolled) * intro;
    if (lid.current) {
      lid.current.rotation.x = MathUtils.damp(lid.current.rotation.x, -open * MAX_LID_ANGLE, 6, delta);
    }

    if (root.current) {
      const sway = Math.sin(t * 0.3) * 0.22 * (1 - scrolled);
      const yaw = -0.55 + scrolled * 0.45 + sway + pointer.current.x * 0.35;
      const pitch = 0.1 - pointer.current.y * 0.12 - scrolled * 0.06;
      root.current.rotation.y = MathUtils.damp(root.current.rotation.y, yaw, 3, delta);
      root.current.rotation.x = MathUtils.damp(root.current.rotation.x, pitch, 3, delta);
      root.current.position.y = -0.35 + Math.sin(t * 0.8) * 0.04 + scrolled * 0.2;
    }
  });

  return (
    <group ref={root} rotation={[0.1, -0.55, 0]} position={[0, -0.35, 0]}>
      {/* Base */}
      <RoundedBox args={[BASE.width, BASE.height, BASE.depth]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={colors.alu} metalness={0.65} roughness={0.32} />
      </RoundedBox>
      {/* Keyboard well, keys, trackpad */}
      <mesh position={[0, BASE.height / 2 + 0.001, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.75, 1.05]} />
        <meshStandardMaterial color={colors.device} roughness={0.8} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, 65]} position={[0, BASE.height / 2 + 0.012, 0]}>
        <boxGeometry args={[0.165, 0.02, 0.15]} />
        <meshStandardMaterial color={colors.device} roughness={0.55} metalness={0.2} />
      </instancedMesh>
      <mesh position={[0, BASE.height / 2 + 0.001, 0.66]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.05, 0.62]} />
        <meshStandardMaterial color={colors.aluDark} metalness={0.5} roughness={0.25} />
      </mesh>
      {/* Hinge */}
      <mesh position={[0, BASE.height / 2, -BASE.depth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 2.6, 24]} />
        <meshStandardMaterial color={colors.aluDark} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Lid, hinged at the back edge of the base */}
      <group ref={lid} position={[0, BASE.height / 2 + 0.004, -BASE.depth / 2]}>
        <RoundedBox args={[BASE.width, LID_THICKNESS, BASE.depth]} radius={0.035} smoothness={4} position={[0, LID_THICKNESS / 2, BASE.depth / 2]}>
          <meshStandardMaterial color={colors.alu} metalness={0.65} roughness={0.3} />
        </RoundedBox>
        {/* Bezel + display face the keyboard when closed (local -Y) */}
        <mesh position={[0, -0.001, BASE.depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.1, 2.1]} />
          <meshStandardMaterial color={colors.device} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.002, BASE.depth / 2 + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.9, 1.86]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        {/* Screen glow spilling onto the keyboard */}
        <pointLight position={[0, -0.6, BASE.depth / 2]} color={colors.accent} intensity={2.2} distance={3.5} />
      </group>
    </group>
  );
};

/** Signals readiness after the first rendered frame so the CSS fallback can fade out. */
const ReadySignal: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      requestAnimationFrame(onReady);
    }
  });
  return null;
};

const LaptopScene: React.FC<LaptopSceneProps> = ({ progress, pointer, active, theme, onReady }) => {
  const accent = useMemo(() => readTokenColor('accent-strong'), []);
  const violet = useMemo(() => readTokenColor('violet-strong'), []);

  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.9, 7], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} rotation-x={Math.PI / 2} position={[0, 5, -6]} scale={[12, 2, 1]} />
        <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-6, 1, 0]} scale={[8, 3, 1]} color={accent} />
        <Lightformer intensity={1.2} rotation-y={-Math.PI / 2} position={[6, 1, 0]} scale={[8, 3, 1]} color={violet} />
      </Environment>
      <Laptop progress={progress} pointer={pointer} theme={theme} />
      <ContactShadows position={[0, -0.95, 0]} scale={9} blur={2.6} opacity={theme === 'dark' ? 0.7 : 0.35} far={3} resolution={256} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
};

export default LaptopScene;
