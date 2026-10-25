import React from 'react';
import { motion, type Variants } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance travelled upwards while fading in. */
  y?: number;
}

/** Fades/lifts content in once it scrolls into view. */
export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, y = 24 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, ease, delay }}
  >
    {children}
  </motion.div>
);

const groupVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  shown: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease } },
};

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'ul' | 'ol' | 'dl';
}

/** Staggers its `RevealItem` children as the group enters the viewport. */
export const RevealGroup: React.FC<RevealGroupProps> = ({ children, className, as = 'div' }) => {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </Component>
  );
};

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li';
}

export const RevealItem: React.FC<RevealItemProps> = ({ children, className, as = 'div' }) => {
  const Component = motion[as];
  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  );
};
