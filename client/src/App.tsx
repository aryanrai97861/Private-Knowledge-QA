import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import AskPage from './pages/AskPage';
import StatusPage from './pages/StatusPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="brand-icon">🧠</span>
            <span className="brand-text">KnowledgeBase</span>
          </div>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Home
            </NavLink>
            <NavLink to="/documents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Documents
            </NavLink>
            <NavLink to="/ask" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Ask
            </NavLink>
            <NavLink to="/status" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Status
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/status" element={<StatusPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Private Knowledge Q&A — Built with React, ChromaDB & Gemini</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
