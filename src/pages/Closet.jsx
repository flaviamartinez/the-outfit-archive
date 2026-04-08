import { useState } from 'react';
import { CategoryFilter } from '../components/CategoryFilter';
import { WardrobeGrid } from '../components/WardrobeGrid';
import { UploadModal } from '../components/UploadModal';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { Settings } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { ItemDetailsModal } from '../components/ItemDetailsModal';
import { ManageCategoriesModal } from '../components/ManageCategoriesModal';

export function Closet({ isUploadModalOpen, onCloseModal }) {
  const { items, addItem, categories } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  // Filter items based on active category
  const filteredItems = items.filter(item => {
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => setIsManageCategoriesOpen(true)}
          title="Manage Categories"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <Settings size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }} className="hidden md-inline">Configure</span>
        </button>
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

      <ManageCategoriesModal 
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />
    </main>
  );
}
