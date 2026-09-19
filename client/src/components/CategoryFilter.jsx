const CATEGORIES = [
  { key: 'all', label: 'All Events', emoji: '🎪' },
  { key: 'concert', label: 'Concerts', emoji: '🎵' },
  { key: 'sports', label: 'Sports', emoji: '🏀' },
  { key: 'theater', label: 'Theater', emoji: '🎭' },
  { key: 'comedy', label: 'Comedy', emoji: '😂' },
];

export default function CategoryFilter({ active, onChange }) {
  return (
    <div id="category-filter" className="flex flex-wrap gap-2 justify-center">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          id={`filter-${cat.key}`}
          onClick={() => onChange(cat.key)}
          className={`
            inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200 border
            ${
              active === cat.key
                ? 'bg-primary-600/30 border-primary-500/50 text-primary-300 shadow-lg shadow-primary-500/10'
                : 'bg-surface-800/50 border-surface-700 text-surface-400 hover:bg-surface-700/50 hover:text-surface-200 hover:border-surface-600'
            }
          `}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
