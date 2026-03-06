import React from 'react';

export function ItemCard({ item }) {
  return (
    <div className="item-card">
      <div className="item-image-wrapper">
        <img src={item.imageUrl} alt={item.name} className="item-image" loading="lazy" />
      </div>
      <div className="item-details">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-category">{item.category}</p>
      </div>
    </div>
  );
}
