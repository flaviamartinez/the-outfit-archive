import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { User, Upload, Check, Camera, Grid, Maximize, AlertCircle, Settings, Plus, PlusCircle, PieChart, Shirt } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Toast } from '../components/Toast';
import { ManageCategoriesModal } from '../components/ManageCategoriesModal';

export function Profile() {
  const { user, profile, updateProfile, logout } = useAuth();
  const { items, savedOutfits, categories } = useWardrobe();
  
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
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
    <div className="profile-container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 320px) 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Profile Card */}
        <div className="profile-left-column" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          
           {/* Avatar section */}
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
             <div className="avatar-wrapper" style={{ position: 'relative', width: '140px', height: '140px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', border: '3px solid transparent' }}>
               {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                   <User size={48} />
                 </div>
               )}
             </div>
             <button 
                className="avatar-edit-icon-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ position: 'absolute', bottom: '0', right: '50%', transform: 'translateX(260%)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', zIndex: 10 }}
              >
                {uploading ? <span className="loader" style={{ width: '16px', height: '16px', border: '2px solid var(--accent-color)', borderBottomColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span> : <Camera size={16} />}
              </button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
           </div>
           
           {errorMsg && (
             <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
               <AlertCircle size={16} />
               <span>{errorMsg}</span>
             </div>
           )}

           {!isEditing ? (
             <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
               <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{profile?.full_name || 'Anonymous User'}</h1>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>{user?.email}</p>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', margin: '1.5rem 0 2rem 0' }}>"Fashion enthusiast and minimalist curator."</p>
               
               <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 0 1.5rem 0' }} />
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
                     <Shirt size={18} strokeWidth={1.5} /> 
                     <span style={{ fontSize: '0.95rem' }}>Pieces</span>
                   </div>
                   <span style={{ fontWeight: 600 }}>{items.length}</span>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
                     <Grid size={18} strokeWidth={1.5} /> 
                     <span style={{ fontSize: '0.95rem' }}>Outfits</span>
                   </div>
                   <span style={{ fontWeight: 600 }}>{savedOutfits.length}</span>
                 </div>
               </div>
               
               <div style={{ marginTop: 'auto' }}>
                 <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', borderRadius: 'var(--radius-full)' }}>Edit Profile</button>
               </div>
             </div>
           ) : (
             <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
               <div className="form-group">
                 <label>Full Name</label>
                 <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Jane Doe" style={{ width: '100%' }} />
               </div>
               <div className="form-group">
                 <label>Username</label>
                 <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. jane_doe123" required pattern="^[a-zA-Z0-9_]{3,20}$" style={{ width: '100%' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                 <button type="submit" className="btn-primary" disabled={saving || uploading} style={{ width: '100%', borderRadius: 'var(--radius-full)' }}>
                   {saving ? 'Saving...' : 'Save Changes'}
                 </button>
                 <button type="button" className="btn-secondary" onClick={() => { setIsEditing(false); setErrorMsg(''); setUsername(profile?.username || ''); setFullName(profile?.full_name || ''); setAvatarUrl(profile?.avatar_url || ''); }} disabled={saving} style={{ width: '100%', borderRadius: 'var(--radius-full)' }}>
                   Cancel
                 </button>
               </div>
             </form>
           )}
        </div>
        
        {/* Right Column: Dashboard */}
        <div className="profile-right-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
          <div className="profile-top-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Category Distribution */}
            <div className="dashboard-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                 <PieChart size={20} style={{ color: 'var(--accent-color)' }} />
                 <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)' }}>Category Distribution</h3>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                 {categoryStats.length > 0 ? categoryStats.map((stat) => (
                   <div key={stat.name}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}>
                       <span>{stat.name}</span>
                       <span style={{ color: 'var(--text-secondary)' }}>{stat.count} items</span>
                     </div>
                     <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (stat.count / items.length) * 100)}%`, height: '100%', backgroundColor: 'var(--accent-color)', borderRadius: '4px' }}></div>
                     </div>
                   </div>
                 )) : (
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No items yet.</p>
                 )}
               </div>
            </div>
            
            {/* Manage Categories */}
            <div className="dashboard-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                 <PlusCircle size={20} style={{ color: 'var(--accent-color)' }} />
                 <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)' }}>Manage Categories</h3>
               </div>
               
               <button 
                  onClick={() => setIsManageCategoriesOpen(true)}
                  style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: 'inset 0 0 0 1px var(--border-color)' }}
                  className="manage-cat-faux-input"
                >
                  <span>New category name...</span>
                  <div style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-primary)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Plus size={16} />
                  </div>
               </button>
               
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {categories.filter(c => c.id !== 'all').map(c => (
                     <span key={c.id} style={{ padding: '0.4rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 500, border: '1px solid var(--border-color)', opacity: 0.9 }}>
                       {c.name}
                     </span>
                  ))}
               </div>
            </div>
            
          </div>
          
          {/* Wardrobe Insights */}
          <div className="dashboard-card" style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
             <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2rem' }}>Wardrobe Insights</h3>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
               <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                 <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--accent-color)' }}>{items.length}</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0.75rem 0 0 0' }}>Total Pieces</p>
               </div>
               
               <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                 <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--accent-color)' }}>{savedOutfits.length}</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0.75rem 0 0 0' }}>Saved Looks</p>
               </div>
               
               <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                 <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--accent-color)' }}>{categories.filter(c => c.id !== 'all').length}</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0.75rem 0 0 0' }}>Categories</p>
               </div>
             </div>
          </div>
          
        </div>
      </div>

      <ManageCategoriesModal 
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />

      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
