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
        <h3 className="item-name">{item.name}</h3>
        <p className="item-category">{categoryName}</p>
      </div>
    </div>
  );
}
