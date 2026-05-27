import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="navbar-logo-icon"><Car size={24} color="white" /></div>
        <div className="navbar-logo-text">
          Pune<span>SafetyAI</span>
        </div>
      </Link>

      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          end
        >
          Home
        </NavLink>
        {user ? (
          <>
            <NavLink
              to="/map"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Live Maps
            </NavLink>
            <NavLink
              to="/predict"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Predict
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Analytics
            </NavLink>
            <span style={{ color: 'var(--text-main)', fontWeight: 600, marginLeft: '1rem' }}>
              Welcome, {user.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary" style={{ marginLeft: '10px' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-cta">Register Now</Link>
          </>
        )}
      </div>
    </nav>
  );
}
