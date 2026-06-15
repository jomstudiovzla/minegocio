import { categories } from '@/data/mockDb';
import CategoryClient from './CategoryClient';

export function generateStaticParams() {
  return categories.map((c) => ({
    slug: c.id,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <CategoryClient slug={resolvedParams.slug} />;
}
