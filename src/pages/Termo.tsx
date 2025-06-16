
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Sun, Moon } from "lucide-react";
import { TermoGame } from "@/components/TermoGame";
import { Button } from "@/components/ui/button";
import { useTermoData } from "@/hooks/useTermoData";

const Termo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { todayWord, loading } = useTermoData();

  useEffect(() => {
    // Aplicar tema escuro se ativado
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
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
        
        <h1 className="text-3xl font-bold text-white tracking-wider">
          TERM.OOO
        </h1>
        
        <Button 
          variant="ghost" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-white hover:bg-white/10"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </header>

      {/* Game Container */}
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {todayWord ? (
          <TermoGame 
            targetWord={todayWord} 
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="text-center text-white/80">
            <p>Palavra do dia não encontrada!</p>
            <p className="text-sm mt-2">Verifique a configuração no Firebase.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Termo;
