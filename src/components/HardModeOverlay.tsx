import { useEffect, useState } from 'react';
import { Flame, Zap, Skull } from 'lucide-react';

interface HardModeOverlayProps {
  isTriggering: boolean;
}

export const HardModeOverlay = ({ isTriggering }: HardModeOverlayProps) => {
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState(0); // 0: fade-in, 1: text reveal, 2: fade-out

  useEffect(() => {
    if (isTriggering) {
      setShow(true);
      setStage(0);

      // Sequência de animação
      const timer1 = setTimeout(() => setStage(1), 500);   // 0.5s - aparecer background
      const timer2 = setTimeout(() => setStage(2), 2500);  // 2.5s - começar fade out
      const timer3 = setTimeout(() => setShow(false), 3000); // 3s - esconder completamente

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isTriggering]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${
        stage === 0 ? 'bg-red-900/0' : 
        stage === 1 ? 'bg-red-900/90 backdrop-blur-sm' : 
        'bg-red-900/0'
      }`}
      style={{
        background: stage === 1 
          ? 'radial-gradient(circle at center, rgba(153, 27, 27, 0.95) 0%, rgba(127, 29, 29, 0.9) 50%, rgba(69, 10, 10, 0.8) 100%)'
          : 'transparent'
      }}
    >
      <div 
        className={`text-center transform transition-all duration-1000 ${
          stage === 0 ? 'scale-50 opacity-0' :
          stage === 1 ? 'scale-100 opacity-100' :
          'scale-150 opacity-0'
        }`}
      >
        {/* Ícones flutuantes */}
        <div className="relative mb-8">
          <div className="flex justify-center space-x-8 mb-4">
            <Flame 
              size={48} 
              className={`text-red-300 transition-all duration-1000 ${
                stage === 1 ? 'animate-pulse' : 'opacity-0'
              }`} 
            />
            <Skull 
              size={56} 
              className={`text-red-200 transition-all duration-1000 ${
                stage === 1 ? 'animate-bounce' : 'opacity-0'
              }`}
            />
            <Zap 
              size={48} 
              className={`text-red-300 transition-all duration-1000 ${
                stage === 1 ? 'animate-pulse' : 'opacity-0'
              }`}
            />
          </div>
        </div>

        {/* Título principal */}
        <h1 
          className={`text-6xl md:text-8xl font-black text-white mb-6 transition-all duration-1000 ${
            stage === 1 ? 'tracking-wider drop-shadow-2xl' : 'tracking-normal'
          }`}
          style={{
            textShadow: '0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.4)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: stage === 1 ? '0.1em' : '0'
          }}
        >
          🔥 MODO DIFÍCIL 🔥
        </h1>

        {/* Subtítulo */}
        <div 
          className={`transition-all duration-1000 delay-500 ${
            stage === 1 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}
        >
          <p className="text-2xl md:text-3xl text-red-100 font-bold mb-2">
            ⚡ Duas tentativas foram removidas ⚡
          </p>
          <p className="text-lg md:text-xl text-red-200 font-semibold">
            💀 Apenas 4 tentativas restam! 💀
          </p>
        </div>

        {/* Efeitos visuais adicionais */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
            stage === 1 ? 'opacity-20' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 0, 0, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 100, 0, 0.2) 0%, transparent 50%)',
            animation: stage === 1 ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
      </div>

      {/* Partículas de fogo */}
      {stage === 1 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + (i % 3)}s`
              }}
            >
              🔥
            </div>
          ))}
        </div>
      )}
    </div>
  );
};