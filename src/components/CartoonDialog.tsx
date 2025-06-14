
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
      {/* Position the dialog relative to the profile section */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Offset to appear to the right of the profile image */}
        <div className="relative -mt-16 ml-24">
          <div className="bg-white border-4 border-black rounded-lg p-3 shadow-2xl animate-scale-in pointer-events-auto max-w-xs">
            {/* Speech bubble tail pointing left to the profile image */}
            <div className="absolute top-4 -left-3 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-black"></div>
            <div className="absolute top-4 -left-2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-white ml-[1px]"></div>
            
            {/* Message text with Undertale-style font */}
            <p className="text-black text-base font-mono font-bold tracking-wider text-center">
              {message}
            </p>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
