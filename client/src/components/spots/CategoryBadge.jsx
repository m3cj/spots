import { CategoryIcon } from '@/utils/categoryIcons';

/**
 * Category badge tinted with the category's DB colour. The tint is a mix into the card surface and the label
 * stays --text-primary, so contrast holds for every colour an admin can pick and in both themes.
 */
export default function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <span
      style={{ backgroundColor: `color-mix(in srgb, ${category.color} 18%, var(--surface-card))` }}
      className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-tag text-mithila-text"
    >
      <span style={{ color: category.color }}>
        <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
      </span>
      {category.name}
    </span>
  );
}
