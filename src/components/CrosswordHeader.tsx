
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { UserDropdown } from '@/components/UserDropdown';
import { GuestModeDropdown } from '@/components/GuestModeDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

interface CrosswordHeaderProps {
  completedWords: number;
  totalWords: number;
}

export const CrosswordHeader = ({ completedWords, totalWords }: CrosswordHeaderProps) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();

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
            nickname={user.user_metadata?.nickname || user.email?.split('@')[0] || 'Usuário'} 
            currentMode="solo"
          />
        ) : isGuestMode ? (
          <GuestModeDropdown />
        ) : null}
      </div>
    </div>
  );
};
