import React from 'react';
import { Search, Plus } from 'lucide-react';

export function CategoryFilter({ categories = [], activeCategory, onCategoryChange, searchQuery, onSearchChange, onAddClick }) {
  const allCategories = categories;
  
  // Find current active category object
  const activeObj = allCategories.find(c => c.id === activeCategory);
  const isAll = activeCategory === 'all';
  
  // Determine parent level
  const activeParentId = isAll 
    ? 'all' 
    : (activeObj?.parentId ? activeObj.parentId : activeCategory);

  // Top level categories (no parentId)
  const topLevelCategories = allCategories.filter(c => !c.parentId);

  // Subcategories for the selected parent
  const subCategories = allCategories.filter(c => c.parentId === activeParentId);

  return (
    <div className="category-filter-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
      <div className="category-top-row">
        <div className="category-filter" style={{ flex: 1, margin: 0, alignItems: 'center' }}>
          {topLevelCategories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${activeParentId === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="search-add-container" style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
          <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search your wardrobe..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                padding: '0.6rem 1rem 0.6rem 2.4rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'all var(--transition-fast)',
                width: '100%',
                maxWidth: '240px'
              }}
            />
          </div>
          
          {onAddClick && (
            <button 
              className="btn-primary" 
              onClick={onAddClick}
              style={{ padding: '0 1rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
            >
              <Plus size={20} />
              <span className="add-btn-text">Add Item</span>
            </button>
          )}
        </div>
      </div>
      
      {subCategories.length > 0 && activeParentId !== 'all' && (
        <div className="category-filter sub-filter" style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', marginBottom: '1rem' }}>
          <button
             className={`category-tab ${activeCategory === activeParentId ? 'active' : ''}`}
             onClick={() => onCategoryChange(activeParentId)}
             style={{ transform: 'scale(0.9)' }}
          >
             All {allCategories.find(c => c.id === activeParentId)?.name}
          </button>
          {subCategories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
              style={{ transform: 'scale(0.9)' }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
