import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Menu from './pages/Menu';
import Tables from './pages/Tables';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simple Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-black text-emerald-600 tracking-tight">SaborExpress</h1>
            <nav className="flex gap-6">
              <Link to="/" className="text-gray-600 font-medium hover:text-emerald-600 transition-colors">Cardápio</Link>
              <Link to="/mesas" className="text-gray-600 font-medium hover:text-emerald-600 transition-colors">Mesas</Link>
              <a href="#" className="text-gray-600 font-medium hover:text-emerald-600 transition-colors">Cozinha</a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/mesas" element={<Tables />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App
