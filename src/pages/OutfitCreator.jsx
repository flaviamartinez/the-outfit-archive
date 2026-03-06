import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { v4 as uuidv4 } from 'uuid';
import { Save, Trash2 } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { Toast } from '../components/Toast';

export function OutfitCreator() {
  const { items, saveOutfit } = useWardrobe();
  const [canvasItems, setCanvasItems] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [showToast, setShowToast] = useState(false);

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

  const handleSaveOutfit = () => {
    if (!outfitName || canvasItems.length === 0) return;
    saveOutfit({
      id: uuidv4(),
      name: outfitName,
      items: canvasItems,
      dateCreated: new Date().toISOString()
    });
    setCanvasItems([]);
    setOutfitName('');
    setShowToast(true);
  };

  return (
    <div className="creator-container">
      {/* Sidebar with Wardrobe Items */}
      <aside className="creator-sidebar">
        <h3 className="sidebar-title">Tu Ropa</h3>
        <p className="sidebar-subtitle">Haz clic para añadir al lienzo</p>
        <div className="sidebar-items">
          {items.map(item => (
            <div 
              key={item.id} 
              className="sidebar-item" 
              onClick={() => handleAddItemToCanvas(item)}
              draggable
              onDragStart={(e) => handleDragStartFromSidebar(e, item)}
              title="Añadir a outfit (haz clic o arrastra)"
            >
              <img src={item.imageUrl} alt={item.name} loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </aside>

      {/* Main Canvas Area */}
      <section className="creator-workspace">
        <div className="canvas-header">
          <input 
            type="text" 
            placeholder="Nombre de tu outfit..." 
            className="outfit-name-input"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
          />
          <button 
            className="btn-primary" 
            onClick={handleSaveOutfit}
            disabled={canvasItems.length === 0 || !outfitName}
          >
            <Save size={18} />
            Guardar Outfit
          </button>
        </div>

        <div 
          className="canvas-area"
          onDrop={handleDropOnCanvas}
          onDragOver={handleDragOverCanvas}
        >
          {canvasItems.length === 0 && (
            <div className="canvas-placeholder">
              <p>Arrastra o haz clic en las prendas de la izquierda para comenzar a armar tu outfit.</p>
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
                  title="Quitar"
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
        message="¡Outfit guardado con éxito!" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
