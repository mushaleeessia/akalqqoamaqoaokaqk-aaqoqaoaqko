
import { ChevronDown, Calendar, User } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  author: string;
}

export const BlogSection = () => {
  const [posts] = useState<BlogPost[]>([
    {
      id: "1",
      title: "Bem-vindos ao MushMC!",
      date: "13 de Junho, 2025",
      excerpt: "Uma nova jornada começou no servidor mais incrível do Minecraft Brasil...",
      content: "Olá, pessoal! Estou muito animada para compartilhar com vocês algumas novidades incríveis que estão acontecendo no MushMC. Como moderadora, tenho visto nossa comunidade crescer de forma incrível, e cada dia traz novas aventuras e amizades. Temos novos mundos para explorar, eventos especiais toda semana, e uma comunidade que realmente se importa uns com os outros. Se você ainda não faz parte da nossa família MushMC, este é o momento perfeito para se juntar a nós!",
      author: "aleeessia"
    },
    {
      id: "2",
      title: "Evento de Construção - Resultados",
      date: "10 de Junho, 2025", 
      excerpt: "Os resultados do nosso último evento de construção estão aqui...",
      content: "Wow! O evento de construção desta semana foi absolutamente incrível. Vimos algumas das construções mais criativas que já passaram pelo servidor. Desde castelos medievais até cidades futuristas, nossa comunidade realmente mostrou do que é capaz. Parabéns a todos os participantes e um agradecimento especial aos nossos juízes voluntários. O próximo evento já está sendo planejado - fiquem atentos aos anúncios!",
      author: "aleeessia"
    }
  ]);

  return (
    <div className="mt-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-600 mb-2">
          Blog & Novidades
        </h2>
        <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {posts.map((post) => (
          <AccordionItem 
            key={post.id} 
            value={post.id}
            className="border-none"
          >
            <div className="bg-gray-900/70 backdrop-blur-sm border border-red-900/50 rounded-xl overflow-hidden hover:border-red-600/50 transition-all duration-300">
              <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                <div className="flex flex-col items-start text-left space-y-2 flex-grow">
                  <h3 className="text-white font-semibold text-lg group-hover:text-red-300 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {post.excerpt}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="pt-4 border-t border-red-900/30">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
