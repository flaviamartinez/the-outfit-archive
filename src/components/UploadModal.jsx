import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/mockData';

export function UploadModal({ isOpen, onClose, onUpload }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(INITIAL_CATEGORIES[1].id); // Default to first actual category
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [useMagicRemove, setUseMagicRemove] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

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
    if (!name || (!previewUrl) || isProcessing) return;
    
    setIsProcessing(true);
    let finalImageUrl = previewUrl;

    try {
      if (useMagicRemove && selectedFile) {
        finalImageUrl = await processImageWithAI(selectedFile);
      }

      onUpload({
        id: Date.now().toString(),
        name,
        category,
        dateAdded: new Date().toISOString(),
        imageUrl: finalImageUrl
      });
      
      // Reset state and close
      setName('');
      setCategory(INITIAL_CATEGORIES[1].id);
      setPreviewUrl(null);
      setSelectedFile(null);
      setUseMagicRemove(false);
      onClose();

    } catch (error) {
      console.error('Error procesando imagen:', error);
      if (error.message === 'MISSING_API_KEY') {
        alert('Para usar la magia de la IA, necesitas configurar tu API Key de Remove.bg en el archivo .env.');
      } else if (error.message === 'OUT_OF_CREDITS') {
        alert('Se han agotado los créditos gratuitos de tu cuenta de Remove.bg para este mes. Por favor, desactiva la opción mágica o actualiza tu plan en Remove.bg.');
      } else if (error.message === 'INVALID_API_KEY') {
        alert('Tu API Key de Remove.bg parece ser inválida. Por favor, verifica tu archivo .env.');
      } else {
        alert('Hubo un error al intentar eliminar el fondo. Inténtalo de nuevo más tarde o desactiva la opción mágica.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
          <X size={24} />
        </button>
        
        <h2 className="modal-title">Añadir nueva prenda</h2>
        
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
                  <p>Haz clic para subir una foto</p>
                  <p className="upload-subtitle">JPG, PNG recomended</p>
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
                ✨ Eliminar el fondo (Magic AI)
              </label>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="itemName">Nombre de la prenda</label>
            <input 
              type="text" 
              id="itemName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej. Mi chaqueta favorita"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="itemCategory">Categoría</label>
            <select 
              id="itemCategory" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              {INITIAL_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary form-submit" disabled={!name || !previewUrl || isProcessing}>
            {isProcessing ? 'Procesando Mágicamente...' : 'Guardar en Mi Clóset'}
          </button>
        </form>
      </div>
    </div>
  );
}
