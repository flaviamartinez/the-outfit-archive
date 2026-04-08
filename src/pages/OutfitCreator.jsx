import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { v4 as uuidv4 } from 'uuid';
import { Save, Trash2, Image as ImageIcon, Check, ChevronDown, Filter } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { Toast } from '../components/Toast';

export function OutfitCreator() {
  const { items, saveOutfit, categories } = useWardrobe();
  const [canvasItems, setCanvasItems] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [activeCategory, setActiveCategory] = useState({ parent: 'all', sub: 'all' });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleAddItemToCanvas = (item) => {
    const newItemPos = {
      id: uuidv4(),
      wardrobeItemId: item.id,
      imageUrl: item.imageUrl,
      x: 50 + Math.random() * 50,
      y: 50 + Math.random() * 50,
      width: 150,
      height: 200, // Approximate starting ratio
      zIndex: canvasItems.length + 1
    };
    setCanvasItems([...canvasItems, newItemPos]);
  };

  const handleDragStartFromSidebar = (e, item) => {
    e.dataTransfer.setData('wardrobeItemId', item.id);
  };

  const handleDropOnCanvas = (e) => {
    e.preventDefault();
    const wardrobeItemId = e.dataTransfer.getData('wardrobeItemId');
    if (!wardrobeItemId) return;
    
    const item = items.find(i => i.id === wardrobeItemId);
    if (!item) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const newItemPos = {
      id: uuidv4(),
      wardrobeItemId: item.id,
      imageUrl: item.imageUrl,
      x: x - 75,
      y: y - 100,
      width: 150,
      height: 200,
      zIndex: canvasItems.length + 1
    };
    setCanvasItems([...canvasItems, newItemPos]);
  };

  const handleDragOverCanvas = (e) => {
    e.preventDefault();
  };

  const handleRemoveFromCanvas = (id) => {
    setCanvasItems(canvasItems.filter(item => item.id !== id));
  };

  const bringToFront = (id) => {
    setCanvasItems(items => items.map(item => {
      if (item.id === id) {
        return { ...item, zIndex: Math.max(...items.map(i => i.zIndex || 0)) + 1 };
      }
      return item;
    }));
  };

  const handleDragStop = (id, d) => {
    setCanvasItems(items => items.map(item => 
      item.id === id ? { ...item, x: d.x, y: d.y } : item
    ));
  };

  const handleResizeStop = (id, ref, position) => {
    setCanvasItems(items => items.map(item => 
      item.id === id ? { 
        ...item, 
        width: ref.style.width, 
        height: ref.style.height,
        x: position.x,
        y: position.y
      } : item
    ));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveOutfit = async () => {
    if (!outfitName || canvasItems.length === 0) return;
    
    let coverPhotoUrl = null;
    
    // Upload cover photo if exists
    if (coverPhoto) {
      const { data: { user } } = await (await import('../supabaseClient')).supabase.auth.getUser();
      if (user) {
        const fileName = `outfits/${user.id}/${Date.now()}-cover.png`;
        const { data, error } = await (await import('../supabaseClient')).supabase.storage
          .from('wardrobe')
          .upload(fileName, coverPhoto, { contentType: 'image/png' });
          
        if (!error) {
          const { data: { publicUrl } } = (await import('../supabaseClient')).supabase.storage
            .from('wardrobe')
            .getPublicUrl(fileName);
          coverPhotoUrl = publicUrl;
        }
      }
    }

    saveOutfit({
      id: uuidv4(),
      name: outfitName,
      items: canvasItems,
      dateCreated: new Date().toISOString(),
      coverPhotoUrl
    });
    setCanvasItems([]);
    setOutfitName('');
    setCoverPhoto(null);
    setCoverPreview(null);
    setShowToast(true);
  };

  // Filtered Items Logic
  const topLevelCategories = categories.filter(c => !c.parentId && c.id !== 'all');
  const subCategories = categories.filter(c => c.parentId === activeCategory.parent);

  const filteredItems = items.filter(item => {
    if (activeCategory.parent === 'all') return true;
    if (activeCategory.sub === 'all') {
      // Return parent and all its subs
      if (item.category === activeCategory.parent) return true;
      const itemCat = categories.find(c => c.id === item.category);
      return itemCat && itemCat.parentId === activeCategory.parent;
    }
    return item.category === activeCategory.sub;
  });

  return (
    <div className="creator-container">
      {/* Sidebar with Wardrobe Items */}
      <aside className="creator-sidebar">
        <h3 className="sidebar-title">Your Clothes</h3>
        
        {/* Category Filter Dropdown */}
        <div className="creator-filter-container" style={{ position: 'relative', marginBottom: '1rem' }}>
          <button 
            className={`filter-dropdown-trigger ${activeCategory.parent !== 'all' ? 'has-filter' : ''}`}
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={14} />
              <span>
                {activeCategory.parent === 'all' 
                  ? 'All items' 
                  : (categories.find(c => c.id === (activeCategory.sub === 'all' ? activeCategory.parent : activeCategory.sub))?.name || 'Filter')}
              </span>
            </div>
            <ChevronDown size={14} style={{ transform: isFilterDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {isFilterDropdownOpen && (
            <div className="filter-dropdown-menu" style={{ 
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 100,
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              marginTop: '0.25rem',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <div 
                className="filter-option"
                onClick={() => { setActiveCategory({ parent: 'all', sub: 'all' }); setIsFilterDropdownOpen(false); }}
                style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}
              >
                <span>All</span>
                {activeCategory.parent === 'all' && <Check size={14} />}
              </div>
              {topLevelCategories.map(parent => (
                <div key={parent.id} className="filter-group">
                  <div 
                    className="filter-option parent"
                    onClick={() => { setActiveCategory({ parent: parent.id, sub: 'all' }); setIsFilterDropdownOpen(false); }}
                    style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: activeCategory.parent === parent.id ? 'var(--bg-secondary)' : 'transparent', fontWeight: 600, fontSize: '0.9rem' }}
                  >
                    <span>{parent.name}</span>
                    {activeCategory.parent === parent.id && activeCategory.sub === 'all' && <Check size={14} />}
                  </div>
                  {categories.filter(sub => sub.parentId === parent.id).map(sub => (
                    <div 
                      key={sub.id} 
                      className="filter-option sub"
                      onClick={() => { setActiveCategory({ parent: parent.id, sub: sub.id }); setIsFilterDropdownOpen(false); }}
                      style={{ padding: '0.6rem 0.8rem 0.6rem 2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.8 }}
                    >
                      <span>{sub.name}</span>
                      {activeCategory.sub === sub.id && <Check size={14} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-items">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="sidebar-item" 
              onClick={() => handleAddItemToCanvas(item)}
              draggable
              onDragStart={(e) => handleDragStartFromSidebar(e, item)}
              title="Add to outfit (click or drag)"
            >
              <img src={item.imageUrl} alt={item.name} loading="lazy" draggable={false} />
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p style={{ gridColumn: 'span 2', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', marginTop: '1rem' }}>Very quiet around here...</p>
          )}
        </div>
      </aside>

      {/* Main Canvas Area */}
      <section className="creator-workspace">
        <div className="canvas-header">
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Outfit name..." 
              className="outfit-name-input"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              style={{ width: 'auto', flex: 1 }}
            />
            
            {/* Optional Cover Photo Upload */}
            <div className="cover-upload-wrapper">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleCoverChange} 
                accept="image/*" 
                style={{ display: 'none' }}
              />
              <button 
                className={`btn-secondary creator-cover-btn ${coverPreview ? 'has-cover' : ''}`}
                onClick={() => fileInputRef.current.click()}
                title="Add optional cover photo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  backgroundColor: coverPreview ? 'rgba(0,0,0,0.05)' : 'transparent',
                  border: '1px dashed var(--border-color)',
                  color: coverPreview ? 'var(--accent-color)' : 'var(--text-secondary)'
                }}
              >
                {coverPreview ? (
                  <>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={coverPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span>Photo ready</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={16} />
                    <span>Reference photo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSaveOutfit}
            disabled={canvasItems.length === 0 || !outfitName}
          >
            <Save size={18} />
            Save Outfit
          </button>
        </div>

        <div 
          className="canvas-area"
          onDrop={handleDropOnCanvas}
          onDragOver={handleDragOverCanvas}
        >
          {canvasItems.length === 0 && (
            <div className="canvas-placeholder">
              <p>Drag or click items from the left to start building your outfit.</p>
            </div>
          )}
          
          {canvasItems.map((item) => (
            <Rnd
              key={item.id}
              position={{ x: item.x, y: item.y }}
              size={{ width: item.width, height: item.height }}
              onDragStop={(e, d) => handleDragStop(item.id, d)}
              onResizeStop={(e, dir, ref, delta, position) => handleResizeStop(item.id, ref, position)}
              style={{ zIndex: item.zIndex }}
              bounds="parent"
              onMouseDown={() => bringToFront(item.id)}
              className="canvas-draggable-item"
            >
              <div className="canvas-item-content">
                <img src={item.imageUrl} alt="" draggable={false} />
                <button 
                  className="remove-item-btn" 
                  onClick={() => handleRemoveFromCanvas(item.id)}
                  title="Remove"
                  onMouseDown={(e) => e.stopPropagation()} /* prevent picking up item when clicking remove */
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Rnd>
          ))}
        </div>
      </section>

      <Toast 
        message="Outfit saved successfully!" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
