import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Edit2 } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { OutfitViewer } from './OutfitViewer';
import { UploadModal } from './UploadModal';

export function ItemDetailsModal({ item, onClose }) {
  const { savedOutfits, deleteItem, deleteOutfit, categories, updateItem } = useWardrobe();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOutfitToView, setSelectedOutfitToView] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!item) return null;

  const handleUpdate = (updatedItem) => {
    updateItem(updatedItem.id, updatedItem);
    setIsEditing(false);
    onClose();
  };

  const relatedOutfits = savedOutfits.filter(outfit => 
    outfit.items.some(oi => oi.wardrobeItemId === item.id)
  );

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteItem(item.id);
    setShowConfirm(false);
    onClose();
  };

  if (isEditing) {
    return (
      <UploadModal 
        isOpen={true} 
        onClose={() => setIsEditing(false)} 
        onUpload={handleUpdate} 
        itemToEdit={item} 
      />
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content item-details-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="item-details-layout">
          <div className="item-details-image">
            <img src={item.imageUrl} alt={item.name} />
          </div>
          
          <div className="item-details-info">
            <div style={{ display: 'inline-block', width: 'fit-content', backgroundColor: 'var(--bg-secondary)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {categories?.find(c => c.id === item.category)?.name || item.category}
            </div>
            <h2 className="modal-title" style={{ fontSize: '2.5rem', marginBottom: item.brand ? '0.2rem' : '1.5rem', lineHeight: 1.1 }}>{item.name}</h2>
            {item.brand && (
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 500 }}>
                {item.brand}
              </p>
            )}
            
            <div className="related-outfits-section">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem' }}>
                Used in {relatedOutfits.length} outfit{relatedOutfits.length !== 1 ? 's' : ''}
              </h3>
              
              {relatedOutfits.length > 0 ? (
                <div className="viewer-pieces-grid">
                  {relatedOutfits.map(outfit => (
                    <div 
                      key={outfit.id} 
                      className="related-outfit-thumb" 
                      title={outfit.name} 
                      onClick={() => setSelectedOutfitToView(outfit)}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      <div className="outfit-preview-container" style={{ padding: 0 }}>
                        {outfit.items.slice(0, 4).map((item, index) => (
                          <img 
                            key={item.id} 
                            src={item.imageUrl} 
                            alt="" 
                            className="outfit-preview-img"
                            style={{ 
                              position: 'absolute',
                              width: '45%',
                              height: '60%',
                              objectFit: 'cover',
                              zIndex: index,
                              transform: `translate(${index * 12 - 18}px, ${index * 8 - 12}px) rotate(${index % 2 === 0 ? 5 : -5}deg)`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  This item hasn't been used in any saved outfit yet.
                </p>
              )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              {showConfirm ? (
                <div className="delete-confirm-box">
                  <div className="delete-warning">
                    <AlertTriangle size={20} />
                    <span>
                      {relatedOutfits.length > 0 
                        ? `Warning! This item is used in ${relatedOutfits.length} outfit(s). If you delete it, those outfits will also be deleted. Are you sure?` 
                        : 'Are you sure you want to delete this item?'}
                    </span>
                  </div>
                  <div className="delete-actions-row">
                    <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                      Cancel
                    </button>
                    <button className="btn-danger" onClick={handleConfirmDelete}>
                      Yes, delete all
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ flex: 1, justifyContent: 'center' }}>
                    <Edit2 size={18} style={{ marginRight: '0.5rem' }} />
                    Edit
                  </button>
                  <button className="btn-danger" onClick={handleDeleteClick} style={{ flex: 1, justifyContent: 'center' }}>
                    <Trash2 size={18} style={{ marginRight: '0.5rem' }} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      
      <OutfitViewer 
        isOpen={selectedOutfitToView !== null}
        outfit={selectedOutfitToView}
        onClose={() => setSelectedOutfitToView(null)}
        onDelete={deleteOutfit}
      />
    </>
  );
}
