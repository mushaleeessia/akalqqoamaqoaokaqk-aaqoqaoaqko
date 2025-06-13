
import { ProfileSection } from "@/components/ProfileSection";
import { LinkCard } from "@/components/LinkCard";
import { Globe, MessageSquare } from "lucide-react";

const Index = () => {
  const links = [
    {
      title: "My TikTok",
      description: "Follow me @aleeessia_",
      url: "https://tiktok.com/@aleeessia_",
      icon: Globe, // Using Globe as TikTok icon since it's not in allowed icons
      color: "from-pink-500 to-purple-600"
    },
    {
      title: "MushMC Website",
      description: "Official server website",
      url: "https://mush.com.br",
      icon: Globe,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "MushMC Forum",
      description: "Community discussions and updates",
      url: "https://forum.mush.com.br",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-black relative overflow-hidden">
      {/* Minecraft-inspired background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-sm animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-300 rounded-sm animate-pulse delay-100"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-400 rounded-sm animate-pulse delay-200"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-emerald-300 rounded-sm animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-green-400 rounded-sm animate-pulse delay-500"></div>
        {/* Block-like decorative elements */}
        <div className="absolute top-1/5 right-1/5 w-3 h-3 bg-green-600/20 border border-green-400/30"></div>
        <div className="absolute bottom-1/5 left-1/5 w-4 h-4 bg-emerald-600/20 border border-emerald-400/30"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        <ProfileSection />
        
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

        {/* Footer */}
        <div className="text-center mt-12 mb-6">
          <p className="text-gray-400 text-sm">
            Made with 💚 for the MushMC community
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
