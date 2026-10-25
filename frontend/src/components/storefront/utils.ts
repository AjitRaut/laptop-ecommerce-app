/** Shared layout container: max width, 16px mobile gutter. */
export const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

/** Pulls a readable message out of an RTK Query / fetch error without resorting to `any`. */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message) return message;
    }
  }
  return fallback;
};

/**
 * Field-level validation errors returned by the API (`{ errors: { field: [msg] } }`).
 */
export const apiFieldErrors = (error: unknown): Record<string, string> => {
  const result: Record<string, string> = {};
  if (typeof error !== 'object' || error === null || !('data' in error)) return result;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null || !('errors' in data)) return result;
  const errors = (data as { errors?: unknown }).errors;
  if (typeof errors !== 'object' || errors === null) return result;
  Object.entries(errors as Record<string, unknown>).forEach(([field, messages]) => {
    const first = Array.isArray(messages) ? messages[0] : messages;
    if (typeof first === 'string') result[field] = first;
  });
  return result;
};

/**
 * Reads an `--sf-*` RGB-channel token as a CSS colour, for libraries (e.g. Stripe
 * Elements, WebGL) that cannot resolve CSS variables themselves.
 */
export const readTokenColor = (name: string, alpha = 1): string => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--sf-${name}`).trim();
  const [r = '0', g = '0', b = '0'] = raw.split(/\s+/);
  return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface RelationRef {
  id: string;
  name: string;
}

/**
 * List endpoints send `category`/`brand` as ids plus `*_name` fields, while the
 * detail endpoint nests full objects. Normalise both shapes.
 */
export const productRelation = (value: unknown, fallbackName?: string): RelationRef | null => {
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const relation = value as { id: unknown; name?: unknown };
    return {
      id: String(relation.id),
      name: typeof relation.name === 'string' ? relation.name : fallbackName ?? '',
    };
  }
  if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
    return { id: String(value), name: fallbackName ?? '' };
  }
  return null;
};

export const toNumber = (value: string | number | undefined | null): number => {
  const parsed = typeof value === 'number' ? value : parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
};

const TINTS = ['accent', 'violet', 'cyan'] as const;
export type Tint = (typeof TINTS)[number];

/** Stable per-product tint so cards that share a photo still feel distinct. */
export const tintFor = (seed: number): Tint => TINTS[Math.abs(seed) % TINTS.length];

export const initials = (text: string): string =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
