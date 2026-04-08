import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { User, Upload, Check, Camera, Grid, Maximize, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Toast } from '../components/Toast';

export function Profile() {
  const { user, profile, updateProfile, logout } = useAuth();
  const { items, savedOutfits, categories } = useWardrobe();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const fileInputRef = useRef(null);

  const getTopLevelCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return 'Uncategorized';
    if (cat.parentId) {
      const parentCat = categories.find(c => c.id === cat.parentId);
      return parentCat ? parentCat.name : cat.name;
    }
    return cat.name;
  };

  const getCategoryStats = () => {
    const stats = {};
    items.forEach(item => {
      const parentName = getTopLevelCategoryName(item.category);
      if (!stats[parentName]) stats[parentName] = 0;
      stats[parentName]++;
    });
    
    // Convert to sorted array
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const categoryStats = getCategoryStats();

  const handleAvatarChange = async (event) => {
    try {
      setUploading(true);
      setErrorMsg('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('wardrobe') // resusing wardrobe bucket, ideally 'avatars' bucket
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error) {
      setErrorMsg('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setErrorMsg('Username must be 3-20 characters and can only contain letters, numbers, and underscores.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const { error } = await updateProfile({
      username: username.toLowerCase(),
      full_name: fullName,
      avatar_url: avatarUrl,
    });

    if (error) {
      setErrorMsg('Error updating profile: ' + error.message);
    } else {
      setIsEditing(false);
      setToastMessage('Profile updated successfully!');
      setShowToast(true);
    }
    setSaving(false);
  };

  return (
    <div className="profile-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="profile-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
        
        <div className="profile-avatar-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar-wrapper" style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', border: '3px solid var(--accent-color)' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <User size={48} />
              </div>
            )}
            {isEditing && (
              <button 
                className="avatar-edit-overlay" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.4rem', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
              >
                {uploading ? <span className="loader" style={{ width: '16px', height: '16px', border: '2px solid white', borderBottomColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span> : <Camera size={18} />}
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="profile-info-section" style={{ flex: 1 }}>
          {errorMsg && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isEditing ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{profile?.full_name || 'Anonymous User'}</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.2rem' }}>@{profile?.username || 'user_' + user?.id.substring(0, 6)}</p>
                </div>
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
              </div>
              
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Account Details</p>
                <p style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontWeight: 500 }}>Email:</span>
                  <span style={{ opacity: 0.8 }}>{user?.email}</span>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="e.g. Jane Doe"
                  style={{ width: '100%', maxWidth: '400px' }}
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="e.g. jane_doe123"
                  required
                  pattern="^[a-zA-Z0-9_]{3,20}$"
                  title="3-20 characters, letters, numbers, and underscores only"
                  style={{ width: '100%', maxWidth: '400px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={saving || uploading}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => {
                  setIsEditing(false);
                  setErrorMsg('');
                  // Reset form
                  setUsername(profile?.username || '');
                  setFullName(profile?.full_name || '');
                  setAvatarUrl(profile?.avatar_url || '');
                }} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="profile-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        <div className="dashboard-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            <Grid size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Wardrobe Stats</h3>
          </div>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{items.length}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Total Items</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categoryStats.length > 0 ? categoryStats.map((stat) => (
              <div key={stat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem' }}>{stat.name}</span>
                <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>{stat.count}</span>
              </div>
            )) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No items yet.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            <Maximize size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Outfits Overview</h3>
          </div>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{savedOutfits.length}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Total Outfits</span>
          </div>
          
          <div style={{ height: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
             <div style={{ width: savedOutfits.length > 0 ? '100%' : '0%', height: '100%', backgroundColor: 'var(--accent-color)', borderRadius: '2px' }}></div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {savedOutfits.length > 0 ? "You're building a great collection!" : "Start creating outfits to see them here."}
          </p>
        </div>

      </div>

      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
