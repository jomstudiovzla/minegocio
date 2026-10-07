/** Une clases condicionales en una sola cadena, ignorando lo vacío. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
