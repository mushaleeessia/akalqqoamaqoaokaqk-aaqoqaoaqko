import { 
  Skull, Flame, Star, Trophy, Crown, Gem, Zap, Target, 
  Award, Medal, Sparkles, Rocket, Shield, Diamond, 
  Swords, Castle, Infinity, Sun, Moon, Compass 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WinstreakWidgetProps {
  winstreak: number;
  currentAttempt?: number;
  maxAttempts?: number;
  isGameActive?: boolean;
  isHardMode?: boolean;
}

export const WinstreakWidget = ({ 
  winstreak, 
  currentAttempt = 0, 
  maxAttempts = 6, 
  isGameActive = false,
  isHardMode = false
}: WinstreakWidgetProps) => {
  // Determinar ícone e cor baseado na winstreak
  const getWinstreakDisplay = () => {
    if (winstreak === 0) {
      return {
        icon: Skull,
        color: "bg-gray-500/80 text-gray-100 border-gray-400/50",
        bgGlow: "shadow-gray-500/20",
        tooltip: null
      };
    } else if (winstreak <= 2) {
      return {
        icon: Flame,
        color: "bg-orange-500/80 text-orange-100 border-orange-400/50",
        bgGlow: "shadow-orange-500/30",
        tooltip: null
      };
    } else if (winstreak <= 5) {
      return {
        icon: Flame,
        color: "bg-red-500/80 text-red-100 border-red-400/50",
        bgGlow: "shadow-red-500/30",
        tooltip: null
      };
    } else if (winstreak <= 9) {
      return {
        icon: Star,
        color: "bg-yellow-500/80 text-yellow-100 border-yellow-400/50",
        bgGlow: "shadow-yellow-500/40",
        tooltip: null
      };
    } else if (winstreak <= 19) {
      return {
        icon: Trophy,
        color: "bg-amber-500/80 text-amber-100 border-amber-400/50",
        bgGlow: "shadow-amber-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 29) {
      return {
        icon: Crown,
        color: "bg-yellow-600/80 text-yellow-100 border-yellow-500/50",
        bgGlow: "shadow-yellow-600/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 39) {
      return {
        icon: Gem,
        color: "bg-emerald-500/80 text-emerald-100 border-emerald-400/50",
        bgGlow: "shadow-emerald-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 49) {
      return {
        icon: Zap,
        color: "bg-blue-500/80 text-blue-100 border-blue-400/50",
        bgGlow: "shadow-blue-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 59) {
      return {
        icon: Target,
        color: "bg-purple-500/80 text-purple-100 border-purple-400/50",
        bgGlow: "shadow-purple-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 69) {
      return {
        icon: Award,
        color: "bg-pink-500/80 text-pink-100 border-pink-400/50",
        bgGlow: "shadow-pink-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 79) {
      return {
        icon: Medal,
        color: "bg-indigo-500/80 text-indigo-100 border-indigo-400/50",
        bgGlow: "shadow-indigo-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 89) {
      return {
        icon: Sparkles,
        color: "bg-cyan-500/80 text-cyan-100 border-cyan-400/50",
        bgGlow: "shadow-cyan-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 99) {
      return {
        icon: Rocket,
        color: "bg-red-600/80 text-red-100 border-red-500/50",
        bgGlow: "shadow-red-600/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 199) {
      return {
        icon: Shield,
        color: "bg-slate-600/80 text-slate-100 border-slate-500/50",
        bgGlow: "shadow-slate-600/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 299) {
      return {
        icon: Diamond,
        color: "bg-teal-500/80 text-teal-100 border-teal-400/50",
        bgGlow: "shadow-teal-500/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 399) {
      return {
        icon: Swords,
        color: "bg-orange-600/80 text-orange-100 border-orange-500/50",
        bgGlow: "shadow-orange-600/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 499) {
      return {
        icon: Castle,
        color: "bg-stone-600/80 text-stone-100 border-stone-500/50",
        bgGlow: "shadow-stone-600/40",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 999) {
      return {
        icon: Sun,
        color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300/50",
        bgGlow: "shadow-yellow-400/50",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak <= 4999) {
      return {
        icon: Moon,
        color: "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-400/50",
        bgGlow: "shadow-purple-500/50",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
      };
    } else if (winstreak >= 5000) {
      return {
        icon: Infinity,
        color: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-pink-300/50 animate-pulse",
        bgGlow: "shadow-pink-500/60",
        tooltip: "🎉 PARABÉNS! Você conquistou 5000+ winstreak! Entre em contato para resgatar sua key Ultra permanente no Mush! 🎉"
      };
    } else {
      return {
        icon: Compass,
        color: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/50",
        bgGlow: "shadow-indigo-500/50",
        tooltip: "Caso você chegar à 5000 de winstreak no termo infinity, você tem direito à uma key de Ultra permanente no Mush!"
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

  const { icon: IconComponent, color, bgGlow, tooltip } = getWinstreakDisplay();
  const showRipple = shouldShowRipple();
  const rippleClass = getRippleIntensity();

  const badgeContent = (
    <div className="flex flex-col items-center gap-2">
      <Badge 
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-semibold 
          border backdrop-blur-sm transition-all duration-300
          ${isHardMode ? 'bg-red-600/80 text-red-100 border-red-400/50 shadow-red-500/40' : color} 
          ${isHardMode ? 'shadow-red-500/40' : bgGlow} shadow-lg
          hover:scale-105 transform relative z-10
        `}
        key={winstreak} // Force re-render when winstreak changes
      >
        <IconComponent className="w-4 h-4" />
        <span className="transition-all duration-200">Sequência: {winstreak}</span>
      </Badge>
      
      {isHardMode && (
        <Badge 
          className="
            flex items-center gap-1 px-3 py-1 text-xs font-bold 
            bg-red-900/90 text-red-100 border border-red-500/50 
            shadow-lg shadow-red-600/30 backdrop-blur-sm
            animate-pulse
          "
        >
          🔥 HARD MODE 🔥
        </Badge>
      )}
    </div>
  );

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
        
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {badgeContent}
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          badgeContent
        )}
      </div>
    </div>
  );
};