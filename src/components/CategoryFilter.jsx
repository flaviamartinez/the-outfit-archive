import React from 'react';

export function CategoryFilter({ categories = [], activeCategory, onCategoryChange }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
      <div className="category-filter" style={{ marginBottom: subCategories.length > 0 ? 0 : '1rem' }}>
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
