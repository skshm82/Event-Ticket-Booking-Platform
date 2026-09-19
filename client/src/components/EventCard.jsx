import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  concert: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  sports: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  theater: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  comedy: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
};

const CATEGORY_EMOJIS = {
  concert: '🎵',
  sports: '🏀',
  theater: '🎭',
  comedy: '😂',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(time) {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function EventCard({ event }) {
  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.concert;
  const emoji = CATEGORY_EMOJIS[event.category] || '🎪';
  const availablePercent =
    event.totalSeats > 0
      ? Math.round((event.availableSeats / event.totalSeats) * 100)
      : 0;

  return (
    <Link
      to={`/events/${event._id}`}
      id={`event-card-${event._id}`}
      className="glass-card group hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 block"
    >
      {/* Category banner */}
      <div className="h-32 rounded-t-2xl bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center relative overflow-hidden">
        <span className="text-5xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500">
          {emoji}
        </span>
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {emoji} {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-900/80 text-white border border-surface-600">
            ${event.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-surface-100 mb-2 group-hover:text-primary-300 transition-colors line-clamp-1">
          {event.title}
        </h3>

        {/* Venue */}
        <div className="flex items-center gap-1.5 text-sm text-surface-400 mb-1">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{event.venue?.name || 'TBD'}</span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-1.5 text-sm text-surface-400 mb-4">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {formatDate(event.date)} · {formatTime(event.time)}
          </span>
        </div>

        {/* Availability bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-surface-400">
              {event.availableSeats} of {event.totalSeats} available
            </span>
            <span
              className={
                availablePercent > 50
                  ? 'text-green-400'
                  : availablePercent > 20
                  ? 'text-amber-400'
                  : 'text-red-400'
              }
            >
              {availablePercent}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                availablePercent > 50
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : availablePercent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${availablePercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
