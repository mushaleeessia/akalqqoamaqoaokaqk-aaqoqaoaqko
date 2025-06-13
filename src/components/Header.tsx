
import { ShoppingCart, Users, Trophy, Shield, HelpCircle, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const navItems = [
    { title: "Loja", url: "https://mush.com.br/loja", icon: ShoppingCart },
    { title: "Fórum", url: "https://forum.mush.com.br", icon: MessageSquare },
    { title: "Equipe", url: "https://mush.com.br/staff", icon: Users },
    { title: "Leaderboard", url: "https://mush.com.br/leaderboard/bedwars", icon: Trophy },
    { title: "Punições", url: "https://mush.com.br/punicoes", icon: Shield },
  ];

  const helpItems = [
    { title: "Área de atendimento", url: "https://forum.mush.com.br/category/69/%C3%A1rea-de-atendimento" },
    { title: "Suporte de vendas", url: "https://forum.mush.com.br/topic/145928/atendimento-email-de-vendas" },
    { title: "Problemas de conexão", url: "https://mush.com.br/blog/problemas-de-conexao" },
  ];

  const supportItems = [
    { title: "Área de atendimento", url: "https://forum.mush.com.br/category/69/%C3%A1rea-de-atendimento" },
    { title: "Suporte de vendas", url: "https://forum.mush.com.br/topic/145928/atendimento-email-de-vendas" },
    { title: "Problemas de conexão", url: "https://mush.com.br/blog/problemas-de-conexao" },
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
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.title}</span>
                </a>
              );
            })}
            
            {/* Dropdown menu para Ajuda */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium">
                  <HelpCircle className="w-4 h-4" />
                  <span>Ajuda</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 bg-red-900 border-red-700 min-w-[200px]">
                {helpItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:bg-red-700 cursor-pointer w-full block px-2 py-1.5"
                    >
                      {item.title}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button className="p-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200">
              <MessageSquare className="w-4 h-4" />
            </button>
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
