import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

export function Toast({ message, isVisible, onClose, duration = 3000 }) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    let timeoutId;
    if (isVisible) {
      setShouldRender(true);
      timeoutId = setTimeout(() => {
        onClose();
      }, duration);
    } else {
      // Small delay to allow fade out animation
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
    
    return () => clearTimeout(timeoutId);
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  return (
    <div className={`toast-container ${isVisible ? 'toast-enter' : 'toast-exit'}`}>
      <div className="toast-content">
        <CheckCircle size={20} className="toast-icon success" />
        <p className="toast-message">{message}</p>
        <button className="toast-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
