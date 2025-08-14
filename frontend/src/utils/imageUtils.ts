  export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '/api/placeholder/400/400';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path, prepend the base URL
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imagePath}`;
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const optimizeImage = (src: string, width?: number, height?: number): string => {
  if (!src || src.includes('placeholder')) return src;
  
  // Add image optimization parameters if using a CDN
  const url = new URL(src);
  if (width) url.searchParams.set('w', width.toString());
  if (height) url.searchParams.set('h', height.toString());
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('auto', 'format');
  
  return url.toString();
};