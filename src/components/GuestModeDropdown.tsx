
import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGuestMode } from '@/hooks/useGuestMode';

export const GuestModeDropdown = () => {
  const { disableGuestMode } = useGuestMode();

  const handleExitGuestMode = () => {
    // Clear all guest data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('termo_guest_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Disable guest mode
    disableGuestMode();
    
    // Reload the page to show login screen
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-white bg-yellow-600/20 px-3 py-1 rounded-lg text-sm hover:bg-yellow-600/30 flex items-center gap-1"
        >
          Modo Convidado
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-48 bg-gray-800 border-gray-700 z-50" 
        align="end"
      >
        <DropdownMenuItem 
          className="text-white hover:bg-gray-700 cursor-pointer"
          onClick={handleExitGuestMode}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair do modo convidado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
