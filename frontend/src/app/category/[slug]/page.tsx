import type { Metadata } from 'next';
import { categories } from '@/data/mockDb';
import { SITE_URL } from '@/lib/seo';
import CategoryClient from './CategoryClient';

export function generateStaticParams() {
  return categories.map((c) => ({
    slug: c.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = categories.find((c) => c.id === resolvedParams.slug);

  if (!category) {
    return {
      title: 'Categoría no encontrada | Supermercado Mi Negocio',
      description: 'Categoría no disponible en Supermercado Mi Negocio Caracas.',
    };
  }

  const title = `${category.name} | Supermercado Mi Negocio Caracas`;
  const description = `Explora nuestra selección de ${category.name} en Supermercado Mi Negocio. Gran variedad, frescura y delivery rápido en Caracas.`;
  const canonicalUrl = `${SITE_URL}/category/${category.id}/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      category.name,
      'supermercado caracas',
      'delivery caracas',
      'compras online venezuela',
      'viveres caracas',
      'productos frescos',
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Supermercado Mi Negocio',
      type: 'website',
      locale: 'es_VE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = categories.find((c) => c.id === resolvedParams.slug);

  const jsonLd = category
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.name} - Supermercado Mi Negocio`,
        description: `Catálogo de productos en ${category.name} con delivery en Caracas.`,
        url: `${SITE_URL}/category/${category.id}/`,
        provider: {
          '@type': 'Organization',
          name: 'Supermercado Mi Negocio',
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CategoryClient slug={resolvedParams.slug} />
    </>
  );
}
