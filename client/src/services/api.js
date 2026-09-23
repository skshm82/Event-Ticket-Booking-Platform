import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('entrio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // If 401 and not on an auth endpoint, clear token (session expired)
    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith('/auth')
    ) {
      localStorage.removeItem('entrio_token');
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// ── Auth ─────────────────────────────────────────────────

export const registerUser = (name, phone, password) => {
  return api.post('/auth/register', { name, phone, password });
};

export const loginUser = (phone, password) => {
  return api.post('/auth/login', { phone, password });
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

// ── Events ───────────────────────────────────────────────

export const getEvents = (category) => {
  const params = {};
  if (category && category !== 'all') params.category = category;
  return api.get('/events', { params });
};

export const getEventById = (id) => {
  return api.get(`/events/${id}`);
};

// ── Seats ────────────────────────────────────────────────

export const getSeatsByEvent = (eventId) => {
  return api.get(`/events/${eventId}/seats`);
};

// ── Bookings ─────────────────────────────────────────────

export const holdSeats = (eventId, seatIds, userId) => {
  return api.post('/bookings/hold', { eventId, seatIds, userId });
};

export const confirmBooking = (eventId, seatIds, userId) => {
  return api.post('/bookings/confirm', { eventId, seatIds, userId });
};

export const cancelBooking = (bookingId, userId) => {
  return api.post(`/bookings/${bookingId}/cancel`, { userId });
};

export const getBookings = (userId) => {
  return api.get('/bookings', { params: { userId } });
};

export const getBookingById = (id) => {
  return api.get(`/bookings/${id}`);
};

export default api;
