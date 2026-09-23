import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  concert: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  sports: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  theater: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  comedy: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const CATEGORY_EMOJIS = {
  concert: '🎵',
  sports: '🏏',
  theater: '🎭',
  comedy: '🎙️',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
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
      className="bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden group flex flex-col h-full"
    >
      {/* Event image header banner */}
      <div className="h-44 bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="text-4xl opacity-40 group-hover:scale-110 transition-transform duration-200">
            {emoji}
          </span>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} bg-white/95 backdrop-blur-xs shadow-xs`}
          >
            {emoji} <span className="capitalize">{event.category}</span>
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-slate-900 border border-slate-200 shadow-xs">
            ₹{event.price?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {event.title}
          </h3>

          {/* Venue */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1.5">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.venue?.name || 'TBD'}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-4">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {formatDate(event.date)} · {formatTime(event.time)}
            </span>
          </div>
        </div>

        {/* Availability bar (Solid color, no gradient) */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {event.availableSeats} of {event.totalSeats} seats left
            </span>
            <span
              className={`font-semibold ${
                availablePercent > 50
                  ? 'text-emerald-700'
                  : availablePercent > 20
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {availablePercent}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                availablePercent > 50
                  ? 'bg-emerald-500'
                  : availablePercent > 20
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${availablePercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
