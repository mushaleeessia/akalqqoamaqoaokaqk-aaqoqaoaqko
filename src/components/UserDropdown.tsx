
import { useState } from 'react';
import { ChevronDown, Settings, LogOut, Trash2, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TermoStats } from './TermoStats';
import { GameMode } from './GameModeSelector';
import { sendAccountDeletionToDiscord } from '@/utils/discordWebhook';

interface UserDropdownProps {
  nickname: string;
  currentMode: GameMode | 'crossword';
}

export const UserDropdown = ({ nickname, currentMode }: UserDropdownProps) => {
  const { signOut, user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Primeiro, buscar os dados do perfil antes de deletar
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Enviar webhook de deleção de conta
      if (profileData) {
        await sendAccountDeletionToDiscord(profileData);
      }

      // Depois deletar a conta
      const { error } = await supabase.rpc('delete_user_account', {
        user_uuid: user.id
      });

      if (error) {
        setIsDeleting(false);
        return;
      }

      await signOut();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 flex items-center gap-2"
          >
            {nickname}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-48 bg-gray-800 border-gray-700 z-50" 
          align="end"
        >
          <DropdownMenuItem 
            className="text-white hover:bg-gray-700 cursor-pointer"
            onClick={() => setShowStatsDialog(true)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver estatísticas
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            className="text-white hover:bg-gray-700 cursor-pointer"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-white hover:bg-gray-700 cursor-pointer"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletear conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Estatísticas do Jogo</DialogTitle>
          </DialogHeader>
          <TermoStats mode={currentMode} isGuest={false} />
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta ação não pode ser desfeita. Se você deletar sua conta, você irá perder 
              todas as suas estatísticas, progresso e dados associados à sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDeleteDialog(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deletando...' : 'Deletar conta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
