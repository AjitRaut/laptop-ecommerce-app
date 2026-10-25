import React, { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useReducedMotion, type MotionValue } from 'framer-motion';
import { clsx } from 'clsx';
import CssLaptop from '../CssLaptop';
import { useFinePointer, useMediaQuery } from '../hooks';
import { useTheme } from '../theme';

// three / @react-three/* live in their own chunk, fetched only when the 3D scene mounts.
const LaptopScene = lazy(() => import('./LaptopScene'));

const supportsWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const prefersSaveData = (): boolean =>
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/** If WebGL fails at runtime, keep showing the CSS laptop instead of crashing the page. */
class SceneBoundary extends Component<{ children: React.ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface HeroLaptopProps {
  progress: MotionValue<number>;
  className?: string;
}

/**
 * Hero visual. Desktop + fine pointer + WebGL + motion allowed → interactive 3D
 * laptop, mounted after the browser is idle so it never blocks first paint.
 * Everyone else (touch, small screens, reduced motion, Save-Data) gets the
 * CSS-only laptop, which is also shown until the 3D scene renders its first frame.
 */
const HeroLaptop: React.FC<HeroLaptopProps> = ({ progress, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const finePointer = useFinePointer();
  const largeScreen = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const [capable] = useState(() => supportsWebGL() && !prefersSaveData());
  const [idle, setIdle] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState === 'visible');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const enabled = finePointer && largeScreen && !reduceMotion && capable && !failed;

  // Fetch the ~240 KB 3D chunk only after the visitor first interacts (moves the
  // mouse, scrolls, presses a key), then at the next idle moment. Initial load and
  // its main-thread budget stay untouched; the CSS laptop shows until then.
  useEffect(() => {
    if (!enabled || idle) return;
    let idleId = 0;
    const events: (keyof WindowEventMap)[] = ['pointermove', 'scroll', 'keydown', 'wheel'];
    const start = () => {
      events.forEach((name) => window.removeEventListener(name, start));
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setIdle(true), { timeout: 1000 });
      } else {
        setIdle(true);
      }
    };
    events.forEach((name) => window.addEventListener(name, start, { passive: true, once: true }));
    return () => {
      events.forEach((name) => window.removeEventListener(name, start));
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
    };
  }, [enabled, idle]);

  // Pause rendering when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !enabled) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0 });
    observer.observe(element);
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);

  // Cursor anywhere on the page steers the laptop a little (no re-renders).
  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  const showScene = enabled && idle;

  return (
    <div ref={containerRef} aria-hidden="true" className={clsx('relative aspect-[6/5] w-full', className)}>
      {/* Glow pool under the device */}
      <div className="absolute inset-x-[10%] bottom-[8%] h-1/3 rounded-full bg-sf-gradient opacity-30 blur-3xl" />
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-700',
          showScene && ready ? 'opacity-0' : 'opacity-100'
        )}
      >
        <CssLaptop float className="w-[86%]" />
      </div>
      {showScene && (
        <SceneBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <LaptopScene
              progress={progress}
              pointer={pointer}
              active={onScreen && tabVisible}
              theme={theme}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
};

export default HeroLaptop;
