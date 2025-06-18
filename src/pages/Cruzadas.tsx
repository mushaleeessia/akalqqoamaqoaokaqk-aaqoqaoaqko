
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCruzadasData } from "@/hooks/useCruzadasData";
import { CruzadasGame } from "@/components/CruzadasGame";

const Cruzadas = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { todayPuzzle, loading } = useCruzadasData();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando palavras cruzadas...</div>
      </div>
    );
  }

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
            palavras cruzadas
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-white hover:bg-white/10"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </header>

      {/* Game Container */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {todayPuzzle ? (
          <CruzadasGame 
            puzzle={todayPuzzle} 
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="text-center text-white/80">
            <p>Palavras cruzadas do dia não encontradas!</p>
            <p className="text-sm mt-2">Tente novamente mais tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cruzadas;
