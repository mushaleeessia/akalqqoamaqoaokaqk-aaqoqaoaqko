
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLinkClickLogger } from "@/hooks/useLinkClickLogger";

interface LinkCardProps {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export const LinkCard = ({ title, description, url, icon: Icon, color, delay = 0 }: LinkCardProps) => {
  const { logClick } = useLinkClickLogger();

  const handleClick = async () => {
    // Log the click
    await logClick(title, url);
    
    // Open the link
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="animate-fade-in cursor-pointer group"
      style={{ animationDelay: `${delay}ms` }}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-xl bg-gray-900/70 backdrop-blur-sm border border-red-900/50 hover:border-red-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 hover:-translate-y-1">
        {/* Background gradient on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-15 transition-opacity duration-300",
          color
        )}></div>
        
        <div className="relative p-6 flex items-center space-x-4">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
            color
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-grow min-w-0">
            <h3 className="text-white font-semibold text-lg group-hover:text-red-300 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-gray-400 text-sm truncate">
              {description}
            </p>
          </div>
          
          {/* Arrow indicator */}
          <div className="flex-shrink-0 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-red-400/10 to-transparent skew-x-12"></div>
      </div>
    </div>
  );
};
