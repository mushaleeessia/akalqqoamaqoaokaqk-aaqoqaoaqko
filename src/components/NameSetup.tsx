
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NameSetupProps {
  onComplete: () => void;
}

export const NameSetup = ({ onComplete }: NameSetupProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: name.trim() })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Bem-vindo ao teeermo!
            </h1>
            <p className="text-white/80 text-lg">
              Escolha um nome para começar a jogar:
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 16))}
                maxLength={16}
                className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/50 rounded-lg p-3"
                required
              />
              <p className="text-white/60 text-sm mt-2">
                Máximo 16 caracteres ({name.length}/16)
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {loading ? 'Salvando...' : 'Começar a jogar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
