
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebaseData } from "@/hooks/useFirebaseData";

interface ProfileSectionProps {
  isEnglish: boolean;
}

export const ProfileSection = ({ isEnglish }: ProfileSectionProps) => {
  const { about, loading } = useFirebaseData(isEnglish);

  return (
    <div className="text-center space-y-4 animate-fade-in">
      <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-red-600/50">
        <Avatar className="w-full h-full">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1494790108755-2616c96f40db?w=150&h=150&fit=crop&crop=face" 
            alt="aleeessia"
          />
          <AvatarFallback className="bg-red-900 text-red-100">A</AvatarFallback>
        </Avatar>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">aleeessia.com</h1>
        <p className="text-red-300 text-sm mb-4">
          {isEnglish ? 'teeermo (also check term.ooo!)' : 'teeermo (veja também term.ooo!)'}
        </p>
        <p className="text-gray-300 text-sm leading-relaxed max-w-xs mx-auto">
          {loading ? (isEnglish ? 'Loading...' : 'Carregando...') : about}
        </p>
      </div>
    </div>
  );
};
