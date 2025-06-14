
import { ShoppingCart, Users, Trophy, Shield, HelpCircle, MessageSquare, ChevronDown, Menu, X, Flag, Globe } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ForeignerNotice } from "@/components/ForeignerNotice";

interface HeaderProps {
  onLanguageChange?: (isEnglish: boolean) => void;
}

export const Header = ({ onLanguageChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [clickingItem, setClickingItem] = useState<string | null>(null);

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

  const handleLinkClick = (url: string, itemTitle: string) => {
    setClickingItem(itemTitle);
    
    // Delay para mostrar a animação de completar
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setMobileMenuOpen(false);
      setClickingItem(null);
    }, 600);
  };

  const toggleLanguage = () => {
    const newLanguageState = !isEnglish;
    setIsEnglish(newLanguageState);
    onLanguageChange?.(newLanguageState);
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
              const isHovered = hoveredItem === item.title;
              const isClicking = clickingItem === item.title;
              
              return (
                <div key={item.title} className="relative">
                  <button
                    onClick={() => handleLinkClick(item.url, item.title)}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium overflow-hidden relative"
                  >
                    <IconComponent className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.title}</span>
                    
                    {/* Overlay verde que cresce da esquerda para direita */}
                    <div 
                      className={`absolute inset-0 bg-green-500 rounded-lg transition-all ease-out origin-left ${
                        isClicking 
                          ? 'scale-x-100 bg-green-400 opacity-80' 
                          : isHovered 
                            ? 'scale-x-100 opacity-20'
                            : 'scale-x-0 opacity-0'
                      }`}
                      style={{
                        transitionDuration: isClicking ? '600ms' : '200ms'
                      }}
                    />
                  </button>
                </div>
              );
            })}
            
            {/* Dropdown menu para Ajuda */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-4 py-2 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium overflow-hidden relative"
                    onMouseEnter={() => setHoveredItem('help')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <HelpCircle className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{isEnglish ? "Help" : "Ajuda"}</span>
                    <ChevronDown className="w-3 h-3 relative z-10" />
                    
                    {/* Overlay verde para o dropdown */}
                    <div 
                      className={`absolute inset-0 bg-green-500 rounded-lg transition-all duration-200 ease-out origin-left ${
                        hoveredItem === 'help' ? 'opacity-20 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                    />
                  </button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 bg-red-900 border-red-700 min-w-[200px]" align="end">
                {helpItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <button 
                      onClick={() => handleLinkClick(item.url, item.title)}
                      className="text-white hover:bg-red-700 cursor-pointer w-full text-left px-2 py-1.5"
                    >
                      {item.title}
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Switch de idiomas - desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{isEnglish ? "🇺🇸" : "🇧🇷"}</span>
              <span className="text-white text-sm font-medium">
                {isEnglish ? "English" : "Português"}
              </span>
            </div>
            <Switch
              checked={isEnglish}
              onCheckedChange={toggleLanguage}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
            />
          </div>

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

        {/* Aviso para estrangeiros - desktop (posicionado no canto direito) */}
        {isEnglish && (
          <div className="hidden md:block absolute top-16 right-4 z-50">
            <ForeignerNotice isVisible={isEnglish} />
          </div>
        )}

        {/* Menu mobile - conteúdo */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-red-700/30 mt-3">
            <nav className="flex flex-col space-y-2 pt-4">
              {/* Switch de idiomas */}
              <div className="flex items-center justify-between px-4 py-3 bg-red-800/30 rounded-lg border border-red-600/30">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{isEnglish ? "🇺🇸" : "🇧🇷"}</span>
                  <span className="text-white text-sm font-medium">
                    {isEnglish ? "English" : "Português"}
                  </span>
                </div>
                <Switch
                  checked={isEnglish}
                  onCheckedChange={toggleLanguage}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                />
              </div>

              {/* Aviso para estrangeiros - mobile (abaixo do switch) */}
              <ForeignerNotice isVisible={isEnglish} />

              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isClicking = clickingItem === item.title;
                
                return (
                  <div key={item.title} className="relative">
                    <button
                      onClick={() => handleLinkClick(item.url, item.title)}
                      className="flex items-center space-x-3 px-4 py-3 bg-red-800/50 hover:bg-red-700 text-white rounded-lg border border-red-600/30 hover:border-red-500 transition-all duration-200 text-sm font-medium w-full overflow-hidden relative"
                    >
                      <IconComponent className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{item.title}</span>
                      
                      {/* Overlay verde no mobile */}
                      <div 
                        className={`absolute inset-0 bg-green-500 rounded-lg transition-all ease-out origin-left ${
                          isClicking 
                            ? 'scale-x-100 bg-green-400 opacity-80' 
                            : 'scale-x-0 opacity-0'
                        }`}
                        style={{
                          transitionDuration: isClicking ? '600ms' : '200ms'
                        }}
                      />
                    </button>
                  </div>
                );
              })}
              
              {/* Items de ajuda no mobile */}
              <div className="pt-2 border-t border-red-700/30">
                <div className="flex items-center space-x-3 px-4 py-2 text-white text-sm font-medium opacity-70">
                  <HelpCircle className="w-4 h-4" />
                  <span>{isEnglish ? "Help" : "Ajuda"}</span>
                </div>
                {helpItems.map((item) => (
                  <div key={item.title} className="relative">
                    <button
                      onClick={() => handleLinkClick(item.url, item.title)}
                      className="flex items-center space-x-3 px-8 py-2 text-white hover:bg-red-700 rounded-lg transition-all duration-200 text-sm w-full overflow-hidden relative"
                    >
                      <span className="relative z-10">{item.title}</span>
                      
                      {/* Overlay verde para itens de ajuda no mobile */}
                      <div 
                        className={`absolute inset-0 bg-green-500 rounded-lg transition-all ease-out origin-left ${
                          clickingItem === item.title 
                            ? 'scale-x-100 bg-green-400 opacity-80' 
                            : 'scale-x-0 opacity-0'
                        }`}
                        style={{
                          transitionDuration: clickingItem === item.title ? '600ms' : '200ms'
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
