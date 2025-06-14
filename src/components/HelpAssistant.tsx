
import { useState } from "react";
import { MessageCircle, X, ExternalLink, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelpOption {
  id: string;
  title: string;
  description?: string;
  response: string;
  link?: string;
  category?: string;
}

const helpOptions: HelpOption[] = [
  {
    id: "staff",
    title: "Como entrar na Staff?",
    response: "Para entrar na staff do Mush, você precisa seguir algumas dicas importantes. Confira o guia completo no fórum:",
    link: "https://forum.mush.com.br/topic/67550/dicas-para-entrar-na-staff",
    category: "staff"
  },
  {
    id: "migration",
    title: "Migração de Contas",
    response: "Se você precisa migrar sua conta, siga o processo oficial descrito no fórum:",
    link: "https://forum.mush.com.br/topic/43053/migra%C3%A7%C3%A3o-de-contas",
    category: "conta"
  },
  {
    id: "forum",
    title: "Como criar conta no fórum?",
    response: "Para criar uma conta no fórum do Mush, siga este tutorial passo a passo:",
    link: "https://forum.mush.com.br/topic/50214/como-criar-uma-conta-no-f%C3%B3rum",
    category: "forum"
  },
  {
    id: "support",
    title: "Atendimento e Vendas",
    response: "Para entrar em contato com o suporte ou vendas, acesse:",
    link: "https://forum.mush.com.br/topic/145928/atendimento-email-de-vendas",
    category: "suporte"
  },
  {
    id: "report",
    title: "Fazer Denúncia",
    response: "Para fazer uma denúncia, acesse a área específica no fórum:",
    link: "https://forum.mush.com.br/category/16/den%C3%BAncias",
    category: "denuncia"
  },
  {
    id: "bug",
    title: "Reportar Bug",
    response: "Encontrou um bug? Reporte na área específica:",
    link: "https://forum.mush.com.br/category/5/bug-report",
    category: "bug"
  },
  {
    id: "appeal",
    title: "Fazer Appeal",
    response: "Para fazer um appeal (recurso), acesse:",
    link: "https://forum.mush.com.br/category/8/appeal",
    category: "appeal"
  },
  {
    id: "content",
    title: "Criar Conteúdo",
    response: "Quer criar conteúdo para o servidor? Solicite aqui:",
    link: "https://forum.mush.com.br/category/78/solicita%C3%A7%C3%A3o-para-cria%C3%A7%C3%A3o-de-conte%C3%BAdo",
    category: "conteudo"
  },
  {
    id: "general",
    title: "Área de Atendimento",
    response: "Para questões gerais de atendimento, acesse:",
    link: "https://forum.mush.com.br/category/69/%C3%A1rea-de-atendimento",
    category: "atendimento"
  }
];

export const HelpAssistant = () => {
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

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-gray-900 border border-red-800/50 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-scale-in z-50">
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
                {selectedOption ? selectedOption.title : "Ajuda Mush"}
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
                  Como posso ajudar você hoje?
                </p>
                {helpOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 border border-gray-700 hover:border-red-800/50 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-red-400 font-medium text-sm">
                      {option.title}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gray-800 p-4 rounded-lg transform transition-all duration-300 hover:scale-[1.01]">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedOption.response}
                  </p>
                </div>
                
                {selectedOption.link && (
                  <div className="bg-gradient-to-r from-red-900/20 to-amber-900/20 border border-red-800/30 rounded-lg p-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-scale-in" style={{ animationDelay: "150ms" }}>
                    <a
                      href={selectedOption.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all duration-200 hover:translate-x-1 text-sm group"
                    >
                      <ExternalLink size={14} className="transition-transform duration-200 group-hover:scale-110" />
                      Acessar no Fórum
                    </a>
                  </div>
                )}
                
                <button
                  onClick={handleBack}
                  className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300 text-gray-300 text-sm hover:scale-[1.02] hover:-translate-y-0.5 animate-fade-in"
                  style={{ animationDelay: "300ms" }}
                >
                  Voltar às opções
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button - fixed position */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-500 hover:scale-110 active:scale-95 bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 hover:shadow-xl hover:shadow-red-900/25 z-50"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white transition-all duration-300 hover:scale-110 animate-bounce" style={{ animationDuration: "2s" }} />
        )}
      </Button>
    </>
  );
};
