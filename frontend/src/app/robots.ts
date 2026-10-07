import type { MetadataRoute } from 'next';
import { SITE_URL, SITE_BASE_PATH } from '@/lib/seo';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const p = SITE_BASE_PATH; // '/minegocio' en GitHub Pages; '' con dominio propio
  return {
    rules: [
      {
        userAgent: '*',
        allow: `${p}/`,
        disallow: [
          `${p}/mi-negocio-admin/`,
          `${p}/account/`,
          `${p}/cart/`,
          `${p}/checkout/`,
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
