import { Link, useLocation } from 'react-router-dom';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header({ onAddClick }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-brand">
        <h1 className="header-title">The Outfit Archive</h1>
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Mi Clóset
          </Link>
          <Link 
            to="/creator" 
            className={`nav-link ${location.pathname === '/creator' ? 'active' : ''}`}
          >
            Creador
          </Link>
          <Link 
            to="/outfits" 
            className={`nav-link ${location.pathname === '/outfits' ? 'active' : ''}`}
          >
            Mis Outfits
          </Link>
        </nav>
      </div>
      <div className="header-actions">
        {location.pathname === '/' && (
          <button className="btn-primary" onClick={onAddClick}>
            <Plus size={20} />
            <span>Añadir Prenda</span>
          </button>
        )}
        
        {user && (
          <div className="user-profile">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Profile" className="user-avatar" />
            <button className="btn-logout" onClick={logout} title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
