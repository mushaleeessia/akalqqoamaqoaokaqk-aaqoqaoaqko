
import { Pickaxe } from "lucide-react";
import { useState } from "react";

export const ProfileSection = () => {
  const [about, setAbout] = useState("Passionate Minecraft moderator at MushMC, keeping our community safe and fun! Love building, exploring, and helping fellow players.");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="text-center animate-fade-in">
      {/* Profile Image */}
      <div className="relative inline-block mb-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 p-1 shadow-2xl shadow-green-500/20">
          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
            <Pickaxe className="w-16 h-16 text-green-400" />
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-xl animate-pulse"></div>
      </div>

      {/* Name and Title */}
      <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">aleeessia</span>
      </h1>
      
      <p className="text-gray-300 text-lg mb-4">
        MushMC Moderator
      </p>
      
      {/* Editable About Section */}
      <div className="max-w-xs mx-auto mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full p-3 text-sm bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm leading-relaxed">
              {about}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-green-400 hover:text-green-300 text-xs underline"
            >
              Edit about me
            </button>
          </div>
        )}
      </div>

      {/* Decorative line */}
      <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
    </div>
  );
};
