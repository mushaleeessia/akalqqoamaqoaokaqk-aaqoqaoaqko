
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, User } from "lucide-react";
import { TermoGame } from "@/components/TermoGame";
import { MultiModeTermoGame } from "@/components/MultiModeTermoGame";
import { GameModeSelector, GameMode } from "@/components/GameModeSelector";
import { UserProfile } from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { useTermoData } from "@/hooks/useTermoData";
import { useMultiModeTermoData } from "@/hooks/useMultiModeTermoData";
import { useAuth } from "@/contexts/AuthContext";

const Termo = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameMode>('solo');
  const { todayWord, loading: soloLoading } = useTermoData();
  const { wordsData, loading: multiLoading } = useMultiModeTermoData();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || soloLoading || multiLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled by useEffect
  }

  const handleModeChange = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const getCurrentWords = () => {
    if (selectedMode === 'solo') {
      return todayWord ? [todayWord] : [];
    }
    return wordsData[selectedMode] || [];
  };

  const currentWords = getCurrentWords();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900'
    }`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">
            aleeessia.com
          </h1>
          <p className="text-sm text-white/70 mt-1">
            teeermo (veja também term.ooo!)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-white hover:bg-white/10"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <UserProfile />
        </div>
      </header>

      {/* Game Container */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <GameModeSelector 
          currentMode={selectedMode}
          onModeChange={handleModeChange}
          isDarkMode={isDarkMode}
        />

        {currentWords.length > 0 ? (
          selectedMode === 'solo' ? (
            <TermoGame 
              targetWord={currentWords[0]} 
              isDarkMode={isDarkMode}
            />
          ) : (
            <MultiModeTermoGame
              targetWords={currentWords}
              mode={selectedMode}
              isDarkMode={isDarkMode}
            />
          )
        ) : (
          <div className="text-center text-white/80">
            <p>Palavras do dia não encontradas!</p>
            <p className="text-sm mt-2">Verifique a configuração.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Termo;
