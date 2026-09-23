import { useMemo } from 'react';

const STATUS_STYLES = {
  available:
    'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500 hover:scale-105 cursor-pointer shadow-xs',
  held: 'bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed opacity-75',
  booked:
    'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60',
  selected:
    'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200 hover:bg-indigo-700 hover:scale-105 cursor-pointer shadow-sm font-semibold',
};

const LEGEND = [
  { status: 'available', label: 'Available', color: 'bg-emerald-50 border border-emerald-400' },
  { status: 'selected', label: 'Selected', color: 'bg-indigo-600 border border-indigo-600' },
  { status: 'held', label: 'Held (Pending)', color: 'bg-amber-100 border border-amber-400' },
  { status: 'booked', label: 'Booked', color: 'bg-slate-200 border border-slate-300' },
];

export default function SeatMap({
  seats,
  rows,
  columns,
  selectedSeatIds,
  onSeatClick,
  disabled = false,
}) {
  // Organize seats into a grid [row][column]
  const grid = useMemo(() => {
    const g = Array.from({ length: rows }, () => Array(columns).fill(null));
    seats.forEach((seat) => {
      if (seat.row < rows && seat.column < columns) {
        g[seat.row][seat.column] = seat;
      }
    });
    return g;
  }, [seats, rows, columns]);

  const getSeatStatus = (seat) => {
    if (!seat) return null;
    if (selectedSeatIds.includes(seat._id)) return 'selected';
    return seat.status;
  };

  const handleClick = (seat) => {
    if (disabled) return;
    if (!seat) return;
    const status = seat.status;
    const isSelected = selectedSeatIds.includes(seat._id);

    // Can only click available seats or deselect selected ones
    if (status === 'available' || isSelected) {
      onSeatClick(seat);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sleek Stage indicator (No gradients) */}
      <div className="text-center">
        <div className="inline-block px-14 py-1.5 rounded-b-md bg-slate-100 border-x border-b border-slate-300 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          Stage / Screen
        </div>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col items-center gap-1.5 overflow-x-auto py-2">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-1.5">
            {/* Row label */}
            <span className="w-5 text-xs text-slate-400 font-mono text-right shrink-0 font-semibold">
              {String.fromCharCode(65 + rowIdx)}
            </span>

            {/* Seats */}
            {row.map((seat, colIdx) => {
              const status = getSeatStatus(seat);

              if (!seat) {
                return (
                  <div
                    key={colIdx}
                    className="w-8 h-8 sm:w-9 sm:h-9"
                  />
                );
              }

              return (
                <button
                  key={seat._id}
                  id={`seat-${seat.label}`}
                  onClick={() => handleClick(seat)}
                  disabled={disabled || (status !== 'available' && status !== 'selected')}
                  title={`${seat.label} — ${status}`}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-md border text-[10px] sm:text-xs font-mono font-medium
                    transition-all duration-150 flex items-center justify-center
                    ${STATUS_STYLES[status] || ''}
                    ${disabled ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  {colIdx + 1}
                </button>
              );
            })}

            {/* Row label (right) */}
            <span className="w-5 text-xs text-slate-400 font-mono shrink-0 font-semibold">
              {String.fromCharCode(65 + rowIdx)}
            </span>
          </div>
        ))}
      </div>

      {/* Column numbers */}
      <div className="flex items-center justify-center gap-1.5 px-6">
        <span className="w-5" />
        {Array.from({ length: columns }, (_, i) => (
          <span
            key={i}
            className="w-8 sm:w-9 text-center text-[10px] text-slate-400 font-mono font-medium"
          >
            {i + 1}
          </span>
        ))}
        <span className="w-5" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100">
        {LEGEND.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span className={`w-3.5 h-3.5 rounded-sm ${item.color}`} />
            <span className="text-xs text-slate-600 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
