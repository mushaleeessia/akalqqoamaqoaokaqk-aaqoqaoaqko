
import { Button } from "@/components/ui/button";

interface GuestModeButtonProps {
  onGuestMode: () => void;
}

export const GuestModeButton = ({ onGuestMode }: GuestModeButtonProps) => {
  return (
    <div className="mt-6 text-center">
      <div className="mb-3">
        <div className="text-white/60 text-sm">ou</div>
      </div>
      
      <Button
        onClick={onGuestMode}
        variant="outline"
        className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
      >
        Jogar como convidado
      </Button>
      
      <p className="text-white/50 text-xs mt-2">
        Sem salvamento de progresso ou estatísticas
      </p>
    </div>
  );
};
