import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (e) {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') };
    
    // Check if username is unique (only if username is being changed)
    if (updates.username && (!profile || updates.username !== profile.username)) {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .single();
        
      if (existingUser) {
        return { error: new Error('Username is already taken') };
      }
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "No rows found"
        return { error: checkError };
      }
    }

    const payload = {
      id: user.id,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').upsert(payload);
    if (!error) {
      setProfile(prev => ({ ...prev, ...payload }));
    }
    return { error };
  };

  const value = {
    user,
    profile,
    loading,
    loginWithGoogle,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
