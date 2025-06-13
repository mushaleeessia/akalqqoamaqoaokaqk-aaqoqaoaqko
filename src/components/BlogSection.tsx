
import { Calendar, User } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFirebaseData } from "@/hooks/useFirebaseData";

interface BlogSectionProps {
  isEnglish: boolean;
}

export const BlogSection = ({ isEnglish }: BlogSectionProps) => {
  const { posts, loading } = useFirebaseData(isEnglish);

  if (loading) {
    return (
      <div className="mt-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-600 mb-2">
            {isEnglish ? "Blog & News" : "Blog & Novidades"}
          </h2>
          <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        </div>
        <div className="text-center text-gray-400 flex items-center justify-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
          {isEnglish ? "Translating posts..." : "Traduzindo posts..."}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-600 mb-2">
          {isEnglish ? "Blog & News" : "Blog & Novidades"}
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
