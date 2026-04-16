import { useState } from 'react';
import { CategoryFilter } from '../components/CategoryFilter';
import { WardrobeGrid } from '../components/WardrobeGrid';
import { UploadModal } from '../components/UploadModal';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { useWardrobe } from '../context/WardrobeContext';
import { ItemDetailsModal } from '../components/ItemDetailsModal';

export function Closet({ isUploadModalOpen, onCloseModal, onAddClick }) {
  const { items, addItem, categories } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter items based on active category and search
  const filteredItems = items.filter(item => {
    // Check search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.name?.toLowerCase().includes(q);
      const matchesBrand = item.brand?.toLowerCase().includes(q);
      if (!matchesName && !matchesBrand) return false;
    }

    if (activeCategory === 'all') return true;
    
    // Check if the item's category matches the active category
    if (item.category === activeCategory) return true;
    
    // Check if the item's category is a subcategory of the active category
    const itemCatObj = categories.find(c => c.id === item.category);
    if (itemCatObj && itemCatObj.parentId === activeCategory) return true;
    
    return false;
  });

  const handleUploadItem = (newItem) => {
    addItem(newItem);
  };

  return (
    <main>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={onAddClick}
          />
        </div>
      </div>
      
      <WardrobeGrid items={filteredItems} onItemClick={setSelectedItem} />

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={onCloseModal} 
        onUpload={handleUploadItem} 
      />

      <ItemDetailsModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}
