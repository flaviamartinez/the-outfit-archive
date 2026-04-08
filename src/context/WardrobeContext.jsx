import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { INITIAL_CATEGORIES } from '../data/mockData';

const WardrobeContext = createContext();

export function useWardrobe() {
  return useContext(WardrobeContext);
}

export function WardrobeProvider({ children }) {
  const { user } = useAuth();
  
  const [items, setItems] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setSavedOutfits([]);
      setCategories(INITIAL_CATEGORIES);
      setIsDataLoaded(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Categories
        const { data: catsData } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);
        
        if (catsData && catsData.length > 0) {
          // Merge custom categories with default ones, or replace them based on logic
          // Lets just append them to INITIAL_CATEGORIES
          const customCats = catsData.map(c => ({
            id: c.id,
            name: c.name,
            parentId: c.parent_id
          }));
          setCategories([...INITIAL_CATEGORIES, ...customCats]);
        }

        // Fetch Items
        const { data: itemsData } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', user.id)
          .order('date_added', { ascending: false });
          
        if (itemsData) {
          setItems(itemsData.map(it => ({
            id: it.id,
            name: it.name,
            category: it.category,
            imageUrl: it.image_url,
            dateAdded: it.date_added
          })));
        }

        // Fetch Outfits
        const { data: outfitsData } = await supabase
          .from('outfits')
          .select('*')
          .eq('user_id', user.id)
          .order('date_created', { ascending: false });

        if (outfitsData) {
          setSavedOutfits(outfitsData.map(out => ({
            id: out.id,
            name: out.name,
            items: out.items,
            dateCreated: out.date_created,
            coverPhotoUrl: out.cover_photo_url
          })));
        }

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [user]);

  // Items
  const addItem = async (item) => {
    // Optimistic update
    setItems(prev => [item, ...prev]);
    
    // Sync to DB
    if (user) {
      await supabase.from('items').insert({
        id: item.id,
        user_id: user.id,
        name: item.name,
        category: item.category,
        image_url: item.imageUrl,
        date_added: item.dateAdded
      });
    }
  };

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    
    // Optimistically update outfits locally
    setSavedOutfits(prev => prev.filter(outfit => 
      !outfit.items.some(outfitItem => outfitItem.wardrobeItemId === id)
    ));

    if (user) {
      // Find outfits to delete in DB (backend cascade or manual script)
      const outfitsToDelete = savedOutfits.filter(outfit => 
        outfit.items.some(outfitItem => outfitItem.wardrobeItemId === id)
      );

      for (const out of outfitsToDelete) {
        await supabase.from('outfits').delete().eq('id', out.id).eq('user_id', user.id);
      }
      
      await supabase.from('items').delete().eq('id', id).eq('user_id', user.id);
      
      // Attempt to delete photo from storage (extract filename from URL)
      try {
        const itemToDelete = items.find(i => i.id === id);
        if (itemToDelete && itemToDelete.imageUrl.includes('supabase.co')) {
          const pathSegments = itemToDelete.imageUrl.split('/');
          const filename = pathSegments[pathSegments.length - 1];
          await supabase.storage.from('wardrobe').remove([filename]);
        }
      } catch (e) {
        console.error("Storage delete error", e);
      }
    }
  };

  const updateItem = async (id, updatedFields) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    
    if (user) {
      const dbUpdateFields = {};
      if (updatedFields.name !== undefined) dbUpdateFields.name = updatedFields.name;
      if (updatedFields.category !== undefined) dbUpdateFields.category = updatedFields.category;
      if (updatedFields.imageUrl !== undefined) dbUpdateFields.image_url = updatedFields.imageUrl;

      await supabase.from('items').update(dbUpdateFields).eq('id', id).eq('user_id', user.id);
    }
  };

  // Outfits
  const saveOutfit = async (outfit) => {
    setSavedOutfits(prev => [outfit, ...prev]);
    if (user) {
      await supabase.from('outfits').insert({
        id: outfit.id,
        user_id: user.id,
        name: outfit.name,
        items: outfit.items,
        date_created: outfit.dateCreated,
        cover_photo_url: outfit.coverPhotoUrl
      });
    }
  };

  const deleteOutfit = async (id) => {
    setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
    if (user) {
      await supabase.from('outfits').delete().eq('id', id).eq('user_id', user.id);
    }
  };
  
  // Categories
  const addCategory = async (catObj) => {
    setCategories(prev => [...prev, catObj]);
    if (user) {
      await supabase.from('categories').insert({
        id: catObj.id,
        user_id: user.id,
        name: catObj.name,
        parent_id: catObj.parentId || null
      });
    }
  };

  const updateCategory = async (id, newName) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: newName } : cat));
    if (user) {
      await supabase.from('categories').update({ name: newName }).eq('id', id).eq('user_id', user.id);
    }
  };

  const deleteCategory = async (id) => {
    setItems(prev => prev.map(item => item.category === id ? { ...item, category: 'all' } : item));
    setCategories(prev => prev.filter(cat => cat.id !== id && cat.parentId !== id));
    
    if (user) {
      await supabase.from('items').update({ category: 'all' }).eq('category', id).eq('user_id', user.id);
      await supabase.from('categories').delete().eq('parent_id', id).eq('user_id', user.id);
      await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id);
    }
  };

  return (
    <WardrobeContext.Provider value={{ 
      items, addItem, deleteItem, updateItem, setItems,
      savedOutfits, saveOutfit, deleteOutfit,
      categories, addCategory, updateCategory, deleteCategory,
      isDataLoaded
    }}>
      {children}
    </WardrobeContext.Provider>
  );
}
