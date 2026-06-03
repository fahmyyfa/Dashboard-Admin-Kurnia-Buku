import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface StaffProfile {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: StaffProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'staff' | 'manager') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('staffs')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Exception fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        await fetchProfile(session.user.id);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'staff' | 'manager') => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      setLoading(false);
      return { error };
    }

    if (data?.user) {
      // Trigger should automatically insert into public.staffs.
      // We will perform a brief wait and update/ensure full_name and role are correctly set.
      await new Promise(resolve => setTimeout(resolve, 1500)); // wait for trigger
      
      const { error: updateError } = await supabase
        .from('staffs')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          role: role
        });

      if (updateError) {
        console.error('Error updating profile during signup:', updateError);
      }
      
      await fetchProfile(data.user.id);
    }
    
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const updateProfile = async (fullName: string) => {
    if (!user) return { error: 'No authenticated user' };
    const { error } = await supabase
      .from('staffs')
      .update({ full_name: fullName })
      .eq('id', user.id);
    
    if (!error) {
      await fetchProfile(user.id);
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
