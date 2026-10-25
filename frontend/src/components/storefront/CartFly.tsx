import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface CartFlyContextValue {
  /** Header registers its cart icon as the flight destination. */
  registerTarget: (element: HTMLElement | null) => void;
  /** Flies a thumbnail from `source` to the cart icon, then bumps the badge. */
  flyToCart: (source: HTMLElement | null, imageSrc?: string) => void;
  /** Increments after every successful add; the cart badge keys its bounce on it. */
  bumpKey: number;
}

const CartFlyContext = createContext<CartFlyContextValue | null>(null);

export const CartFlyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const targetRef = useRef<HTMLElement | null>(null);
  const [bumpKey, setBumpKey] = useState(0);
  const reduceMotion = useReducedMotion();

  const registerTarget = useCallback((element: HTMLElement | null) => {
    targetRef.current = element;
  }, []);

  const flyToCart = useCallback(
    (source: HTMLElement | null, imageSrc?: string) => {
      const bump = () => setBumpKey((key) => key + 1);
      const target = targetRef.current;
      if (!source || !target || reduceMotion) {
        bump();
        return;
      }

      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      if (to.width === 0 || from.width === 0) {
        bump();
        return;
      }

      const size = Math.min(from.width, from.height, 112);
      const startX = from.left + from.width / 2 - size / 2;
      const startY = from.top + from.height / 2 - size / 2;
      const dx = to.left + to.width / 2 - (startX + size / 2);
      const dy = to.top + to.height / 2 - (startY + size / 2);

      const ghost = document.createElement('div');
      ghost.className = 'sf-fly-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      Object.assign(ghost.style, {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${size}px`,
        height: `${size}px`,
      });
      if (imageSrc) {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = '';
        ghost.appendChild(img);
      }
      document.body.appendChild(ghost);

      const flight = ghost.animate(
        [
          { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)', opacity: 1 },
          {
            transform: `translate3d(${dx * 0.45}px, ${dy * 0.45 - 90}px, 0) scale(0.62) rotate(-8deg)`,
            opacity: 1,
            offset: 0.5,
          },
          { transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.14) rotate(0deg)`, opacity: 0.5 },
        ],
        { duration: 780, easing: 'cubic-bezier(0.55, 0, 0.7, 0.2)' }
      );
      flight.onfinish = () => {
        ghost.remove();
        bump();
      };
      flight.oncancel = () => ghost.remove();
    },
    [reduceMotion]
  );

  const value = useMemo(() => ({ registerTarget, flyToCart, bumpKey }), [registerTarget, flyToCart, bumpKey]);

  return <CartFlyContext.Provider value={value}>{children}</CartFlyContext.Provider>;
};

const noop: CartFlyContextValue = { registerTarget: () => {}, flyToCart: () => {}, bumpKey: 0 };

/** Safe outside the storefront shell (falls back to no-ops). */
export const useCartFly = (): CartFlyContextValue => useContext(CartFlyContext) ?? noop;
