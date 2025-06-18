
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCruzadasData } from "@/hooks/useCruzadasData";
import { CruzadasGame } from "@/components/CruzadasGame";

const Cruzadas = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-800 text-xl font-medium">Carregando palavras cruzadas...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-4 border-b shadow-sm ${
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/80'
      }`}>
        <Link to="/">
          <Button variant="ghost" className={isDarkMode ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        
        <div className="text-center">
          <h1 className={`text-2xl font-bold tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            aleeessia.com
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            palavras cruzadas
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={isDarkMode ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </header>

      {/* Game Container */}
      <div className="container mx-auto px-4 py-8">
        {todayPuzzle ? (
          <CruzadasGame 
            puzzle={todayPuzzle} 
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className={`text-center ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`}>
            <p>Palavras cruzadas do dia não encontradas!</p>
            <p className="text-sm mt-2">Tente novamente mais tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cruzadas;
