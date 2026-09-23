import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24 space-y-6">
      <span className="text-6xl block">🔍</span>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Page Not Found</h1>
      <p className="text-base text-slate-600 max-w-md mx-auto">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary inline-flex" id="back-home-btn">
        ← Back to Events
      </Link>
    </div>
  );
}
