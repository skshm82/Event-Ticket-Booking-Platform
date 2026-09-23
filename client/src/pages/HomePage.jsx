import { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
        <div className="h-1.5 bg-slate-100 rounded-full mt-4" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEvents(category);
        if (!cancelled) {
          setEvents(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load events');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="space-y-10">
      {/* Hero (Sleek, minimal, modern, no gradients) */}
      <section className="text-center py-10 sm:py-14 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-2">
          <span>🇮🇳</span>
          <span>entrio · Live events in India</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Discover & Book Events in India
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto text-balance font-normal">
          Book concert tickets, cricket matches, stand-up comedy shows, and theater plays with live real-time seat reservation.
        </p>
      </section>

      {/* Category filter */}
      <CategoryFilter active={category} onChange={setCategory} />

      {/* Events grid */}
      <section id="events-grid">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
            <p className="text-rose-600 mb-4 font-medium">{error}</p>
            <button
              onClick={() => setCategory(category)}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white border border-slate-200 rounded-xl p-8">
            <span className="text-4xl block">🎪</span>
            <h2 className="text-lg font-bold text-slate-900">
              No events found
            </h2>
            <p className="text-sm text-slate-500">
              {category !== 'all'
                ? `No ${category} events available right now in this category.`
                : 'No events scheduled right now. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
