import React from 'react';
import { useWardrobe } from '../context/WardrobeContext';

export function ItemCard({ item, onClick }) {
  const { categories } = useWardrobe();
  const categoryName = categories?.find(c => c.id === item.category)?.name || item.category;

  return (
    <div className="item-card" onClick={() => onClick && onClick(item)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="item-image-wrapper">
        <img src={item.imageUrl} alt={categoryName} className="item-image" loading="lazy" />
      </div>
      <div className="item-details">
        <h3 className="item-name" style={{ fontSize: '1.1rem', marginBottom: item.brand ? '0.1rem' : '0.25rem', textTransform: 'capitalize' }}>{categoryName}</h3>
        {item.brand && <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.brand}</p>}
      </div>
    </div>
  );
}
