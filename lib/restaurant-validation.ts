import { MenuItem } from '@/lib/data';

export function normalizeMenuItems(value: unknown): MenuItem[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const normalized: MenuItem[] = [];
  for (const [index, entry] of value.entries()) {
    if (!entry || typeof entry !== 'object') return null;
    const item = entry as Record<string, unknown>;
    const name = String(item.name ?? '').trim();
    const price = Number(item.price);
    if (!name || !Number.isFinite(price) || price < 0) return null;

    normalized.push({
      id: String(item.id ?? '').trim() || `menu-${Date.now()}-${index}`,
      name,
      description: String(item.description ?? '').trim(),
      price,
      category: String(item.category ?? '').trim() || 'Main',
    });
  }

  return normalized;
}