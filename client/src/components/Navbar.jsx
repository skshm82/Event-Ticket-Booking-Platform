import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Browse Events', icon: '🎪' },
  { to: '/bookings', label: 'My Bookings', icon: '🎟️' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav
      id="navbar"
      className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
              🎫
            </span>
            <span className="text-xl font-bold gradient-text">EventBook</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
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
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-600/20 text-primary-300'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                    }
                  `}
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Demo user badge */}
            <div className="ml-3 pl-3 border-l border-surface-700">
              <span className="badge-info" id="nav-user-badge">
                Demo User
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
