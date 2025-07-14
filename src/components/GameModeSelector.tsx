
import { Users, User, Users2, UsersRound, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivityLogger } from "@/hooks/useActivityLogger";

export type GameMode = 'solo' | 'duo' | 'trio' | 'quarteto' | 'infinity';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  isDarkMode: boolean;
  isGuestMode?: boolean;
}

export const GameModeSelector = ({ currentMode, onModeChange, isDarkMode, isGuestMode = false }: GameModeSelectorProps) => {
  const { logModeChanged } = useActivityLogger();
  
  const handleModeChange = (mode: GameMode) => {
    logModeChanged(mode);
    onModeChange(mode);
  };
  
  const allModes = [
    { id: 'solo' as GameMode, label: 'Solo', icon: User },
    { id: 'duo' as GameMode, label: 'Duo', icon: Users },
    { id: 'trio' as GameMode, label: 'Trio', icon: Users2 },
    { id: 'quarteto' as GameMode, label: 'Quarteto', icon: UsersRound },
    { id: 'infinity' as GameMode, label: 'Infinity', icon: Infinity, requiresAuth: true }
  ];

  const modes = allModes.filter(mode => !isGuestMode || !mode.requiresAuth);
  const disabledModes = isGuestMode ? allModes.filter(mode => mode.requiresAuth) : [];

  return (
    <div className="flex justify-center mb-6">
      <div className={`flex rounded-lg p-1 ${
        isDarkMode 
          ? 'bg-gray-800/50 border border-gray-700' 
          : 'bg-white/10 border border-white/20'
      }`}>
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              variant="ghost"
              size="sm"
              onClick={() => handleModeChange(mode.id)}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                isActive
                  ? isDarkMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                  : isDarkMode
                    ? 'text-white/70 hover:text-white hover:bg-gray-700/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{mode.label}</span>
            </Button>
          );
        })}

        {/* Modos desabilitados para convidados */}
        {disabledModes.map((mode) => {
          const IconComponent = mode.icon;
          
          return (
            <div key={mode.id} className="relative group">
              <Button
                variant="ghost"
                size="sm"
                disabled
                className={`flex items-center space-x-2 transition-all duration-200 opacity-50 cursor-not-allowed ${
                  isDarkMode
                    ? 'text-white/40'
                    : 'text-white/40'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{mode.label}</span>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Crie ou entre em sua conta para jogar o modo Infinity
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
