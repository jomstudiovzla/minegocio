import { Product } from '@/data/mockDb';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const STOP_WORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'en', 'para', 'con', 'x', 'y', 'al']);

export function searchProducts(products: Product[], rawQuery: string): Product[] {
  const query = normalizeText(rawQuery);
  if (!query) return [];

  const rawTokens = query.split(/\s+/).filter(Boolean);
  const significantTokens = rawTokens.filter(t => t.length > 1 && !STOP_WORDS.has(t));
  const tokens = significantTokens.length > 0 ? significantTokens : rawTokens;

  const scoredProducts: { product: Product; score: number }[] = [];

  for (const p of products) {
    if (p.isActive === false) continue;

    const pName = normalizeText(p.name);
    const pCat = normalizeText(p.category);
    const pSub = normalizeText(p.subcategory || '');
    const pDesc = normalizeText(p.description || '');

    let score = 0;

    // 1. Coincidencia exacta o por prefijo de la frase completa
    if (pName === query) {
      score += 500;
    } else if (pName.startsWith(query)) {
      score += 300;
    } else if (pName.includes(query)) {
      score += 150;
    }

    // 2. Coincidencia por palabras clave
    let matchedTokenCount = 0;
    for (const token of tokens) {
      const isShort = token.length <= 3;
      const wordBoundaryRegex = new RegExp(`\\b${token}\\b`, 'i');
      const wordStartRegex = new RegExp(`\\b${token}`, 'i');

      if (wordBoundaryRegex.test(pName)) {
        score += isShort ? 250 : 150;
        matchedTokenCount++;
      } else if (wordStartRegex.test(pName)) {
        // Para palabras cortas (ej. 'pan'), evitar que 'pantera' o 'pantoprazol' compitan con pan real
        score += isShort ? 8 : 60;
        matchedTokenCount++;
      } else if (!isShort && pName.includes(token)) {
        score += 20;
        matchedTokenCount++;
      }

      if (wordBoundaryRegex.test(pSub) || wordBoundaryRegex.test(pCat)) {
        score += 50;
        matchedTokenCount++;
      } else if (!isShort && (pSub.includes(token) || pCat.includes(token) || pDesc.includes(token))) {
        score += 15;
        matchedTokenCount++;
      }
    }

    // Si la búsqueda tiene varias palabras, dar un bono fuerte si el producto tiene TODAS las palabras
    if (matchedTokenCount > 0) {
      const coverageRatio = matchedTokenCount / tokens.length;
      score += coverageRatio * 100;
      if (coverageRatio >= 1 && tokens.length > 1) {
        score += 300; // Coincide con todos los términos (ej. 'pan' + 'hambu')
      }
      scoredProducts.push({ product: p, score });
    }
  }

  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .map(sp => sp.product);
}
