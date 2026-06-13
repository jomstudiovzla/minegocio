import { categories, products } from '@/data/mockDb';
import { notFound } from 'next/navigation';
import CategoryClient from './CategoryClient';

export function generateStaticParams() {
  return categories.map((c) => ({
    slug: c.id,
  }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryClient slug={params.slug} />;
}
