import type React from 'react';
import {
  BoltIcon,
  BriefcaseIcon,
  SparklesIcon,
  CubeTransparentIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/** Categories come from the API without images; pick an icon from the name. */
export const categoryIcon = (name: string): Icon => {
  const lower = name.toLowerCase();
  if (lower.includes('gaming')) return BoltIcon;
  if (lower.includes('business')) return BriefcaseIcon;
  if (lower.includes('ultra')) return SparklesIcon;
  if (lower.includes('access')) return CubeTransparentIcon;
  return ComputerDesktopIcon;
};

/** Fallback blurbs for categories that have no description in the API. */
export const categoryBlurb = (name: string, description?: string): string => {
  if (description) return description;
  const lower = name.toLowerCase();
  if (lower.includes('gaming')) return 'High-refresh displays and the latest GPUs.';
  if (lower.includes('business')) return 'Reliable machines built for productivity.';
  if (lower.includes('ultra')) return 'Thin, light and ready to go anywhere.';
  if (lower.includes('access')) return 'Mice, keyboards and everyday essentials.';
  return 'Explore the collection.';
};
