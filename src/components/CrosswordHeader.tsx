
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { UserDropdown } from '@/components/UserDropdown';
import { GuestModeDropdown } from '@/components/GuestModeDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CrosswordHeaderProps {
  completedWords: number;
  totalWords: number;
}

export const CrosswordHeader = ({ completedWords, totalWords }: CrosswordHeaderProps) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [userProfile, setUserProfile] = useState<{ nickname: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !isGuestMode) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }

          setUserProfile(data);
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user, isGuestMode]);

  return (
    <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Palavras Cruzadas</h1>
        <div className="text-lg font-semibold text-blue-300 dark:text-blue-400">
          Palavras {completedWords}/{totalWords}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeSwitch />
        {user && !isGuestMode ? (
          <UserDropdown 
            nickname={userProfile?.nickname || user.user_metadata?.nickname || user.email?.split('@')[0] || 'Usuário'} 
            currentMode="crossword"
          />
        ) : isGuestMode ? (
          <GuestModeDropdown />
        ) : null}
      </div>
    </div>
  );
};
