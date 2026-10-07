import type { Metadata } from 'next';
import { products } from '@/data/mockDb';
import { SITE_URL } from '@/lib/seo';
import ProductClient from './ProductClient';

export function generateStaticParams() {
  return products.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = products.find((p) => p.id === resolvedParams.id);

  if (!product) {
    return {
      title: 'Producto no encontrado | Supermercado Mi Negocio',
      description: 'El producto seleccionado no está disponible en Supermercado Mi Negocio Caracas.',
    };
  }

  const title = `${product.name} | Supermercado Mi Negocio`;
  const desc = product.description
    ? `${product.description} Compra online en Supermercado Mi Negocio con delivery en Caracas.`
    : `Compra ${product.name} al mejor precio en Caracas. Delivery rápido y seguro con Supermercado Mi Negocio.`;
  const canonicalUrl = `${SITE_URL}/product/${product.id}/`;

  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${SITE_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      product.name,
      product.category,
      product.subcategory || '',
      'supermercado caracas',
      'delivery caracas',
      'compras online venezuela',
    ].filter(Boolean),
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      siteName: 'Supermercado Mi Negocio',
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
      type: 'website',
      locale: 'es_VE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = products.find((p) => p.id === resolvedParams.id);

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image.startsWith('http')
          ? product.image
          : `${SITE_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`,
        description: product.description || `Compra ${product.name} en Supermercado Mi Negocio Caracas.`,
        category: product.category,
        brand: {
          '@type': 'Brand',
          name: 'Supermercado Mi Negocio',
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability:
            (product.stock ?? 0) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: `${SITE_URL}/product/${product.id}/`,
          seller: {
            '@type': 'Organization',
            name: 'Supermercado Mi Negocio',
          },
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
      <ProductClient id={resolvedParams.id} />
    </>
  );
}
