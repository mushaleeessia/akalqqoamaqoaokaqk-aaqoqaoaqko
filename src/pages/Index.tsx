

import { useState } from "react";
import { ProfileSection } from "@/components/ProfileSection";
import { LinkCard } from "@/components/LinkCard";
import { BlogSection } from "@/components/BlogSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HelpAssistant } from "@/components/HelpAssistant";
import { Globe, MessageSquare, Video } from "lucide-react";

const Index = () => {
  const [isEnglish, setIsEnglish] = useState(false);

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

  const handleLanguageChange = (newIsEnglish: boolean) => {
    setIsEnglish(newIsEnglish);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950/40 to-gray-900 relative overflow-hidden">
      {/* Header do Mush */}
      <Header onLanguageChange={handleLanguageChange} />

      {/* Dark red ambient background elements - enhanced with more circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top area circles */}
        <div className="absolute top-16 left-1/6 w-1 h-1 bg-red-700 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-24 right-1/5 w-2 h-2 bg-red-500 rounded-full animate-pulse delay-100 opacity-40"></div>
        <div className="absolute top-32 left-3/4 w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-20 left-1/2 w-1 h-1 bg-red-800 rounded-full animate-pulse delay-300 opacity-70"></div>
        <div className="absolute top-40 right-2/5 w-1 h-1 bg-red-600 rounded-full animate-pulse delay-400 opacity-55"></div>
        <div className="absolute top-28 left-1/8 w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-500 opacity-65"></div>
        <div className="absolute top-36 right-1/8 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-600 opacity-45"></div>
        <div className="absolute top-12 left-2/5 w-1 h-1 bg-red-700 rounded-full animate-pulse delay-700 opacity-80"></div>
        <div className="absolute top-44 right-3/5 w-2 h-2 bg-amber-800 rounded-full animate-pulse delay-800 opacity-35"></div>
        <div className="absolute top-14 right-1/6 w-1 h-1 bg-red-400 rounded-full animate-pulse delay-900 opacity-60"></div>
        
        {/* Middle area circles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-600 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-amber-600 rounded-full animate-pulse delay-100"></div>
        <div className="absolute top-2/5 left-1/6 w-1.5 h-1.5 bg-red-700 rounded-full animate-pulse delay-400 opacity-60"></div>
        <div className="absolute top-1/2 right-1/6 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-600 opacity-80"></div>
        <div className="absolute top-3/5 left-4/5 w-2 h-2 bg-amber-700 rounded-full animate-pulse delay-700 opacity-45"></div>
        <div className="absolute top-1/3 left-1/8 w-1 h-1 bg-red-800 rounded-full animate-pulse delay-1000 opacity-70"></div>
        <div className="absolute top-2/5 right-2/5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse delay-1100 opacity-55"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-red-600 rounded-full animate-pulse delay-1200 opacity-65"></div>
        <div className="absolute top-3/5 right-3/4 w-1 h-1 bg-red-700 rounded-full animate-pulse delay-1300 opacity-50"></div>
        <div className="absolute top-1/4 right-1/8 w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-1400 opacity-40"></div>
        <div className="absolute top-7/12 left-1/5 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1500 opacity-75"></div>
        <div className="absolute top-5/12 right-1/5 w-2 h-2 bg-red-800 rounded-full animate-pulse delay-1600 opacity-30"></div>
        
        {/* Bottom area circles */}
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-red-700 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-amber-700 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/5 left-1/5 w-1.5 h-1.5 bg-red-800 rounded-full animate-pulse delay-800 opacity-55"></div>
        <div className="absolute bottom-32 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-pulse delay-900 opacity-70"></div>
        <div className="absolute bottom-40 left-2/3 w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-1000 opacity-65"></div>
        <div className="absolute bottom-48 right-1/6 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1700 opacity-60"></div>
        <div className="absolute bottom-24 left-1/4 w-1 h-1 bg-red-700 rounded-full animate-pulse delay-1800 opacity-45"></div>
        <div className="absolute bottom-36 right-2/5 w-1.5 h-1.5 bg-amber-800 rounded-full animate-pulse delay-1900 opacity-55"></div>
        <div className="absolute bottom-28 left-3/5 w-1 h-1 bg-red-600 rounded-full animate-pulse delay-2000 opacity-70"></div>
        <div className="absolute bottom-44 right-4/5 w-1 h-1 bg-red-400 rounded-full animate-pulse delay-2100 opacity-50"></div>
        <div className="absolute bottom-16 left-1/8 w-2 h-2 bg-amber-700 rounded-full animate-pulse delay-2200 opacity-35"></div>
        
        {/* Side area circles */}
        <div className="absolute top-3/4 left-12 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-1100 opacity-50"></div>
        <div className="absolute top-1/6 right-12 w-2 h-2 bg-red-700 rounded-full animate-pulse delay-1200 opacity-40"></div>
        <div className="absolute top-4/5 right-8 w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-1300 opacity-60"></div>
        <div className="absolute top-1/8 left-8 w-1 h-1 bg-red-600 rounded-full animate-pulse delay-1400 opacity-75"></div>
        <div className="absolute top-5/6 left-16 w-1 h-1 bg-red-800 rounded-full animate-pulse delay-2300 opacity-65"></div>
        <div className="absolute top-1/12 right-16 w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse delay-2400 opacity-45"></div>
        <div className="absolute top-7/8 right-20 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-2500 opacity-70"></div>
        <div className="absolute top-1/5 left-4 w-1 h-1 bg-red-700 rounded-full animate-pulse delay-2600 opacity-55"></div>
        <div className="absolute top-4/5 left-6 w-1.5 h-1.5 bg-amber-800 rounded-full animate-pulse delay-2700 opacity-40"></div>
        <div className="absolute top-1/3 right-4 w-1 h-1 bg-red-600 rounded-full animate-pulse delay-2800 opacity-80"></div>
        
        {/* Extra scattered circles for more density */}
        <div className="absolute top-1/7 left-3/7 w-1 h-1 bg-red-500 rounded-full animate-pulse delay-2900 opacity-50"></div>
        <div className="absolute top-3/7 right-2/7 w-1 h-1 bg-amber-700 rounded-full animate-pulse delay-3000 opacity-60"></div>
        <div className="absolute top-5/7 left-5/7 w-1.5 h-1.5 bg-red-700 rounded-full animate-pulse delay-3100 opacity-45"></div>
        <div className="absolute top-6/7 right-4/7 w-1 h-1 bg-red-600 rounded-full animate-pulse delay-3200 opacity-65"></div>
        <div className="absolute top-2/7 left-6/7 w-1 h-1 bg-amber-600 rounded-full animate-pulse delay-3300 opacity-55"></div>
        <div className="absolute top-4/7 right-6/7 w-1 h-1 bg-red-800 rounded-full animate-pulse delay-3400 opacity-70"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        <ProfileSection isEnglish={isEnglish} />
        
        <div className="space-y-4 mt-8">
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
      <HelpAssistant />
    </div>
  );
};

export default Index;

