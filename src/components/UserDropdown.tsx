
import { useState } from 'react';
import { ChevronDown, Settings, LogOut, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface UserDropdownProps {
  nickname: string;
}

export const UserDropdown = ({ nickname }: UserDropdownProps) => {
  const { signOut, user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
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
      <Dialog>
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
            <DialogTrigger asChild>
              <DropdownMenuItem className="text-white hover:bg-gray-700 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Mais opções
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="bg-gray-800 border-gray-700 text-white z-50">
          <DialogHeader>
            <DialogTitle>Opções da conta</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta
            </Button>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar conta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white z-50">
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
