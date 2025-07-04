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
    } else {
      return {
        icon: Star,
        color: "bg-yellow-500/80 text-yellow-100 border-yellow-400/50",
        bgGlow: "shadow-yellow-500/40"
      };
    }
  };

  // Determinar se deve piscar baseado nas tentativas
  const shouldBlink = () => {
    if (!isGameActive) return false;
    
    if (currentAttempt >= 4 && currentAttempt < maxAttempts) {
      return currentAttempt === 4 ? "animate-pulse" : "animate-ping";
    }
    return false;
  };

  const { icon: IconComponent, color, bgGlow } = getWinstreakDisplay();
  const blinkClass = shouldBlink();

  return (
    <div className="fixed top-32 right-6 z-20">
      <Badge 
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-semibold 
          border backdrop-blur-sm transition-all duration-300
          ${color} ${bgGlow} shadow-lg
          ${blinkClass ? blinkClass : ""}
          hover:scale-105 transform
        `}
      >
        <IconComponent className="w-4 h-4" />
        <span>Sequência: {winstreak}</span>
      </Badge>
    </div>
  );
};