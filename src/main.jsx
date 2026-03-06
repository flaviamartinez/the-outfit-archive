import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { WardrobeProvider } from './context/WardrobeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WardrobeProvider>
          <App />
        </WardrobeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
