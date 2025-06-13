
import { ProfileSection } from "@/components/ProfileSection";
import { LinkCard } from "@/components/LinkCard";
import { award, link, youtube } from "lucide-react";

const Index = () => {
  const links = [
    {
      title: "Gaming Portfolio",
      description: "Showcase of my gaming achievements",
      url: "https://example.com/portfolio",
      icon: award,
      color: "from-yellow-400 to-yellow-600"
    },
    {
      title: "YouTube Channel",
      description: "Gaming content and reviews",
      url: "https://youtube.com/@example",
      icon: youtube,
      color: "from-red-500 to-red-600"
    },
    {
      title: "Steam Profile",
      description: "Connect with me on Steam",
      url: "https://steamcommunity.com/id/example",
      icon: link,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Twitch Channel",
      description: "Live gaming streams",
      url: "https://twitch.tv/example",
      icon: link,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Discord Server",
      description: "Join our gaming community",
      url: "https://discord.gg/example",
      icon: link,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Gaming Blog",
      description: "Latest gaming news and reviews",
      url: "https://example.com/blog",
      icon: link,
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
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
            Made with ✨ for gamers, by gamers
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
