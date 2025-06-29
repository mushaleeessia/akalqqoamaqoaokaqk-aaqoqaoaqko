import { useState } from "react";
import { ProfileSection } from "@/components/ProfileSection";
import { LinkCard } from "@/components/LinkCard";
import { BlogSection } from "@/components/BlogSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HelpAssistant } from "@/components/HelpAssistant";
import { TwitchEmbed } from "@/components/TwitchEmbed";
import { MusicPlayer } from "@/components/MusicPlayer";
import { StatsUpdater } from "@/components/StatsUpdater";
import { Globe, MessageSquare, Video, Gamepad2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [isEnglish, setIsEnglish] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    {
      title: isEnglish ? "Does Alessia ban wrongly or without reason?" : "A Alessia bane errado ou sem motivo?",
      description: isEnglish ? "Check out the whole truth here" : "Confira aqui toda a verdade",
      url: "https://forum.mush.com.br/topic/275986/denuncia-adm-aleeesia",
      icon: HelpCircle,
      color: "from-purple-900 to-purple-700"
    },
    {
      title: isEnglish ? "My TikTok" : "Meu TikTok",
      description: isEnglish ? "@aleeessia_" : "@aleeessia_",
      url: "https://tiktok.com/@aleeessia_",
      icon: Video,
      color: "from-red-900 to-red-700"
    },
    {
      title: isEnglish ? "Mush's Website" : "Site Mush",
      description: isEnglish ? "Official server website" : "Site oficial do servidor",
      url: "https://mush.com.br",
      icon: Globe,
      color: "from-amber-900 to-red-800"
    },
    {
      title: isEnglish ? "Mush's Discord" : "Discord Mush",
      description: isEnglish ? "Join our Discord community" : "Entre no nosso Discord",
      url: "https://discord.gg/mush",
      icon: MessageSquare,
      color: "from-red-800 to-amber-900"
    }
  ];

  const handleLanguageChange = (newIsEnglish: boolean) => {
    setIsEnglish(newIsEnglish);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950/40 to-gray-900 relative overflow-hidden">
      {/* Stats Updater - componente invisível para atualizar estatísticas */}
      <StatsUpdater />
      
      {/* Header do Mush */}
      <Header 
        onLanguageChange={handleLanguageChange}
        onMobileMenuChange={setMobileMenuOpen}
      />

      {/* Twitch Embed */}
      <TwitchEmbed isEnglish={isEnglish} />

      {/* Dark red ambient background elements - distributed across the screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top area - distributed across width */}
        <div className="absolute top-16 left-[10%] w-1 h-1 bg-red-700 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-24 right-[15%] w-2 h-2 bg-red-500 rounded-full animate-pulse delay-100 opacity-40"></div>
        <div className="absolute top-32 left-[75%] w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-20 left-[50%] w-1 h-1 bg-red-800 rounded-full animate-pulse delay-300 opacity-70"></div>
        <div className="absolute top-40 right-[40%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-400 opacity-55"></div>
        <div className="absolute top-28 left-[12%] w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-500 opacity-65"></div>
        <div className="absolute top-36 right-[12%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-600 opacity-45"></div>
        <div className="absolute top-12 left-[40%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-700 opacity-80"></div>
        <div className="absolute top-44 right-[60%] w-2 h-2 bg-amber-800 rounded-full animate-pulse delay-800 opacity-35"></div>
        <div className="absolute top-14 right-[16%] w-1 h-1 bg-red-400 rounded-full animate-pulse delay-900 opacity-60"></div>
        <div className="absolute top-38 left-[85%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-1000 opacity-50"></div>
        <div className="absolute top-22 right-[25%] w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-1100 opacity-70"></div>
        <div className="absolute top-46 left-[30%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1200 opacity-65"></div>
        <div className="absolute top-18 right-[70%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-1300 opacity-55"></div>
        <div className="absolute top-42 left-[65%] w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-1400 opacity-45"></div>
        
        {/* Middle area - spread horizontally */}
        <div className="absolute top-[25%] left-[25%] w-2 h-2 bg-red-600 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-[33%] right-[33%] w-1 h-1 bg-amber-600 rounded-full animate-pulse delay-100"></div>
        <div className="absolute top-[40%] left-[16%] w-1.5 h-1.5 bg-red-700 rounded-full animate-pulse delay-400 opacity-60"></div>
        <div className="absolute top-[50%] right-[16%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-600 opacity-80"></div>
        <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-amber-700 rounded-full animate-pulse delay-700 opacity-45"></div>
        <div className="absolute top-[33%] left-[8%] w-1 h-1 bg-red-800 rounded-full animate-pulse delay-1000 opacity-70"></div>
        <div className="absolute top-[40%] right-[40%] w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse delay-1100 opacity-55"></div>
        <div className="absolute top-[50%] left-[33%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-1200 opacity-65"></div>
        <div className="absolute top-[60%] right-[75%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-1300 opacity-50"></div>
        <div className="absolute top-[25%] right-[8%] w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-1400 opacity-40"></div>
        <div className="absolute top-[58%] left-[20%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1500 opacity-75"></div>
        <div className="absolute top-[42%] right-[20%] w-2 h-2 bg-red-800 rounded-full animate-pulse delay-1600 opacity-30"></div>
        <div className="absolute top-[35%] left-[55%] w-1 h-1 bg-amber-700 rounded-full animate-pulse delay-1700 opacity-60"></div>
        <div className="absolute top-[45%] right-[55%] w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse delay-1800 opacity-45"></div>
        <div className="absolute top-[55%] left-[45%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1900 opacity-70"></div>
        <div className="absolute top-[28%] right-[85%] w-1 h-1 bg-amber-600 rounded-full animate-pulse delay-2000 opacity-55"></div>
        <div className="absolute top-[48%] left-[70%] w-1.5 h-1.5 bg-red-700 rounded-full animate-pulse delay-2100 opacity-65"></div>
        <div className="absolute top-[38%] right-[50%] w-1 h-1 bg-red-400 rounded-full animate-pulse delay-2200 opacity-50"></div>
        
        {/* Bottom area - widely distributed */}
        <div className="absolute bottom-[25%] left-[33%] w-2 h-2 bg-red-700 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-[67%] right-[25%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-[33%] right-[50%] w-2 h-2 bg-amber-700 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 bg-red-800 rounded-full animate-pulse delay-800 opacity-55"></div>
        <div className="absolute bottom-32 right-[33%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-900 opacity-70"></div>
        <div className="absolute bottom-40 left-[67%] w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-1000 opacity-65"></div>
        <div className="absolute bottom-48 right-[16%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1700 opacity-60"></div>
        <div className="absolute bottom-24 left-[25%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-1800 opacity-45"></div>
        <div className="absolute bottom-36 right-[40%] w-1.5 h-1.5 bg-amber-800 rounded-full animate-pulse delay-1900 opacity-55"></div>
        <div className="absolute bottom-28 left-[60%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-2000 opacity-70"></div>
        <div className="absolute bottom-44 right-[80%] w-1 h-1 bg-red-400 rounded-full animate-pulse delay-2100 opacity-50"></div>
        <div className="absolute bottom-16 left-[12%] w-2 h-2 bg-amber-700 rounded-full animate-pulse delay-2200 opacity-35"></div>
        <div className="absolute bottom-52 right-[60%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-2300 opacity-65"></div>
        <div className="absolute bottom-20 left-[75%] w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-2400 opacity-50"></div>
        <div className="absolute bottom-32 right-[10%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-2500 opacity-75"></div>
        <div className="absolute bottom-48 left-[40%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-2600 opacity-45"></div>
        <div className="absolute bottom-24 right-[65%] w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-2700 opacity-60"></div>
        <div className="absolute bottom-36 left-[85%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-2800 opacity-55"></div>
        
        {/* Side areas and corners */}
        <div className="absolute top-[75%] left-[5%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1100 opacity-50"></div>
        <div className="absolute top-[16%] right-[5%] w-2 h-2 bg-red-700 rounded-full animate-pulse delay-1200 opacity-40"></div>
        <div className="absolute top-[80%] right-[8%] w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-1300 opacity-60"></div>
        <div className="absolute top-[12%] left-[8%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-1400 opacity-75"></div>
        <div className="absolute top-[83%] left-[15%] w-1 h-1 bg-red-800 rounded-full animate-pulse delay-2300 opacity-65"></div>
        <div className="absolute top-[8%] right-[15%] w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-2400 opacity-45"></div>
        <div className="absolute top-[87%] right-[20%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-2500 opacity-70"></div>
        <div className="absolute top-[20%] left-[95%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-2600 opacity-55"></div>
        <div className="absolute top-[80%] left-[95%] w-1.5 h-1.5 bg-amber-800 rounded-full animate-pulse delay-2700 opacity-40"></div>
        <div className="absolute top-[33%] right-[95%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-2800 opacity-80"></div>
        <div className="absolute top-[90%] left-[50%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-2900 opacity-45"></div>
        <div className="absolute top-[5%] left-[90%] w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-3000 opacity-65"></div>
        <div className="absolute top-[95%] right-[30%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-3100 opacity-50"></div>
        <div className="absolute top-[10%] right-[90%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-3200 opacity-60"></div>
        
        {/* Additional scattered circles for better distribution */}
        <div className="absolute top-[14%] left-[43%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-2900 opacity-50"></div>
        <div className="absolute top-[43%] right-[28%] w-1 h-1 bg-amber-700 rounded-full animate-pulse delay-3000 opacity-60"></div>
        <div className="absolute top-[71%] left-[57%] w-1.5 h-1.5 bg-red-700 rounded-full animate-pulse delay-3100 opacity-45"></div>
        <div className="absolute top-[86%] right-[57%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-3200 opacity-65"></div>
        <div className="absolute top-[29%] left-[86%] w-1 h-1 bg-amber-600 rounded-full animate-pulse delay-3300 opacity-55"></div>
        <div className="absolute top-[57%] right-[86%] w-1 h-1 bg-red-800 rounded-full animate-pulse delay-3400 opacity-70"></div>
        <div className="absolute top-[65%] left-[22%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-3500 opacity-60"></div>
        <div className="absolute top-[22%] right-[65%] w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-3600 opacity-45"></div>
        <div className="absolute top-[78%] left-[78%] w-1 h-1 bg-red-700 rounded-full animate-pulse delay-3700 opacity-55"></div>
        <div className="absolute top-[15%] right-[78%] w-1 h-1 bg-red-600 rounded-full animate-pulse delay-3800 opacity-70"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        <ProfileSection isEnglish={isEnglish} />
        
        {/* Botão especial do jogo Termo */}
        <div className="mt-8 mb-4">
          <Link to="/termo">
            <button className="w-full relative overflow-hidden flex items-center justify-center space-x-3 px-6 py-4 text-white rounded-xl border-2 border-green-500/30 hover:border-green-400 transition-all duration-300 text-lg font-bold bg-gradient-to-r from-green-900/80 via-green-800/60 to-green-900/80 hover:from-green-800/90 hover:via-green-700/70 hover:to-green-800/90 group shadow-lg hover:shadow-green-500/20">
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <Gamepad2 className="w-6 h-6 relative z-10 text-green-300" />
              <span className="relative z-10 text-green-100">TEEERMO</span>
              
              {/* Partículas de fundo */}
              <div className="absolute top-1 right-2 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-70" />
              <div className="absolute bottom-2 left-3 w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse delay-300 opacity-50" />
            </button>
          </Link>
        </div>

        {/* Botão das Palavras Cruzadas */}
        <div className="mb-4">
          <Link to="/cruzadas">
            <button className="w-full relative overflow-hidden flex items-center justify-center space-x-3 px-6 py-4 text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400 transition-all duration-300 text-lg font-bold bg-gradient-to-r from-purple-900/80 via-blue-800/60 to-purple-900/80 hover:from-purple-800/90 hover:via-blue-700/70 hover:to-purple-800/90 group shadow-lg hover:shadow-purple-500/20">
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <Gamepad2 className="w-6 h-6 relative z-10 text-purple-300" />
              <span className="relative z-10 text-purple-100">PALAVRAS CRUZADAS</span>
              
              {/* Partículas de fundo */}
              <div className="absolute top-1 right-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-70" />
              <div className="absolute bottom-2 left-3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-300 opacity-50" />
            </button>
          </Link>
        </div>
         
        <div className="space-y-4">
          {links.map((link, index) => (
            <LinkCard 
              key={index} 
              title={link.title} 
              description={link.description} 
              url={link.url} 
              icon={link.icon} 
              color={link.color} 
              delay={index * 100} 
            />
          ))}
        </div>

        <BlogSection isEnglish={isEnglish} />
        <Footer isVisible={isEnglish} />
      </div>

      {/* Help Assistant */}
      <HelpAssistant isEnglish={isEnglish} />

      {/* Music Player */}
      <MusicPlayer hidden={mobileMenuOpen} />
    </div>
  );
};

export default Index;
