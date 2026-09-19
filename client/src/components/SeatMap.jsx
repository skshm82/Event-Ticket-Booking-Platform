import { useMemo } from 'react';

const STATUS_STYLES = {
  available:
    'bg-seat-available/20 border-seat-available/40 text-green-300 hover:bg-seat-available/40 hover:scale-110 cursor-pointer',
  held: 'bg-seat-held/20 border-seat-held/40 text-amber-300 cursor-not-allowed opacity-60',
  booked:
    'bg-seat-booked/20 border-seat-booked/40 text-red-300 cursor-not-allowed opacity-60',
  selected:
    'bg-seat-selected/40 border-seat-selected/60 text-blue-200 ring-2 ring-seat-selected/50 hover:bg-seat-selected/50 hover:scale-110 cursor-pointer shadow-lg shadow-seat-selected/20',
};

const LEGEND = [
  { status: 'available', label: 'Available', color: 'bg-seat-available' },
  { status: 'selected', label: 'Selected', color: 'bg-seat-selected' },
  { status: 'held', label: 'Held', color: 'bg-seat-held' },
  { status: 'booked', label: 'Booked', color: 'bg-seat-booked' },
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
    <div className="space-y-5">
      {/* Stage indicator */}
      <div className="text-center">
        <div className="inline-block px-16 py-2 rounded-b-xl bg-gradient-to-b from-primary-600/30 to-transparent border border-t-0 border-primary-500/20 text-xs font-medium text-primary-400 uppercase tracking-widest">
          Stage
        </div>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col items-center gap-1.5 overflow-x-auto py-2">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-1.5">
            {/* Row label */}
            <span className="w-6 text-xs text-surface-500 font-mono text-right shrink-0">
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
            <span className="w-6 text-xs text-surface-500 font-mono shrink-0">
              {String.fromCharCode(65 + rowIdx)}
            </span>
          </div>
        ))}
      </div>

      {/* Column numbers */}
      <div className="flex items-center justify-center gap-1.5 px-8">
        <span className="w-6" />
        {Array.from({ length: columns }, (_, i) => (
          <span
            key={i}
            className="w-8 sm:w-9 text-center text-[10px] text-surface-500 font-mono"
          >
            {i + 1}
          </span>
        ))}
        <span className="w-6" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        {LEGEND.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-xs text-surface-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
