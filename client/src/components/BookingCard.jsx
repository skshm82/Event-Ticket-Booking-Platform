const STATUS_BADGE = {
  confirmed: {
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Confirmed',
    icon: '✓',
  },
  cancelled: {
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
    label: 'Cancelled',
    icon: '✕',
  },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function BookingCard({ booking, onCancel, cancelling = false }) {
  const event = booking.event;
  const badge = STATUS_BADGE[booking.status] || STATUS_BADGE.confirmed;
  const isConfirmed = booking.status === 'confirmed';

  return (
    <div
      id={`booking-card-${booking._id}`}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all duration-150 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Event info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {event?.title || 'Unknown Event'}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${badge.classes}`}
            >
              {badge.icon} {badge.label}
            </span>
          </div>

          {/* Venue */}
          {event?.venue?.name && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.venue.name}</span>
            </div>
          )}

          {/* Date & Time */}
          {event?.date && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {formatDate(event.date)} · {formatTime(event.time)}
              </span>
            </div>
          )}

          {/* Seats */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <div className="flex flex-wrap gap-1">
              {booking.seatLabels.map((label) => (
                <span
                  key={label}
                  className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-medium text-slate-800"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 sm:min-w-[130px] pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left sm:text-right">
            <p className="text-xl font-bold text-slate-900">
              ₹{booking.totalPrice?.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500">
              {booking.seatLabels.length} seat{booking.seatLabels.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isConfirmed && onCancel && (
            <button
              id={`cancel-booking-${booking._id}`}
              onClick={() => onCancel(booking._id)}
              disabled={cancelling}
              className="btn-danger text-xs px-3 py-1.5"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>

      {/* Booking ID */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 font-mono">
          Ref ID: {booking._id}
        </p>
      </div>
    </div>
  );
}
