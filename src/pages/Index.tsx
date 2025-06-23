import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BlogSection } from "@/components/BlogSection";
import { ProfileSection } from "@/components/ProfileSection";
import { Footer } from "@/components/Footer";
import { MusicPlayer } from "@/components/MusicPlayer";
import { TwitchEmbed } from "@/components/TwitchEmbed";
import { HelpAssistant } from "@/components/HelpAssistant";
import { LinkCard } from "@/components/LinkCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const [isEnglish, setIsEnglish] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleLanguageChange = (newIsEnglish: boolean) => {
    setIsEnglish(newIsEnglish);
  };

  const handleMobileMenuChange = (open: boolean) => {
    setMobileMenuOpen(open);
  };

  const links = [
    {
      title: isEnglish ? "My TikTok" : "Meu TikTok",
      description: isEnglish ? "Follow me @aleeessia_" : "Me segue @aleeessia_",
      url: "https://tiktok.com/@aleeessia_",
      icon: Video,
      color: "from-red-900 to-red-700"
    },
    {
      title: isEnglish ? "Mush Website" : "Site Mush",
      description: isEnglish ? "Official server website" : "Site oficial do servidor",
      url: "https://mush.com.br",
      icon: Globe,
      color: "from-amber-900 to-red-800"
    },
    {
      title: isEnglish ? "Mush Discord" : "Discord Mush",
      description: isEnglish ? "Join our Discord community" : "Entre no nosso Discord",
      url: "https://discord.gg/mush",
      icon: MessageSquare,
      color: "from-red-800 to-amber-900"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative overflow-x-hidden">
      {/* Header */}
      <Header 
        onLanguageChange={handleLanguageChange}
        onMobileMenuChange={handleMobileMenuChange}
      />

      {/* Main content */}
      <main className="container mx-auto px-4 pt-8 pb-32 max-w-7xl">
        {/* Hero section com link para Termo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent leading-tight">
            {isEnglish ? "MUSH Network" : "Rede MUSH"}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {isEnglish 
              ? "The best Minecraft server in Brazil. Join our community and have unique experiences!"
              : "O melhor servidor de Minecraft do Brasil. Entre em nossa comunidade e tenha experiências únicas!"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105">
              <a href="https://mush.com.br" target="_blank" rel="noopener noreferrer">
                {isEnglish ? "Join the Server" : "Entrar no Servidor"}
              </a>
            </Button>
            <Button asChild variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200">
              <Link to="/termo">
                🎮 {isEnglish ? "Play Termo Game" : "Jogar Termo"}
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 text-sm rounded-lg">
                <Link to="/auth">
                  {isEnglish ? "Login to Save Progress" : "Fazer Login"}
                </Link>
              </Button>
            )}
          </div>
        </div>

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

        {/* Grid sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProfileSection isEnglish={isEnglish} />
          <TwitchEmbed />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <BlogSection isEnglish={isEnglish} />
          </div>
          <div className="space-y-6">
            <LinkCard 
              title={isEnglish ? "Quick Links" : "Links Rápidos"}
              links={[
                { title: isEnglish ? "Discord Server" : "Servidor Discord", url: "https://discord.gg/mush", isExternal: true },
                { title: isEnglish ? "Rules" : "Regras", url: "https://mush.com.br/regras", isExternal: true },
                { title: isEnglish ? "Vote for the Server" : "Votar no Servidor", url: "https://mush.com.br/votar", isExternal: true },
                { title: isEnglish ? "Donate" : "Doar", url: "https://mush.com.br/loja", isExternal: true }
              ]}
              isEnglish={isEnglish}
            />
            <MusicPlayer />
          </div>
        </div>
      </main>

      {/* Help Assistant */}
      <HelpAssistant isEnglish={isEnglish} isMobileMenuOpen={mobileMenuOpen} />

      {/* Music Player */}
      <MusicPlayer hidden={mobileMenuOpen} />
    </div>
  );
}
