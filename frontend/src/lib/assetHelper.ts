export function getAssetPath(path: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = isProd ? '/minegocio' : '';
  
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure we don't double prefix
  if (isProd && path.startsWith(basePath)) return path;
  
  return path.startsWith('/') ? `${basePath}${path}` : `${basePath}/${path}`;
}
