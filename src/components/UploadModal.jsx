import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export function UploadModal({ isOpen, onClose, onUpload, itemToEdit = null }) {
  const { categories, addCategory } = useWardrobe();
  const { user } = useAuth();
  const topCategories = categories.filter(c => !c.parentId && c.id !== 'all');
  
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(topCategories.length > 0 ? topCategories[0].id : '');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('');
  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [useMagicRemove, setUseMagicRemove] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setBrand(itemToEdit.brand || '');
        setCategory(itemToEdit.category || (topCategories.length > 0 ? topCategories[0].id : ''));
        setPreviewUrl(itemToEdit.imageUrl || null);
      } else {
        setBrand('');
        setCategory(topCategories.length > 0 ? topCategories[0].id : '');
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      setUseMagicRemove(false);
      setIsCreatingCategory(false);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const processImageWithAI = async (file) => {
    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    
    // Si no hay key, devolver mensaje amigable
    if (!apiKey || apiKey === 'ESTA_ES_TU_CLAVE') {
      throw new Error('MISSING_API_KEY');
    }

    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', file);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('OUT_OF_CREDITS');
      }
      if (response.status === 403 || response.status === 401) {
        throw new Error('INVALID_API_KEY');
      }
      throw new Error(`API_ERROR: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob); // Devolver la nueva URL con fondo transparente
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!previewUrl) || isProcessing) return;
    
    setIsProcessing(true);
    let finalImageUrl = previewUrl;

    try {
      let uploadUrl = itemToEdit ? itemToEdit.imageUrl : previewUrl;

      if (selectedFile) {
        let finalImageUrl = previewUrl;
        if (useMagicRemove) {
          finalImageUrl = await processImageWithAI(selectedFile);
        }
        
        // Subir a Supabase Storage
        if (user && finalImageUrl) {
          const response = await fetch(finalImageUrl);
          const blob = await response.blob();
          
          const fileName = `${user.id}/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
          const { data, error: uploadError } = await supabase.storage
            .from('wardrobe')
            .upload(fileName, blob, { contentType: 'image/png' });
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('wardrobe')
            .getPublicUrl(fileName);
            
          uploadUrl = publicUrl;
        }
      }

      onUpload({
        id: itemToEdit ? itemToEdit.id : crypto.randomUUID(),
        name: '',
        brand: brand.trim() || undefined,
        category,
        dateAdded: itemToEdit ? itemToEdit.dateAdded : new Date().toISOString(),
        imageUrl: uploadUrl
      });
      
      // Reset state and close
      setBrand('');
      setCategory(categories.find(c => c.id !== 'all')?.id || '');
      setPreviewUrl(null);
      setSelectedFile(null);
      setUseMagicRemove(false);
      onClose();

    } catch (error) {
      console.error('Error processing image:', error);
      if (error.message === 'MISSING_API_KEY') {
        alert('To use AI magic, you need to configure your Remove.bg API Key in the .env file.');
      } else if (error.message === 'OUT_OF_CREDITS') {
        alert('Your free Remove.bg credits for this month have been exhausted. Please disable the magic option or upgrade your plan.');
      } else if (error.message === 'INVALID_API_KEY') {
        alert('Your Remove.bg API Key seems invalid. Please check your .env file.');
      } else {
        alert('There was an error trying to remove the background. Try again later or disable the magic option.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    addCategory({
      id: newId,
      name: newCategoryName,
      parentId: newCategoryParent || null
    });
    setCategory(newId);
    setIsCreatingCategory(false);
    setNewCategoryName('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        
        <h2 className="modal-title">{itemToEdit ? 'Edit item' : 'Add new item'}</h2>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div 
            className={`image-upload-area ${previewUrl ? 'has-image' : ''}`}
            onClick={() => fileInputRef.current.click()}
          >
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="image-preview" />
            ) : (
                <div className="upload-placeholder">
                  <ImageIcon size={48} className="upload-icon" />
                  <p>Click to upload a photo</p>
                  <p className="upload-subtitle">JPG, PNG recommended</p>
                </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden-file-input"
              required={!previewUrl}
            />
          </div>

          {previewUrl && (
            <div className="magic-toggle-container">
              <label className="magic-toggle-label">
                <input 
                  type="checkbox" 
                  checked={useMagicRemove} 
                  onChange={(e) => setUseMagicRemove(e.target.checked)}
                  className="magic-checkbox"
                />
                Remove background
              </label>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="itemBrand">Brand (Optional)</label>
            <input 
              type="text" 
              id="itemBrand" 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)} 
              placeholder="E.g. Zara, Nike"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="itemCategory">Category</label>
              {!isCreatingCategory && (
                <button 
                  type="button" 
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  style={{ fontSize: '0.85rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center' }}
                >
                  <Plus size={14} style={{ marginRight: '0.2rem' }} /> New Category
                </button>
              )}
            </div>

            {isCreatingCategory ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <input 
                  type="text" 
                  placeholder="Category name..." 
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  style={{ padding: '0.5rem' }}
                />
                <select value={newCategoryParent} onChange={e => setNewCategoryParent(e.target.value)} style={{ padding: '0.5rem' }}>
                  <option value="">-- Main Category --</option>
                  {topCategories.map(c => (
                    <option key={c.id} value={c.id}>Subcategory of {c.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={handleCreateCategory} className="btn-primary" style={{ padding: '0.5rem', flex: 1 }}>Create</button>
                  <button type="button" onClick={() => setIsCreatingCategory(false)} style={{ padding: '0.5rem', flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <select 
                id="itemCategory" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                {topCategories.map(cat => (
                  <optgroup key={cat.id} label={cat.name}>
                    <option value={cat.id}>General ({cat.name})</option>
                    {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          <button type="submit" className="btn-primary form-submit" disabled={!previewUrl || isProcessing}>
            {isProcessing ? 'Processing Magically...' : (itemToEdit ? 'Save Changes' : 'Save to My Closet')}
          </button>
        </form>
      </div>
    </div>
  );
}
