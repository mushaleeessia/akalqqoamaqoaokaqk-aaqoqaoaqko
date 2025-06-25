
import { useState } from 'react';
import { UserX } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface GuestModeButtonProps {
  onGuestLogin: () => void;
}

export const GuestModeButton = ({ onGuestLogin }: GuestModeButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = () => {
    setIsLoading(true);
    // Set guest mode flag in localStorage
    localStorage.setItem('termo_guest_mode', 'true');
    localStorage.setItem('termo_guest_session', Date.now().toString());
    onGuestLogin();
    setIsLoading(false);
  };

  return (
    <div className="mt-6 text-center">
      <Button
        onClick={handleGuestLogin}
        disabled={isLoading}
        variant="ghost"
        className="text-white/70 hover:text-white hover:bg-white/10 text-sm"
      >
        <UserX className="w-4 h-4 mr-2" />
        {isLoading ? 'Carregando...' : 'Jogar como convidado'}
      </Button>
      <p className="text-xs text-white/50 mt-2">
        Modo convidado não salva estatísticas
      </p>
    </div>
  );
};
