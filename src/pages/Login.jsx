import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/'); // Redirigir al clóset tras inicio exitoso
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('El inicio de sesión fue cancelado.');
      } else {
        setError('Ocurrió un error al iniciar sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">The Outfit Archive</h1>
        <p className="login-subtitle">Tu clóset personal en la nube. Inicia sesión para empezar a armar tus mejores looks.</p>
        
        {error && <div className="login-error">{error}</div>}

        <button className="btn-google" onClick={handleGoogleLogin}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="google-icon" />
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
