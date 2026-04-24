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
            <img src={item.imageUrl} alt={categories?.find(c => c.id === item.category)?.name || item.category} />
          </div>
          
          <div className="item-details-info" style={{ alignItems: 'center', textAlign: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-full)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {categories?.find(c => c.id === item.category)?.name || item.category}
              </div>
              {item.brand && (
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {item.brand}
                </p>
              )}
            </div>
            
            <div className="related-outfits-section" style={{ width: '100%', marginTop: '1.5rem' }}>
              {relatedOutfits.length > 0 ? (
                <>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Used in {relatedOutfits.length} outfit{relatedOutfits.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="viewer-pieces-grid" style={{ justifyContent: 'center' }}>
                    {relatedOutfits.map(outfit => (
                      <div 
                        key={outfit.id} 
                        className="related-outfit-thumb" 
                        title={new Date(outfit.dateAdded).toLocaleDateString()} 
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
                </>
              ) : (
                <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Fresh in your closet!</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You can use this item to build new looks in the Outfit Creator.</p>
                </div>
              )}
            </div>

            <div style={{ paddingTop: '2rem', width: '100%' }}>
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
