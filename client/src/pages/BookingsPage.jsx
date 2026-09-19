import { useState, useEffect } from 'react';
import { getBookings, cancelBooking } from '../services/api';
import { useToast } from '../hooks/useToast';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_USER = 'demo-user';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsPage() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBookings(DEMO_USER);
      setBookings(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, DEMO_USER);
      toast.success('Booking cancelled');
      // Update locally
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : b
        )
      );
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your bookings..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">My Bookings</h1>
          <p className="text-surface-400 mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-surface-900 rounded-xl p-1 border border-surface-800">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              id={`filter-status-${f.key}`}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === f.key
                  ? 'bg-surface-700 text-surface-100'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={fetchBookings} className="btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Bookings list */}
      {!error && filteredBookings.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <span className="text-5xl block">🎟️</span>
          <h2 className="text-xl font-semibold text-surface-300">
            {statusFilter === 'all'
              ? 'No bookings yet'
              : `No ${statusFilter} bookings`}
          </h2>
          <p className="text-surface-500">
            {statusFilter === 'all'
              ? 'Browse events and book your first tickets!'
              : 'Try a different filter to see more bookings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
