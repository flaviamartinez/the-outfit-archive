import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { loginWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        // Supabase might require email confirmation depending on settings
        alert('Account created. If Supabase requires confirmation, check your email. Otherwise, try logging in.');
        setIsSignUp(false);
      } else {
        await loginWithEmail(email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing the request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">The Outfit Archive</h1>
        <p className="login-subtitle">Your personal cloud closet. Log in to start creating your best looks.</p>
        
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
            {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Log In')}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account?' : `Don't have an account?`}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', marginLeft: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
          >
            {isSignUp ? 'Log in here' : 'Create one here'}
          </button>
        </p>

      </div>
    </div>
  );
}
