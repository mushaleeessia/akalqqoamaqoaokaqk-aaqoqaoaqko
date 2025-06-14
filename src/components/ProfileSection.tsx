import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useState, useRef } from "react";

interface ProfileSectionProps {
  isEnglish: boolean;
}

export const ProfileSection = ({ isEnglish }: ProfileSectionProps) => {
  const { about, loading } = useFirebaseData(isEnglish);
  const [isShaking, setIsShaking] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageClick = () => {
    // Cancela a animação atual se estiver rodando
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Para a animação atual e inicia uma nova
    setIsShaking(false);
    
    // Pequeno delay para garantir que o estado seja atualizado
    setTimeout(() => {
      setIsShaking(true);
      timeoutRef.current = setTimeout(() => {
        setIsShaking(false);
        timeoutRef.current = null;
      }, 600);
    }, 10);
  };

  return (
    <div className="text-center animate-fade-in">
      {/* Profile Image */}
      <div className="relative inline-block mb-6">
        <div 
          className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-600 via-red-700 to-amber-800 p-1 shadow-2xl shadow-red-900/40 cursor-pointer select-none ${isShaking ? 'animate-shake' : ''}`}
          onClick={handleImageClick}
          onTouchStart={handleImageClick}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 flex items-center justify-center pointer-events-none">
            <img 
              src="https://mc-heads.net/avatar/80eba0b3-159a-48bf-9613-307634a45057/128" 
              alt="aleeessia Minecraft Skin"
              className="w-full h-full object-cover rounded-full pointer-events-none"
              draggable="false"
            />
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 blur-xl animate-pulse pointer-events-none"></div>
      </div>

      {/* Name and Title */}
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-600">aleeessia</span>
      </h1>
      
      <p className="text-gray-300 text-lg mb-4">
        {isEnglish ? "Mush Moderator" : "Moderadora do Mush"}
      </p>
      
      {/* About Section */}
      <div className="max-w-xs mx-auto mb-4">
        {loading ? (
          <p className="text-gray-400 text-sm">{isEnglish ? "Loading..." : "Carregando..."}</p>
        ) : (
          <p className="text-gray-200 text-sm leading-relaxed bg-gray-800/40 p-3 rounded-lg border border-red-900/30">
            {about}
          </p>
        )}
      </div>

      {/* Decorative line */}
      <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
    </div>
  );
};
