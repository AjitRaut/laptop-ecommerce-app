import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const COLORS = ['bg-sf-accent-strong', 'bg-sf-violet-strong', 'bg-sf-cyan', 'bg-sf-success', 'bg-sf-warning'];
const PIECES = 90;

/**
 * One-shot confetti burst. Pieces are plain divs animated with the Web Animations
 * API (transform + opacity only) and removed when done. Skipped for reduced motion.
 */
const Confetti: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const host = ref.current;
    if (!host || reduceMotion) return;
    const animations: Animation[] = [];

    for (let i = 0; i < PIECES; i += 1) {
      const piece = document.createElement('span');
      const size = 6 + Math.random() * 6;
      piece.className = `absolute left-1/2 top-1/3 rounded-[2px] ${COLORS[i % COLORS.length]}`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (0.4 + Math.random() * 0.8)}px`;
      host.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 160 + Math.random() * 340;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 180;
      const spin = (Math.random() - 0.5) * 1080;

      const animation = piece.animate(
        [
          { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate3d(${dx * 1.2}px, ${dy + 520}px, 0) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: 1800 + Math.random() * 1200, delay: Math.random() * 150, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' }
      );
      animation.onfinish = () => piece.remove();
      animations.push(animation);
    }

    return () => {
      animations.forEach((animation) => animation.cancel());
      host.replaceChildren();
    };
  }, [reduceMotion]);

  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden" />;
};

export default Confetti;
