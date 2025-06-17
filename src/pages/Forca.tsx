
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { ForcaGame } from "@/components/ForcaGame";
import { Button } from "@/components/ui/button";

const Forca = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-orange-900 via-red-800 to-red-900'
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
            jogo da forca minecraft 💣
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ForcaGame isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default Forca;
