

import { useState } from "react";
import { MessageCircle, X, ExternalLink, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelpOption {
  id: string;
  title: string;
  title_en?: string;
  description?: string;
  response: string;
  response_en?: string;
  link?: string;
  category?: string;
}

const helpOptions: HelpOption[] = [
  {
    id: "contact",
    title: "Entre em contato! 📩",
    title_en: "Contact me! 📩",
    response: "Caso você queira entrar em contato diretamente comigo, sinta-se livre para fazer isso enviando um e-mail para contact@aleeessia.com",
    response_en: "If you want to contact me directly, feel free to do so by sending an email to contact@aleeessia.com",
    category: "contact"
  },
  {
    id: "staff",
    title: "Como entrar na Staff?",
    title_en: "How to join Staff?",
    response: "Para entrar na staff do Mush, você precisa seguir algumas dicas importantes. Confira o guia completo no fórum:",
    response_en: "To join the Mush staff, you need to follow some important tips. Check out the complete guide on the forum:",
    link: "https://forum.mush.com.br/topic/67550/dicas-para-entrar-na-staff",
    category: "staff"
  },
  {
    id: "migration",
    title: "Problemas com contas",
    title_en: "Account Problems",
    response: "Se você está com problemas com sua conta, confira o tópico oficial no fórum:",
    response_en: "If you're having problems with your account, check the official topic on the forum:",
    link: "https://forum.mush.com.br/topic/43053/migra%C3%A7%C3%A3o-de-contas",
    category: "conta"
  },
  {
    id: "forum",
    title: "Como criar conta no fórum?",
    title_en: "How to create a forum account?",
    response: "Para criar uma conta no fórum do Mush, siga este tutorial passo a passo:",
    response_en: "To create an account on the Mush forum, follow this step-by-step tutorial:",
    link: "https://forum.mush.com.br/topic/50214/como-criar-uma-conta-no-f%C3%B3rum",
    category: "forum"
  },
  {
    id: "support",
    title: "Atendimento de vendas",
    title_en: "Sales Support",
    response: "Para entrar em contato com o suporte de vendas, acesse:",
    response_en: "To contact sales support, access:",
    link: "https://forum.mush.com.br/topic/145928/atendimento-email-de-vendas",
    category: "suporte"
  },
  {
    id: "report",
    title: "Fazer Denúncia",
    title_en: "Make a Report",
    response: "Para fazer uma denúncia, acesse a área específica no fórum:",
    response_en: "To make a report, access the specific area on the forum:",
    link: "https://forum.mush.com.br/category/16/den%C3%BAncias",
    category: "denuncia"
  },
  {
    id: "bug",
    title: "Reportar Bug",
    title_en: "Report Bug",
    response: "Encontrou um bug? Reporte na área específica:",
    response_en: "Found a bug? Report it in the specific area:",
    link: "https://forum.mush.com.br/category/5/bug-report",
    category: "bug"
  },
  {
    id: "appeal",
    title: "Contestar Punição injusta",
    title_en: "Appeal Unfair Punishment",
    response: "Para contestar uma punição incorreta, acesse:",
    response_en: "To appeal an incorrect punishment, access:",
    link: "https://forum.mush.com.br/category/8/appeal",
    category: "appeal"
  },
  {
    id: "content",
    title: "Aplicar para criador de conteúdo",
    title_en: "Apply for Content Creator",
    response: "Para aplicar para ser um dos criadores de conteúdo do servidor, acesse:",
    response_en: "To apply to be one of the server's content creators, access:",
    link: "https://forum.mush.com.br/category/78/solicita%C3%A7%C3%A3o-para-cria%C3%A7%C3%A3o-de-conte%C3%BAdo",
    category: "conteudo"
  },
  {
    id: "general",
    title: "Área de Atendimento",
    title_en: "Support Area",
    response: "Para questões gerais de atendimento, acesse:",
    response_en: "For general support questions, access:",
    link: "https://forum.mush.com.br/category/69/%C3%A1rea-de-atendimento",
    category: "atendimento"
  }
];

interface HelpAssistantProps {
  isEnglish?: boolean;
}

export const HelpAssistant = ({ isEnglish = false }: HelpAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<HelpOption | null>(null);

  const handleOptionClick = (option: HelpOption) => {
    setSelectedOption(option);
  };

  const handleBack = () => {
    setSelectedOption(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedOption(null);
  };

  const handleEmailClick = () => {
    const subject = isEnglish 
      ? "Message from your website" 
      : "Mensagem do seu site";
    
    const body = isEnglish 
      ? "• My minecraft IGN:\n• My account type: (Cracked/Original)\n• My Question/Message:\n\n\n• I understand that this e-mail is only for asking questions about mush or sending messages to aleeessia: Yes" 
      : "• Meu nick no minecraft:\n• Meu tipo de conta: (Pirata/Original)\n• Minha dúvida/Mensagem:\n\n\n• Eu entendo que esse e-mail é apenas para tirar dúvidas ou enviar mensagens para a aleeessia: Sim";
    
    const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=contact@aleeessia.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const getText = (ptText: string, enText?: string) => {
    return isEnglish && enText ? enText : ptText;
  };

  return (
    <div className="fixed bottom-0 right-0 z-[9999]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-6 w-80 h-96 bg-gray-900 border border-red-800/50 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900 to-amber-900 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedOption && (
                <button
                  onClick={handleBack}
                  className="text-white hover:text-red-200 transition-all duration-200 hover:scale-110 hover:-translate-x-1"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <h3 className="text-white font-semibold text-sm">
                {selectedOption 
                  ? getText(selectedOption.title, selectedOption.title_en)
                  : getText("Ajuda Mush", "Mush Help")
                }
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-200 transition-all duration-200 hover:scale-110 hover:rotate-90"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedOption ? (
              <div className="space-y-2">
                <p className="text-gray-300 text-sm mb-4 animate-fade-in">
                  {getText("Como posso ajudar você hoje?", "How can I help you today?")}
                </p>
                {helpOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 border border-gray-700 hover:border-red-800/50 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-red-400 font-medium text-sm">
                      {getText(option.title, option.title_en)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gray-800 p-4 rounded-lg transform transition-all duration-300 hover:scale-[1.01]">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {getText(selectedOption.response, selectedOption.response_en)}
                  </p>
                </div>
                
                {selectedOption.id === "contact" ? (
                  <div className="bg-gradient-to-r from-red-900/20 to-amber-900/20 border border-red-800/30 rounded-lg p-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-scale-in" style={{ animationDelay: "150ms" }}>
                    <button
                      onClick={handleEmailClick}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all duration-200 hover:translate-x-1 text-sm group w-full"
                    >
                      <ExternalLink size={14} className="transition-transform duration-200 group-hover:scale-110" />
                      {getText("Enviar E-Mail", "Send E-Mail")}
                    </button>
                  </div>
                ) : selectedOption.link && (
                  <div className="bg-gradient-to-r from-red-900/20 to-amber-900/20 border border-red-800/30 rounded-lg p-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-scale-in" style={{ animationDelay: "150ms" }}>
                    <a
                      href={selectedOption.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all duration-200 hover:translate-x-1 text-sm group"
                    >
                      <ExternalLink size={14} className="transition-transform duration-200 group-hover:scale-110" />
                      {getText("Acessar no Fórum", "Access on Forum")}
                    </a>
                  </div>
                )}
                
                <button
                  onClick={handleBack}
                  className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300 text-gray-300 text-sm hover:scale-[1.02] hover:-translate-y-0.5 animate-fade-in"
                  style={{ animationDelay: "300ms" }}
                >
                  {getText("Voltar às opções", "Back to options")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button - ALWAYS fixed in bottom right */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          {/* Círculos de ondas saindo do botão - só aparecem quando fechado */}
          {!isOpen && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-red-400/70 animate-ripple pointer-events-none"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/60 animate-ripple-delay pointer-events-none"></div>
            </>
          )}
          
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full shadow-lg transition-all duration-500 hover:scale-110 active:scale-95 bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 hover:shadow-xl hover:shadow-red-900/25 relative z-10"
          >
            {/* Ícone principal */}
            {isOpen ? (
              <X className="w-6 h-6 text-white transition-transform duration-300 rotate-0 hover:rotate-90" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white transition-all duration-300 hover:scale-110" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

