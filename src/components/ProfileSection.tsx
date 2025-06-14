
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface ProfileSectionProps {
  isEnglish: boolean;
}

export const ProfileSection = ({ isEnglish }: ProfileSectionProps) => {
  const [isShaking, setIsShaking] = useState(false);

  const handleAvatarClick = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="text-center mb-8 animate-fade-in">
      <div className="relative inline-block mb-4">
        <Avatar 
          className={`w-24 h-24 mx-auto border-4 border-red-600 cursor-pointer transition-all duration-300 hover:scale-105 ${
            isShaking ? 'animate-pulse' : ''
          }`}
          onClick={handleAvatarClick}
          style={{
            transform: isShaking ? 'scale(1.1)' : 'scale(1)',
            filter: isShaking ? 'brightness(1.3) saturate(1.2)' : 'brightness(1) saturate(1)',
            boxShadow: isShaking ? '0 0 20px rgba(239, 68, 68, 0.6)' : 'none',
            transition: 'all 0.5s ease-in-out',
            animation: isShaking ? 'shake 0.5s ease-in-out' : 'none'
          }}
        >
          <AvatarImage 
            src="https://mc-heads.net/avatar/80eba0b3-159a-48bf-9613-307634a45057/128" 
            alt="Minecraft head" 
            className="pixelated"
          />
          <AvatarFallback className="bg-red-800 text-white text-xl font-bold">
            AL
          </AvatarFallback>
        </Avatar>
        
        {/* Efeito de brilho quando clica */}
        {isShaking && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border-2 border-red-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border border-amber-400 rounded-full animate-ping delay-100 opacity-50"></div>
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
