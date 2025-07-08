import { Skull, Flame, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WinstreakWidgetProps {
  winstreak: number;
  currentAttempt?: number;
  maxAttempts?: number;
  isGameActive?: boolean;
}

export const WinstreakWidget = ({ 
  winstreak, 
  currentAttempt = 0, 
  maxAttempts = 6, 
  isGameActive = false 
}: WinstreakWidgetProps) => {
  // Determinar ícone e cor baseado na winstreak
  const getWinstreakDisplay = () => {
    if (winstreak === 0) {
      return {
        icon: Skull,
        color: "bg-gray-500/80 text-gray-100 border-gray-400/50",
        bgGlow: "shadow-gray-500/20"
      };
    } else if (winstreak <= 2) {
      return {
        icon: Flame,
        color: "bg-orange-500/80 text-orange-100 border-orange-400/50",
        bgGlow: "shadow-orange-500/30"
      };
    } else if (winstreak <= 5) {
      return {
        icon: Flame,
        color: "bg-red-500/80 text-red-100 border-red-400/50",
        bgGlow: "shadow-red-500/30"
      };
    } else if (winstreak <= 99) {
      return {
        icon: Star,
        color: "bg-yellow-500/80 text-yellow-100 border-yellow-400/50",
        bgGlow: "shadow-red-500/40"
      };
    } else {
      return {
        icon: Heart,
        color: "bg-red-500/80 text-red-100 border-red-400/50",
        bgGlow: "shadow-red-500/30"
      };
    }
  };

  // Determinar se deve mostrar efeito ripple baseado nas tentativas e winstreak
  const shouldShowRipple = () => {
    if (!isGameActive || winstreak === 0) return false;
    
    return currentAttempt >= 4 && currentAttempt < maxAttempts;
  };

  const getRippleIntensity = () => {
    if (currentAttempt === 4) return "animate-ripple";
    if (currentAttempt === 5) return "animate-ripple-delay";
    return "";
  };

  const { icon: IconComponent, color, bgGlow } = getWinstreakDisplay();
  const showRipple = shouldShowRipple();
  const rippleClass = getRippleIntensity();

  return (
    <div className="fixed top-32 right-6 z-20">
      <div className="relative">
        {/* Círculos de ondas - só aparecem quando está perto de perder */}
        {showRipple && (
          <>
            <div className={`absolute inset-0 rounded-full border-2 border-red-400/70 ${rippleClass} pointer-events-none`}></div>
            <div className={`absolute inset-0 rounded-full border-2 border-yellow-400/60 ${currentAttempt === 5 ? 'animate-ripple' : 'animate-ripple-delay'} pointer-events-none`}></div>
          </>
        )}
        
        <Badge 
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-semibold 
            border backdrop-blur-sm transition-all duration-300
            ${color} ${bgGlow} shadow-lg
            hover:scale-105 transform relative z-10
          `}
        >
          <IconComponent className="w-4 h-4" />
          <span>Sequência: {winstreak}</span>
        </Badge>
      </div>
    </div>
  );
};