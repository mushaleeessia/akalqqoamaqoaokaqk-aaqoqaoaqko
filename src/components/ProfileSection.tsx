
import { Award } from "lucide-react";

export const ProfileSection = () => {
  return (
    <div className="text-center animate-fade-in">
      {/* Profile Image */}
      <div className="relative inline-block mb-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-1 shadow-2xl shadow-yellow-500/20">
          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
            <Award className="w-16 h-16 text-yellow-400" />
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 blur-xl animate-pulse"></div>
      </div>

      {/* Name and Title */}
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
        Gaming <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Champion</span>
      </h1>
      
      <p className="text-gray-300 text-lg mb-4">
        Award-Winning Gamer
      </p>
      
      <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
        Passionate about gaming, streaming, and building amazing communities. Follow my journey across platforms!
      </p>

      {/* Decorative line */}
      <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
    </div>
  );
};
