import React, { useState } from 'react';
import { X, Trash2, Edit2, Plus, CornerDownRight, AlertTriangle, Save } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';

export function ManageCategoriesModal({ isOpen, onClose }) {
  const { categories, addCategory, updateCategory, deleteCategory, items } = useWardrobe();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  if (!isOpen) return null;

  const topCategories = categories.filter(c => !c.parentId);

  const handleEditClick = (category) => {
    // "all" cannot be edited
    if (category.id === 'all') return;
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = (id) => {
    if (editName.trim()) {
      updateCategory(id, editName);
    }
    setEditingId(null);
  };

  const handleDeleteRequest = (id) => {
    if (id === 'all') return;
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = (id) => {
    deleteCategory(id);
    setDeleteConfirmId(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    // Auto-generate ID (simple fallback)
    const newId = newCatName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    addCategory({
      id: newId,
      name: newCatName,
      parentId: newCatParent || null
    });
    
    setShowAddForm(false);
    setNewCatName('');
    setNewCatParent('');
  };

  const getItemsCount = (id) => {
    return items.filter(item => item.category === id).length;
  };

  const getChildrenCount = (id) => {
     return categories.filter(c => c.parentId === id).length;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        
        <h2 className="modal-title" style={{ marginBottom: '1.5rem' }}>Manage Categories</h2>

        <div style={{ marginBottom: '2rem' }}>
          {topCategories.map(parentCat => (
            <div key={parentCat.id} style={{ marginBottom: '1rem' }}>
              {/* RENDER ROW */}
              <CategoryRow 
                category={parentCat} 
                isEditing={editingId === parentCat.id}
                editName={editName}
                setEditName={setEditName}
                onSave={handleSaveEdit}
                onEdit={handleEditClick}
                onDelete={handleDeleteRequest}
                itemsCount={getItemsCount(parentCat.id)}
                isDeleteConfirm={deleteConfirmId === parentCat.id}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={() => setDeleteConfirmId(null)}
                childrenCount={getChildrenCount(parentCat.id)}
              />

              {/* RENDER CHILDREN */}
              {categories.filter(c => c.parentId === parentCat.id).map(childCat => (
                <div key={childCat.id} style={{ paddingLeft: '2rem', marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start' }}>
                  <CornerDownRight size={18} style={{ color: 'var(--text-secondary)', marginRight: '0.5rem', marginTop: '0.5rem' }} />
                  <div style={{ flex: 1 }}>
                    <CategoryRow 
                      category={childCat} 
                      isEditing={editingId === childCat.id}
                      editName={editName}
                      setEditName={setEditName}
                      onSave={handleSaveEdit}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteRequest}
                      itemsCount={getItemsCount(childCat.id)}
                      isDeleteConfirm={deleteConfirmId === childCat.id}
                      onConfirmDelete={handleConfirmDelete}
                      onCancelDelete={() => setDeleteConfirmId(null)}
                      isChild={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ADD CATEGORY FORM */}
        {!showAddForm ? (
          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add New Category
          </button>
        ) : (
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>New Category</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  placeholder="E.g: Hats and Caps" 
                  autoFocus 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Location (Optional)</label>
                <select value={newCatParent} onChange={e => setNewCatParent(e.target.value)}>
                  <option value="">As Main Category</option>
                  {topCategories.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>Subcategory of {c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for a single category row
function CategoryRow({ 
  category, isEditing, editName, setEditName, onSave, onEdit, onDelete, 
  itemsCount, isDeleteConfirm, onConfirmDelete, onCancelDelete, isChild = false, childrenCount = 0
}) {
  const isDefault = category.id === 'all';

  if (isDeleteConfirm) {
    return (
      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#ef4444', marginBottom: '0.5rem', fontWeight: 500 }}>
          <AlertTriangle size={18} style={{ marginRight: '0.5rem' }} />
          <span>Warning: Delete {category.name}</span>
        </div>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          {itemsCount} {itemsCount === 1 ? 'item will remain' : 'items will remain'} in "All" without a specific category.
          {childrenCount > 0 && ` Also, its ${childrenCount} subcategory(s) will be deleted.`}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-danger" style={{ flex: 1 }} onClick={() => onConfirmDelete(category.id)}>Yes, delete</button>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancelDelete}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: isChild ? 'transparent' : 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: isChild ? '1px dashed var(--border-color)' : '1px solid transparent' }}>
      {isEditing ? (
        <div style={{ display: 'flex', flex: 1, gap: '0.5rem', marginRight: '1rem' }}>
          <input 
            type="text" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)} 
            style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            autoFocus 
            onKeyDown={(e) => { if(e.key === 'Enter') onSave(category.id); else if (e.key === 'Escape') setEditName(category.name); }}
          />
          <button onClick={() => onSave(category.id)} style={{ color: 'var(--accent-color)' }} title="Save">
             <Save size={18} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <span style={{ fontWeight: isChild ? 400 : 500, fontSize: isChild ? '0.95rem' : '1.05rem' }}>{category.name}</span>
          <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--border-color)', padding: '0.1rem 0.5rem', borderRadius: '10px', color: 'var(--text-secondary)' }}>
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* Actions */}
      {!isDefault && !isEditing && (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => onEdit(category)} style={{ color: 'var(--text-secondary)' }} title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(category.id)} style={{ color: '#ef4444', opacity: 0.8 }} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
