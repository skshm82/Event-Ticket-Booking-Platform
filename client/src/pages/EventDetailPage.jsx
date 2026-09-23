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
  concert: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  theater: 'bg-amber-50 text-amber-800 border-amber-200',
  comedy: 'bg-rose-50 text-rose-700 border-rose-200',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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
    loadData();
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
      <div className="text-center py-16 space-y-4 bg-white border border-slate-200 rounded-xl p-8 max-w-md mx-auto">
        <span className="text-4xl block">😕</span>
        <p className="text-rose-600 font-medium">{error}</p>
        <Link to="/" className="btn-secondary inline-block">
          ← Back to Events
        </Link>
      </div>
    );
  }

  if (!event) return null;

  const catColors = CATEGORY_COLORS[event.category] || '';

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        id="back-to-events"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      {/* Event header card with picture (Light mode, sleek white, no gradients) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {event.imageUrl && (
          <div className="h-48 sm:h-64 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${catColors} bg-white/95 backdrop-blur-xs shadow-xs`}
              >
                <span className="capitalize">{event.category}</span>
              </span>
            </div>
          </div>
        )}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-3">
              {!event.imageUrl && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catColors}`}
                  >
                    <span className="capitalize">{event.category}</span>
                  </span>
                  <span className="badge badge-success">{event.availableSeats} seats left</span>
                </div>
              )}
              {event.imageUrl && (
                <div>
                  <span className="badge badge-success">{event.availableSeats} seats left</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{event.title}</h1>
              {event.description && (
                <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">{event.description}</p>
              )}
            </div>
            <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹{event.price?.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 font-medium">per seat</p>
            </div>
          </div>

        {/* Event meta */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.venue?.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(event.time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>
              {event.venue?.rows} × {event.venue?.columns} ({event.totalSeats} seats)
            </span>
          </div>
        </div>
      </div>
    </section>

      {/* Main content: seat map + booking panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Select Your Seats</h2>
              <span className="text-xs text-slate-500 font-medium">Max 6 seats per booking</span>
            </div>
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 lg:sticky lg:top-24 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Booking Summary</h2>

            {/* Selected seats */}
            {selectedSeatIds.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">Selected Seats</span>
                  <span className="font-bold text-slate-900">{selectedSeatIds.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLabels.map((label) => (
                    <span
                      key={label}
                      className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-bold text-slate-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Total Amount</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{totalPrice?.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedSeatIds.length} × ₹{event.price?.toLocaleString('en-IN')} per seat (Inclusive of GST)
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center font-normal">
                Click on any green available seat on the map to select it
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
            <div className="space-y-2 pt-2">
              {bookingStep === 'select' && (
                <button
                  id="hold-seats-btn"
                  onClick={handleHoldSeats}
                  disabled={selectedSeatIds.length === 0 || processing}
                  className="btn-primary w-full"
                >
                  {processing
                    ? 'Holding Seats...'
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
                    {processing ? 'Confirming...' : `Pay & Confirm — ₹${totalPrice?.toLocaleString('en-IN')}`}
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
                  <LoadingSpinner size="sm" text="Securing your tickets..." />
                </div>
              )}

              {bookingStep === 'confirmed' && (
                <div className="text-center space-y-3 pt-2">
                  <div className="py-2">
                    <span className="text-4xl block mb-1">🎉</span>
                    <p className="text-base font-bold text-emerald-700">
                      Booking Confirmed!
                    </p>
                    <p className="text-xs text-slate-500 mt-1">E-ticket details sent</p>
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
