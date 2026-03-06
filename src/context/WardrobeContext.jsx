import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockWardrobe } from '../data/mockData';

const WardrobeContext = createContext();

export function useWardrobe() {
  return useContext(WardrobeContext);
}

export function WardrobeProvider({ children }) {
  // Load from localeStorage or fallback to mock data initially
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('wardrobeItems');
    if (saved) return JSON.parse(saved);
    return mockWardrobe;
  });

  const [savedOutfits, setSavedOutfits] = useState(() => {
    const saved = localStorage.getItem('wardrobeOutfits');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Save to persistence
  useEffect(() => {
    localStorage.setItem('wardrobeItems', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('wardrobeOutfits', JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  const addItem = (item) => setItems(prev => [item, ...prev]);
  const saveOutfit = (outfit) => setSavedOutfits(prev => [outfit, ...prev]);
  const deleteOutfit = (id) => setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));

  return (
    <WardrobeContext.Provider value={{ items, addItem, savedOutfits, saveOutfit, deleteOutfit }}>
      {children}
    </WardrobeContext.Provider>
  );
}
