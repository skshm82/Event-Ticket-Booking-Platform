const CATEGORIES = [
  { key: 'all', label: 'All Events', emoji: '🎪' },
  { key: 'concert', label: 'Concerts', emoji: '🎵' },
  { key: 'sports', label: 'Sports & Cricket', emoji: '🏏' },
  { key: 'theater', label: 'Theater & Plays', emoji: '🎭' },
  { key: 'comedy', label: 'Stand-up Comedy', emoji: '🎙️' },
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
            transition-all duration-150 border
            ${
              active === cat.key
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
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
