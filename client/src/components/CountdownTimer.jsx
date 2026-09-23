import { useState, useEffect, useRef } from 'react';

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(() => calcRemaining(expiresAt));
  const intervalRef = useRef(null);

  function calcRemaining(expiryStr) {
    const diff = new Date(expiryStr).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  }

  useEffect(() => {
    setRemaining(calcRemaining(expiresAt));

    intervalRef.current = setInterval(() => {
      const secs = calcRemaining(expiresAt);
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(intervalRef.current);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 60;
  const progress = Math.min(100, (remaining / 300) * 100); // 300s = 5min

  return (
    <div
      id="countdown-timer"
      className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-colors ${
        isUrgent
          ? 'bg-rose-50 border-rose-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <svg
          className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : 'text-amber-700'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span
          className={`text-xs font-semibold ${
            isUrgent ? 'text-rose-700' : 'text-amber-800'
          }`}
        >
          Seat hold expires in
        </span>
      </div>

      <span
        className={`text-2xl font-bold font-mono tracking-tight ${
          isUrgent ? 'text-rose-700' : 'text-amber-900'
        }`}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>

      {/* Progress bar — Solid, no gradients */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? 'bg-rose-600' : 'bg-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
