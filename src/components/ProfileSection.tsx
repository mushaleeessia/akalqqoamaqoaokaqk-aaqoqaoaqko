
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface ProfileSectionProps {
  isEnglish: boolean;
}

export const ProfileSection = ({ isEnglish }: ProfileSectionProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAvatarClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600); // Duração da animação
  };

  return (
    <div className="text-center mb-8 animate-fade-in">
      <div className="relative inline-block mb-4">
        <Avatar 
          className={`w-24 h-24 mx-auto border-4 border-red-600 cursor-pointer transition-all duration-300 hover:scale-105 ${
            isAnimating ? 'animate-bounce' : ''
          }`}
          onClick={handleAvatarClick}
          style={{
            transform: isAnimating ? 'rotate(360deg)' : 'rotate(0deg)',
            transition: 'transform 0.6s ease-in-out'
          }}
        >
          <AvatarImage 
            src="https://minotar.net/helm/aleeessia_/100.png" 
            alt="Minecraft head" 
            className="pixelated"
          />
          <AvatarFallback className="bg-red-800 text-white text-xl font-bold">
            AL
          </AvatarFallback>
        </Avatar>
        
        {/* Efeito de partículas quando clica */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping delay-100"></div>
            <div className="absolute bottom-0 left-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping delay-200"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping delay-300"></div>
          </div>
        )}
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
        aleeessia_
      </h1>
      
      <p className="text-red-200 text-lg mb-4">
        {isEnglish ? "Content Creator & Gamer" : "Criadora de Conteúdo & Gamer"}
      </p>
      
      <div className="flex justify-center space-x-4 text-sm text-red-300">
        <span className="bg-red-800/30 px-3 py-1 rounded-full border border-red-600/30">
          Minecraft
        </span>
        <span className="bg-red-800/30 px-3 py-1 rounded-full border border-red-600/30">
          TikTok
        </span>
        <span className="bg-red-800/30 px-3 py-1 rounded-full border border-red-600/30">
          Gaming
        </span>
      </div>
    </div>
  );
};
