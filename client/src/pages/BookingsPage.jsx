import { useState, useEffect } from 'react';
import { getBookings, cancelBooking } from '../services/api';
import { useToast } from '../hooks/useToast';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_USER = 'demo-user';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Bookings' },
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
      toast.success('Booking cancelled successfully');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''} on record
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              id={`filter-status-${f.key}`}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === f.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-8 bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-rose-600 font-medium mb-3">{error}</p>
          <button onClick={fetchBookings} className="btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Bookings list */}
      {!error && filteredBookings.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white border border-slate-200 rounded-xl p-8">
          <span className="text-4xl block">🎟️</span>
          <h2 className="text-lg font-bold text-slate-900">
            {statusFilter === 'all'
              ? 'No bookings yet'
              : `No ${statusFilter} bookings found`}
          </h2>
          <p className="text-sm text-slate-500">
            {statusFilter === 'all'
              ? 'Browse upcoming events in India and book your tickets!'
              : 'Try switching filters to view your other bookings.'}
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
