import React, { useState } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { OutfitViewer } from '../components/OutfitViewer';

export function SavedOutfits() {
  const { savedOutfits, deleteOutfit } = useWardrobe();
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  if (savedOutfits.length === 0) {
    return (
      <main className="empty-state">
        <p>You haven't created any outfits yet. Go to the Creator to build your first look!</p>
      </main>
    );
  }

  return (
    <main>
      <div className="wardrobe-grid">
        {savedOutfits.map(outfit => (
          <div 
            key={outfit.id} 
            className="item-card outfit-card"
            onClick={() => setSelectedOutfit(outfit)}
          >
            <div className="outfit-preview-container" style={{ padding: outfit.coverPhotoUrl ? 0 : '2rem' }}>
              {outfit.coverPhotoUrl ? (
                <img 
                  src={outfit.coverPhotoUrl} 
                  alt={outfit.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                />
              ) : (
                <>
                  {outfit.items.slice(0, 4).map((item, index) => (
                    <img 
                      key={item.id} 
                      src={item.imageUrl} 
                      alt="" 
                      className="outfit-preview-img"
                      style={{ 
                        zIndex: index,
                        transform: `translate(${index * 15}px, ${index * 10}px) rotate(${index % 2 === 0 ? 5 : -5}deg)`
                      }}
                    />
                  ))}
                  {outfit.items.length > 4 && (
                    <div className="outfit-more-items">+{outfit.items.length - 4}</div>
                  )}
                </>
              )}
            </div>
            <div className="item-details outfit-details">
              <h3 className="item-name">{outfit.name}</h3>
              <p className="item-category">
                {new Date(outfit.dateAdded).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <OutfitViewer 
        isOpen={selectedOutfit !== null}
        outfit={selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        onDelete={deleteOutfit}
      />
    </main>
  );
}
