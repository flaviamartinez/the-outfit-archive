import React from 'react';
import { ItemCard } from './ItemCard';

export function WardrobeGrid({ items }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontraron prendas en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="wardrobe-grid">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
