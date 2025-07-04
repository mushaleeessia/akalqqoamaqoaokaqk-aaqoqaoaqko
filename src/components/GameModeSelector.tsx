
import { Users, User, Users2, UsersRound, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";

export type GameMode = 'solo' | 'duo' | 'trio' | 'quarteto' | 'infinity';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  isDarkMode: boolean;
  isGuestMode?: boolean;
}

export const GameModeSelector = ({ currentMode, onModeChange, isDarkMode, isGuestMode = false }: GameModeSelectorProps) => {
  const allModes = [
    { id: 'solo' as GameMode, label: 'Solo', icon: User },
    { id: 'duo' as GameMode, label: 'Duo', icon: Users },
    { id: 'trio' as GameMode, label: 'Trio', icon: Users2 },
    { id: 'quarteto' as GameMode, label: 'Quarteto', icon: UsersRound },
    { id: 'infinity' as GameMode, label: 'Infinity', icon: Infinity, requiresAuth: true }
  ];

  const modes = allModes.filter(mode => !isGuestMode || !mode.requiresAuth);

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
              onClick={() => onModeChange(mode.id)}
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
      </div>
    </div>
  );
};
