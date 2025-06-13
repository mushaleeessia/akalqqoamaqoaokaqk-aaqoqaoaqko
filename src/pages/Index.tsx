
import { useState } from "react";
import { ProfileSection } from "@/components/ProfileSection";
import { LinkCard } from "@/components/LinkCard";
import { BlogSection } from "@/components/BlogSection";
import { Header } from "@/components/Header";
import { Globe, MessageSquare } from "lucide-react";

const Index = () => {
  const [isEnglish, setIsEnglish] = useState(false);

  const links = [
    {
      title: isEnglish ? "My TikTok" : "Meu TikTok",
      description: isEnglish ? "Follow me @aleeessia_" : "Me segue @aleeessia_",
      url: "https://tiktok.com/@aleeessia_",
      icon: Globe,
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
      title: isEnglish ? "Mush Forum" : "Fórum Mush",
      description: isEnglish ? "Community discussions and updates" : "Discussões e atualizações da comunidade",
      url: "https://forum.mush.com.br",
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

      {/* Dark red ambient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-600 rounded-sm animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-amber-600 rounded-sm animate-pulse delay-100"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-red-700 rounded-sm animate-pulse delay-200"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-red-500 rounded-sm animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-amber-700 rounded-sm animate-pulse delay-500"></div>
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
      </div>
    </div>
  );
};

export default Index;
