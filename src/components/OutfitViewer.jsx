import React, { useState } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { ItemDetailsModal } from './ItemDetailsModal';

export function OutfitViewer({ isOpen, outfit, onClose, onDelete }) {
  const { items } = useWardrobe();
  const [selectedItemToView, setSelectedItemToView] = useState(null);
  const [viewMode, setViewMode] = useState('cover'); // 'cover' or 'canvas'

  if (!isOpen || !outfit) return null;

  const hasCover = !!outfit.coverPhotoUrl;
  const currentMode = hasCover ? viewMode : 'canvas';

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content outfit-viewer-modal" style={{ paddingBottom: '1rem', display: 'flex', flexDirection: 'column' }}>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>

          <div className="viewer-header">
            <div>
              <h2 className="modal-title viewer-title">{outfit.name}</h2>
              <p className="viewer-date" style={{ marginBottom: 0 }}>
                {new Date(outfit.dateCreated).toLocaleDateString()}
              </p>
            </div>
            <button 
              className="btn-danger" 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this outfit?')) {
                  onDelete(outfit.id);
                  onClose();
                }
              }}
              title="Delete Outfit"
              style={{ height: 'fit-content' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <div className="viewer-display-area" style={{ position: 'relative', flex: 1, minHeight: '350px', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            
            <div className="viewer-main-content" style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              
              {/* Cover View */}
              {hasCover && currentMode === 'cover' && (
                <div className="viewer-cover-full" style={{ width: '100%', height: '100%' }}>
                  <img src={outfit.coverPhotoUrl} alt={outfit.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}

              {/* Canvas View */}
              {currentMode === 'canvas' && (
                <div className="viewer-canvas" style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                      <img src={item.imageUrl} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Arrows */}
              {hasCover && (
                <>
                  <button 
                    onClick={() => setViewMode(viewMode === 'cover' ? 'canvas' : 'cover')}
                    style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', zIndex: 10 }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode(viewMode === 'cover' ? 'canvas' : 'cover')}
                    style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', zIndex: 10 }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* View Indicators */}
            {hasCover && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <div 
                  onClick={() => setViewMode('cover')}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentMode === 'cover' ? 'var(--accent-color)' : 'var(--border-color)', cursor: 'pointer', transition: '0.2s' }} 
                />
                <div 
                  onClick={() => setViewMode('canvas')}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentMode === 'canvas' ? 'var(--accent-color)' : 'var(--border-color)', cursor: 'pointer', transition: '0.2s' }} 
                />
              </div>
            )}
          </div>

          <div className="viewer-pieces" style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.75rem' }}>Items ({outfit.items.length})</h3>
            <div className="viewer-pieces-grid">
              {outfit.items.map(item => {
                const fullItem = items.find(i => i.id === item.wardrobeItemId);
                return (
                  <div 
                    key={item.wardrobeItemId} 
                    className="viewer-piece-thumb"
                    onClick={() => fullItem && setSelectedItemToView(fullItem)}
                    style={{ cursor: fullItem ? 'pointer' : 'default', transition: 'all 0.2s', border: '2px solid transparent' }}
                    onMouseOver={(e) => {
                      if(fullItem) e.currentTarget.style.borderColor = 'var(--accent-color)';
                    }}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <img src={item.imageUrl} alt="" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ItemDetailsModal 
        item={selectedItemToView}
        onClose={() => setSelectedItemToView(null)}
      />
    </>
  );
}
