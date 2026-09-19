import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24 space-y-6 animate-fade-in">
      <span className="text-8xl block">🔍</span>
      <h1 className="text-4xl font-bold text-surface-200">Page Not Found</h1>
      <p className="text-lg text-surface-400 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary inline-block" id="back-home-btn">
        ← Back to Events
      </Link>
    </div>
  );
}
