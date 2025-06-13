
import { ShoppingCart, Users, Trophy, Shield, HelpCircle, MessageSquare, ChevronDown, Menu, X, Flag } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);

  const navItems = [
    { 
      title: isEnglish ? "Store" : "Loja", 
      url: "https://mush.com.br/loja", 
      icon: ShoppingCart 
    },
    { 
      title: isEnglish ? "Forum" : "Fórum", 
      url: "https://forum.mush.com.br", 
      icon: MessageSquare 
    },
    { 
      title: isEnglish ? "Staff" : "Equipe", 
      url: "https://mush.com.br/staff", 
      icon: Users 
    },
    { 
      title: "Leaderboard", 
      url: "https://mush.com.br/leaderboard/bedwars", 
      icon: Trophy 
    },
    { 
      title: isEnglish ? "Punishments" : "Punições", 
      url: "https://mush.com.br/punicoes", 
      icon: Shield 
    },
  ];

  const helpItems = [
    { 
      title: isEnglish ? "Support Area" : "Área de atendimento", 
      url: "https://forum.mush.com.br/category/69/%C3%A1rea-de-atendimento" 
    },
    { 
      title: isEnglish ? "Sales Support" : "Suporte de vendas", 
      url: "https://forum.mush.com.br/topic/145928/atendimento-email-de-vendas" 
    },
    { 
      title: isEnglish ? "Connection Issues" : "Problemas de conexão", 
      url: "https://mush.com.br/blog/problemas-de-conexao" 
    },
  ];

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  return (
    <header className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-700/50 relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Logo e navegação principal */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-1">
            <div className="text-white font-bold text-xl tracking-wider">MUSH</div>
          </div>

          {/* Navegação principal - desktop */}
          <nav className="hidden md:flex items-center space-x-4 flex-1 justify-center max-w-4xl">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => handleLinkClick(item.url)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.title}</span>
                </button>
              );
            })}
            
            {/* Dropdown menu para Ajuda */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium">
                  <HelpCircle className="w-4 h-4" />
                  <span>{isEnglish ? "Help" : "Ajuda"}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 bg-red-900 border-red-700 min-w-[200px]" align="end">
                {helpItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <button 
                      onClick={() => handleLinkClick(item.url)}
                      className="text-white hover:bg-red-700 cursor-pointer w-full text-left px-2 py-1.5"
                    >
                      {item.title}
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Menu mobile - botão */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile - conteúdo */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-red-700/30 mt-3">
            <nav className="flex flex-col space-y-2 pt-4">
              {/* Switch de idiomas */}
              <div className="flex items-center justify-between px-4 py-3 bg-red-800/30 rounded-lg border border-red-600/30">
                <div className="flex items-center space-x-3">
                  <Flag className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    {isEnglish ? "🇬🇧 English" : "🇧🇷 Português"}
                  </span>
                </div>
                <Switch
                  checked={isEnglish}
                  onCheckedChange={toggleLanguage}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                />
              </div>

              {/* Texto informativo para estrangeiros */}
              {isEnglish && (
                <div className="px-4 py-3 bg-amber-900/50 rounded-lg border border-amber-600/30 text-white text-xs leading-relaxed">
                  <p className="font-medium mb-2">Are you a foreigner and want to play in MushMC? Read below.</p>
                  <p className="mb-2">
                    <strong>For Premium Accounts:</strong> Send an e-mail to contas@mush.com.br with your IGN and explain that you cannot login due to country restrictions;
                  </p>
                  <p>
                    <strong>For Cracked Accounts:</strong> Send an e-mail to contas@mush.com.br with the desired IGN and explain that you are unable to create accounts due to country restrictions.
                  </p>
                </div>
              )}

              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => handleLinkClick(item.url)}
                    className="flex items-center space-x-3 px-4 py-3 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.title}</span>
                  </button>
                );
              })}
              
              {/* Items de ajuda no mobile */}
              <div className="pt-2 border-t border-red-700/30">
                <div className="flex items-center space-x-3 px-4 py-2 text-white text-sm font-medium opacity-70">
                  <HelpCircle className="w-4 h-4" />
                  <span>{isEnglish ? "Help" : "Ajuda"}</span>
                </div>
                {helpItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleLinkClick(item.url)}
                    className="flex items-center space-x-3 px-8 py-2 text-white hover:bg-red-700 rounded-lg transition-all duration-200 text-sm"
                  >
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
