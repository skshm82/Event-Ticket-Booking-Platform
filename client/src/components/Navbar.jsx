import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Browse Events', icon: '🎪' },
  { to: '/bookings', label: 'My Bookings', icon: '🎟️' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      id="navbar"
      className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-extrabold text-sm tracking-tighter">
              e.
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              entrio
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.to === '/'
                  ? pathname === '/' || pathname.startsWith('/events')
                  : pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                    transition-colors duration-150
                    ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* User section */}
            <div className="ml-2 pl-2 sm:ml-3 sm:pl-3 border-l border-slate-200 flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span
                    className="hidden sm:inline text-sm font-semibold text-slate-700"
                    id="nav-user-name"
                  >
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    id="nav-logout-btn"
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  id="nav-login-link"
                  className="px-3 py-1.5 rounded-md text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
