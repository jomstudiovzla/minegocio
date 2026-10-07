import type { MetadataRoute } from 'next';
import { products, categories } from '@/data/mockDb';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const now = new Date();

  // Páginas institucionales públicas
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/como-funciona/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/delivery/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/pagos/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/promociones/`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/preguntas-frecuentes/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/comentarios/`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/terminos/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacidad/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/aviso-legal/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Categorías
  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.id}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Productos
  const productUrls: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${baseUrl}/product/${prod.id}/`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryUrls, ...productUrls];
}
