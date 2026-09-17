import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-950">
        {/* Gradient background glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-600/10 blur-3xl" />
        </div>

        {/* Navbar placeholder */}
        <nav className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎫</span>
                <span className="text-xl font-bold gradient-text">EventBook</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="badge-info">Demo User</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              EventBook
            </h1>
            <p className="text-xl text-surface-400 mb-8">
              Real-time event ticket booking platform
            </p>
            <div className="glass-card p-8 max-w-md mx-auto">
              <p className="text-surface-300 mb-4">
                ✅ React + Vite + Tailwind CSS v3 configured
              </p>
              <p className="text-surface-400 text-sm">
                Day 1 scaffolding complete. Routes and pages coming on Day 3.
              </p>
            </div>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
