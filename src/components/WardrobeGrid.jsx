import React from 'react';
import { ItemCard } from './ItemCard';

export function WardrobeGrid({ items, onItemClick }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No items found in this category.</p>
      </div>
    );
  }

  return (
    <div className="wardrobe-grid">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
}
