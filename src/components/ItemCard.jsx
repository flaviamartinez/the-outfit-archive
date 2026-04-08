import React from 'react';
import { useWardrobe } from '../context/WardrobeContext';

export function ItemCard({ item, onClick }) {
  const { categories } = useWardrobe();
  const categoryName = categories?.find(c => c.id === item.category)?.name || item.category;

  return (
    <div className="item-card" onClick={() => onClick && onClick(item)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="item-image-wrapper">
        <img src={item.imageUrl} alt={item.name} className="item-image" loading="lazy" />
      </div>
      <div className="item-details">
        <p className="item-category" style={{ display: 'inline-block', width: 'fit-content', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', opacity: 0.9, marginBottom: '0.4rem' }}>{categoryName}</p>
        <h3 className="item-name" style={{ fontSize: '1.1rem', marginBottom: item.brand ? '0.1rem' : '0.25rem' }}>{item.name}</h3>
        {item.brand && <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.brand}</p>}
      </div>
    </div>
  );
}
