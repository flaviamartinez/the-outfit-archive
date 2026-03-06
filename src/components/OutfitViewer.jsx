import React from 'react';
import { X, Trash2 } from 'lucide-react';

export function OutfitViewer({ isOpen, outfit, onClose, onDelete }) {
  if (!isOpen || !outfit) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content outfit-viewer-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
          <X size={24} />
        </button>

        <div className="viewer-header">
          <h2 className="modal-title viewer-title">{outfit.name}</h2>
          <button 
            className="btn-danger" 
            onClick={() => {
              if (window.confirm('¿Seguro que deseas eliminar este outfit?')) {
                onDelete(outfit.id);
                onClose();
              }
            }}
            title="Eliminar Outfit"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <p className="viewer-date">
          Creado el: {new Date(outfit.dateCreated).toLocaleDateString()}
        </p>

        <div className="viewer-canvas">
          {outfit.items.map(item => (
            <div
              key={item.id}
              className="viewer-item"
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                zIndex: item.zIndex,
              }}
            >
              <img src={item.imageUrl} alt="" draggable={false} />
            </div>
          ))}
        </div>

        <div className="viewer-pieces">
          <h3>Prendas en este look ({outfit.items.length})</h3>
          <div className="viewer-pieces-grid">
            {outfit.items.map(item => (
              <div key={item.wardrobeItemId} className="viewer-piece-thumb">
                <img src={item.imageUrl} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
