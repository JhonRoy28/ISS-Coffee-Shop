const FORMULA_PREFIX = /^[\s\p{Cc}\p{Cf}]*[=+\-@]/u;

export function escapeCsvCell(value) {
  const text = String(value ?? '');
  const safeText = FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}
