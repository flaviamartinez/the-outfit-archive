import { Link, useLocation } from 'react-router-dom';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header({ onAddClick }) {
  const location = useLocation();
  const { user, profile, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h1 className="header-title">The Outfit Archive</h1>
        {user && (
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/profile" title="View Profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img 
                src={profile?.avatar_url || user.photoURL || `https://ui-avatars.com/api/?name=${profile?.username || user.email}`} 
                alt="Profile" 
                className="user-avatar" 
                style={{ cursor: 'pointer', border: location.pathname === '/profile' ? '2px solid var(--accent-color)' : '2px solid transparent' }} 
              />
            </Link>
            <button className="btn-logout" onClick={logout} title="Log Out">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="header-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <nav className="header-nav" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            My Closet
          </Link>
          <Link 
            to="/creator" 
            className={`nav-link ${location.pathname === '/creator' ? 'active' : ''}`}
          >
            Creator
          </Link>
          <Link 
            to="/outfits" 
            className={`nav-link ${location.pathname === '/outfits' ? 'active' : ''}`}
          >
            My Outfits
          </Link>
        </nav>
        
        <div className="header-actions">
          {/* Add Item button moved to CategoryFilter */}
        </div>
      </div>
    </header>
  );
}
