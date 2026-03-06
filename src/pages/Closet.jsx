import { useState } from 'react';
import { CategoryFilter } from '../components/CategoryFilter';
import { WardrobeGrid } from '../components/WardrobeGrid';
import { UploadModal } from '../components/UploadModal';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { useWardrobe } from '../context/WardrobeContext';

export function Closet({ isUploadModalOpen, onCloseModal }) {
  const { items, addItem } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter items based on active category
  const filteredItems = items.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleUploadItem = (newItem) => {
    addItem(newItem);
  };

  return (
    <main>
      <CategoryFilter 
        categories={INITIAL_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <WardrobeGrid items={filteredItems} />

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={onCloseModal} 
        onUpload={handleUploadItem} 
      />
    </main>
  );
}
