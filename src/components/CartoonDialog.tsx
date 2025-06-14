
import { useState, useEffect } from "react";

interface CartoonDialogProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const CartoonDialog = ({ message, isVisible, onClose }: CartoonDialogProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Position the dialog relative to the center where the profile image would be */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Offset to appear above and to the right of the profile image */}
        <div className="relative -mt-24 ml-20">
          <div className="bg-white border-4 border-black rounded-lg p-4 shadow-2xl animate-scale-in pointer-events-auto max-w-xs">
            {/* Speech bubble tail pointing down and left to the profile image */}
            <div className="absolute -bottom-3 left-4 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-black"></div>
            <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white ml-[3px]"></div>
            
            {/* Message text with Undertale-style font */}
            <p className="text-black text-lg font-mono font-bold tracking-wider text-center">
              {message}
            </p>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
