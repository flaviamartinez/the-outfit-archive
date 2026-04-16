import React, { useState } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight, Edit2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWardrobe } from '../context/WardrobeContext';
import { ItemDetailsModal } from './ItemDetailsModal';

export function OutfitViewer({ isOpen, outfit, onClose, onDelete }) {
  const navigate = useNavigate();
  const { items } = useWardrobe();
  const [selectedItemToView, setSelectedItemToView] = useState(null);
  const [viewMode, setViewMode] = useState('cover'); // 'cover' or 'canvas'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !outfit) return null;

  const handleEdit = () => {
    navigate('/creator', { state: { outfitToEdit: outfit } });
    onClose();
  };

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
                {new Date(outfit.dateAdded).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={handleEdit}
                title="Edit Outfit"
                style={{ height: 'fit-content', padding: '0.5rem 0.8rem' }}
              >
                <Edit2 size={18} />
                <span style={{ fontSize: '0.9rem', marginLeft: '0.3rem' }}>Edit</span>
              </button>
              <button 
                className="btn-danger" 
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Outfit"
                style={{ height: 'fit-content', padding: '0.5rem 0.8rem' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="delete-confirm-overlay" style={{ marginTop: '1rem', padding: '1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '1rem' }}>
                <AlertTriangle size={20} />
                <h4 style={{ margin: 0, fontWeight: 600 }}>Delete this outfit?</h4>
              </div>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                This action cannot be undone. Are you sure you want to remove this look from your collection?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn-danger" 
                  style={{ flex: 1, padding: '0.75rem' }}
                  onClick={() => {
                    onDelete(outfit.id);
                    onClose();
                    setShowDeleteConfirm(false);
                  }}
                >
                  Yes, Delete
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '0.75rem' }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
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
