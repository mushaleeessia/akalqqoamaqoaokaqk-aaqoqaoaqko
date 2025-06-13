
import { ExternalLink, Users, Trophy, Shield, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const navItems = [
    { title: "Loja", url: "https://mush.com.br/loja", icon: ExternalLink },
    { title: "Fórum", url: "https://forum.mush.com.br", icon: MessageSquare },
    { title: "Equipe", url: "https://mush.com.br/equipe", icon: Users },
    { title: "Leaderboard", url: "https://mush.com.br/leaderboard", icon: Trophy },
    { title: "Punições", url: "https://mush.com.br/punicoes", icon: Shield },
    { title: "Ajuda", url: "https://mush.com.br/ajuda", icon: HelpCircle },
  ];

  const supportItems = [
    { title: "Área de atendimento", url: "https://mush.com.br/suporte" },
    { title: "Suporte de vendas", url: "https://mush.com.br/vendas" },
    { title: "Problemas de conexão", url: "https://mush.com.br/conexao" },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-700/50">
      <div className="container mx-auto px-4">
        {/* Logo e navegação principal */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-1">
            <div className="text-white font-bold text-xl tracking-wider">MUSH</div>
          </div>

          {/* Navegação principal */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                size="sm"
                asChild
                className="text-white hover:bg-red-700/50 hover:text-white transition-colors"
              >
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </a>
              </Button>
            ))}
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-700/50"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Área de suporte */}
        <div className="hidden lg:flex justify-end space-x-4 pb-2">
          {supportItems.map((item) => (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-200 hover:text-white transition-colors"
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};
