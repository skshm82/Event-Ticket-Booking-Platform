import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, getSeatsByEvent, holdSeats, confirmBooking } from '../services/api';
import { getSocket } from '../services/socket';
import { useToast } from '../hooks/useToast';
import SeatMap from '../components/SeatMap';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_USER = 'demo-user';

const CATEGORY_COLORS = {
  concert: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  sports: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  theater: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  comedy: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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

export default function EventDetailPage() {
  const { id } = useParams();
  const toast = useToast();

  // Data states
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking flow states
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [holdData, setHoldData] = useState(null); // { expiresAt }
  const [bookingStep, setBookingStep] = useState('select'); // 'select' | 'held' | 'confirming' | 'confirmed'
  const [processing, setProcessing] = useState(false);

  // Fetch event and seats
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventRes, seatsRes] = await Promise.all([
        getEventById(id),
        getSeatsByEvent(id),
      ]);
      setEvent(eventRes.data);
      setSeats(seatsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Socket.io: join event room for real-time updates
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join:event', { eventId: id });

    socket.on('seats:updated', (data) => {
      if (data.eventId === id && data.seats) {
        setSeats((prev) => {
          const updated = [...prev];
          data.seats.forEach((updatedSeat) => {
            const idx = updated.findIndex((s) => s._id === updatedSeat._id);
            if (idx !== -1) updated[idx] = updatedSeat;
          });
          return updated;
        });
      }
    });

    return () => {
      socket.emit('leave:event', { eventId: id });
      socket.off('seats:updated');
    };
  }, [id]);

  // Handle seat click
  const handleSeatClick = (seat) => {
    if (bookingStep !== 'select') return;

    setSelectedSeatIds((prev) => {
      if (prev.includes(seat._id)) {
        return prev.filter((sid) => sid !== seat._id);
      }
      if (prev.length >= 6) {
        toast.info('Maximum 6 seats per booking');
        return prev;
      }
      return [...prev, seat._id];
    });
  };

  // Hold seats
  const handleHoldSeats = async () => {
    if (selectedSeatIds.length === 0) return;

    setProcessing(true);
    try {
      const res = await holdSeats(id, selectedSeatIds, DEMO_USER);
      setHoldData({
        expiresAt: res.data.expiresAt,
      });
      setBookingStep('held');
      toast.success(`${selectedSeatIds.length} seat(s) held for 5 minutes`);

      // Refresh seats to see updated status
      const seatsRes = await getSeatsByEvent(id);
      setSeats(seatsRes.data);
    } catch (err) {
      toast.error(err.message || 'Failed to hold seats');
      // Some seats may no longer be available, refresh
      const seatsRes = await getSeatsByEvent(id);
      setSeats(seatsRes.data);
      setSelectedSeatIds([]);
    } finally {
      setProcessing(false);
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    setProcessing(true);
    setBookingStep('confirming');
    try {
      await confirmBooking(id, selectedSeatIds, DEMO_USER);
      setBookingStep('confirmed');
      toast.success('Booking confirmed! 🎉');

      // Refresh seats
      const seatsRes = await getSeatsByEvent(id);
      setSeats(seatsRes.data);
      setSelectedSeatIds([]);
      setHoldData(null);
    } catch (err) {
      toast.error(err.message || 'Failed to confirm booking');
      setBookingStep('held');
    } finally {
      setProcessing(false);
    }
  };

  // Hold expired
  const handleHoldExpired = () => {
    toast.error('Hold expired. Seats have been released.');
    setBookingStep('select');
    setSelectedSeatIds([]);
    setHoldData(null);
    loadData(); // Refresh all data
  };

  // Reset to start over
  const handleReset = () => {
    setBookingStep('select');
    setSelectedSeatIds([]);
    setHoldData(null);
  };

  // Get selected seat labels
  const selectedLabels = seats
    .filter((s) => selectedSeatIds.includes(s._id))
    .map((s) => s.label);

  const totalPrice = event ? selectedSeatIds.length * event.price : 0;

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading event..." />;
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <span className="text-5xl block">😕</span>
        <p className="text-red-400">{error}</p>
        <Link to="/" className="btn-secondary inline-block">
          ← Back to Events
        </Link>
      </div>
    );
  }

  if (!event) return null;

  const catColors = CATEGORY_COLORS[event.category] || '';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 transition-colors"
        id="back-to-events"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      {/* Event header */}
      <section className="glass-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${catColors}`}
              >
                {event.category}
              </span>
              <span className="badge-success">{event.availableSeats} seats left</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-surface-100">{event.title}</h1>
            {event.description && (
              <p className="text-surface-400 max-w-2xl">{event.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-primary-400">${event.price}</p>
            <p className="text-sm text-surface-500">per seat</p>
          </div>
        </div>

        {/* Event meta */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-surface-800">
          <div className="flex items-center gap-2 text-surface-300">
            <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.venue?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-surface-300">
            <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-surface-300">
            <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(event.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-surface-300">
            <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>
              {event.venue?.rows} × {event.venue?.columns} ({event.totalSeats} total seats)
            </span>
          </div>
        </div>
      </section>

      {/* Main content: seat map + booking panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-surface-200 mb-4">Select Your Seats</h2>
            <SeatMap
              seats={seats}
              rows={event.venue?.rows || 0}
              columns={event.venue?.columns || 0}
              selectedSeatIds={selectedSeatIds}
              onSeatClick={handleSeatClick}
              disabled={bookingStep !== 'select'}
            />
          </div>
        </div>

        {/* Booking panel */}
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-surface-200">Booking Summary</h2>

            {/* Selected seats */}
            {selectedSeatIds.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-400">Selected Seats</span>
                  <span className="text-surface-300">{selectedSeatIds.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLabels.map((label) => (
                    <span
                      key={label}
                      className="inline-block px-2 py-1 bg-seat-selected/20 border border-seat-selected/30 rounded-md text-xs font-mono text-blue-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t border-surface-800 flex items-center justify-between">
                  <span className="text-surface-400">Total</span>
                  <span className="text-2xl font-bold text-surface-100">
                    ${totalPrice}
                  </span>
                </div>
                <p className="text-xs text-surface-500">
                  {selectedSeatIds.length} × ${event.price} per seat
                </p>
              </div>
            ) : (
              <p className="text-sm text-surface-500 py-4 text-center">
                Click on available seats to select them
              </p>
            )}

            {/* Countdown timer */}
            {holdData && bookingStep === 'held' && (
              <CountdownTimer
                expiresAt={holdData.expiresAt}
                onExpire={handleHoldExpired}
              />
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {bookingStep === 'select' && (
                <button
                  id="hold-seats-btn"
                  onClick={handleHoldSeats}
                  disabled={selectedSeatIds.length === 0 || processing}
                  className="btn-primary w-full"
                >
                  {processing
                    ? 'Holding...'
                    : `Hold ${selectedSeatIds.length || ''} Seat${selectedSeatIds.length !== 1 ? 's' : ''}`}
                </button>
              )}

              {bookingStep === 'held' && (
                <>
                  <button
                    id="confirm-booking-btn"
                    onClick={handleConfirmBooking}
                    disabled={processing}
                    className="btn-primary w-full"
                  >
                    {processing ? 'Confirming...' : `Confirm Booking — $${totalPrice}`}
                  </button>
                  <button
                    id="cancel-hold-btn"
                    onClick={handleReset}
                    disabled={processing}
                    className="btn-secondary w-full"
                  >
                    Cancel & Release Seats
                  </button>
                </>
              )}

              {bookingStep === 'confirming' && (
                <div className="text-center py-4">
                  <LoadingSpinner size="sm" text="Processing payment..." />
                </div>
              )}

              {bookingStep === 'confirmed' && (
                <div className="text-center space-y-3">
                  <div className="py-4">
                    <span className="text-4xl block mb-2">🎉</span>
                    <p className="text-lg font-semibold text-green-400">
                      Booking Confirmed!
                    </p>
                  </div>
                  <Link to="/bookings" className="btn-primary w-full inline-block text-center">
                    View My Bookings
                  </Link>
                  <button onClick={handleReset} className="btn-secondary w-full">
                    Book More Seats
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
