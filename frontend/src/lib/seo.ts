/**
 * Datos de SEO en un solo lugar.
 *
 * Hoy el sitio vive en GitHub Pages bajo /minegocio. Si algún día conectas un
 * dominio propio (p. ej. https://mi-negocio.ve), cambia SOLO `SITE_URL` aquí y
 * quita `basePath` en next.config.ts: todo el SEO (sitemap, robots, canonical,
 * OpenGraph, JSON-LD) se actualiza solo.
 */
export const SITE_URL = 'https://jomstudiovzla.github.io/minegocio';

/** Ruta base de las páginas (lo que va después del dominio). Vacío sin dominio propio. */
export const SITE_BASE_PATH = '/minegocio';

/** Imagen real para las vistas previas al compartir (OpenGraph/Twitter/WhatsApp). */
export const SITE_OG_IMAGE = `${SITE_URL}/logo.jpg`;

/** Nombre comercial de la tienda. */
export const SITE_NAME = 'Supermercado Mi Negocio';
