
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logNewUser } from '@/utils/activityLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { nickname?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Log new user registration
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is actually a new user by checking if profile exists
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('nickname, created_at')
                .eq('id', session.user.id)
                .maybeSingle();
              
              // If profile was just created (within last 10 seconds), it's a new user
              if (profile && profile.created_at) {
                const createdAt = new Date(profile.created_at);
                const now = new Date();
                const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
                
                if (diffInSeconds < 10) {
                  logNewUser(session.user.id, profile.nickname);
                }
              }
            } catch (error) {
              // Silently fail
            }
          }, 2000);
        }
      }
    );

    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithDiscord = async () => {
    const redirectUrl = `${window.location.origin}/`;
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: redirectUrl
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: { nickname?: string }) => {
    if (!user) throw new Error('No user logged in');
    
    // Only proceed if nickname is provided since it's required
    if (!updates.nickname) throw new Error('Nickname is required');
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        nickname: updates.nickname,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signInWithDiscord,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
