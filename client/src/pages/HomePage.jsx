import { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';
import LoadingSpinner from '../components/LoadingSpinner';

function SkeletonCard() {
  return (
    <div className="glass-card animate-pulse">
      <div className="h-32 rounded-t-2xl bg-surface-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-surface-800 rounded w-3/4" />
        <div className="h-4 bg-surface-800 rounded w-1/2" />
        <div className="h-4 bg-surface-800 rounded w-2/3" />
        <div className="h-1.5 bg-surface-800 rounded-full mt-4" />
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
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold gradient-text leading-tight">
          Find & Book Amazing Events
        </h1>
        <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto text-balance">
          Discover concerts, sports, theater, and comedy. Pick your seats in real-time
          and book instantly.
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
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => setCategory(category)}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <span className="text-5xl block">🎪</span>
            <h2 className="text-xl font-semibold text-surface-300">
              No events found
            </h2>
            <p className="text-surface-500">
              {category !== 'all'
                ? `No ${category} events available right now. Try a different category.`
                : 'No events available right now. Check back soon!'}
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
