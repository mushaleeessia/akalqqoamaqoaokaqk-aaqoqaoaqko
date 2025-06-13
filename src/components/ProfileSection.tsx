
import { useState } from "react";

export const ProfileSection = () => {
  const [about, setAbout] = useState("Moderadora apaixonada do MushMC, mantendo nossa comunidade segura e divertida! Amo construir, explorar e ajudar outros jogadores.");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="text-center animate-fade-in">
      {/* Profile Image */}
      <div className="relative inline-block mb-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-600 via-red-700 to-amber-800 p-1 shadow-2xl shadow-red-900/40">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
            <img 
              src="https://mc-heads.net/avatar/80eba0b3-159a-48bf-9613-307634a45057/128" 
              alt="aleeessia Minecraft Skin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 blur-xl animate-pulse"></div>
      </div>

      {/* Name and Title */}
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-600">aleeessia</span>
      </h1>
      
      <p className="text-gray-300 text-lg mb-4">
        Moderadora MushMC
      </p>
      
      {/* About Section - Hidden edit functionality */}
      <div className="max-w-xs mx-auto mb-4">
        <div className="space-y-2">
          <p className="text-gray-200 text-sm leading-relaxed bg-gray-800/40 p-3 rounded-lg border border-red-900/30">
            {about}
          </p>
          {/* Edit functionality hidden from public view */}
          <div className="hidden">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full p-3 text-sm bg-gray-800 text-gray-300 rounded-lg border border-red-800 focus:border-red-600 focus:outline-none resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-red-400 hover:text-red-300 text-xs underline"
              >
                Editar sobre mim
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
    </div>
  );
};
