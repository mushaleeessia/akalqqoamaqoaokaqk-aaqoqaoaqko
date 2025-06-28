
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { validateNickname } from "@/utils/securityValidation";
import { securityLogger } from "@/utils/securityLogger";

interface NameSetupProps {
  onComplete: () => void;
}

export const NameSetup = ({ onComplete }: NameSetupProps) => {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { updateProfile, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // Validar nickname
      const validation = validateNickname(nickname);
      
      if (!validation.isValid) {
        // Log da tentativa de nickname inválido
        await securityLogger.logInvalidNickname(
          nickname,
          validation.reason || 'Nickname inválido',
          user?.id
        );
        
        setError(validation.reason || 'Nickname inválido');
        setIsLoading(false);
        return;
      }

      // Usar o nickname sanitizado se disponível
      const finalNickname = validation.sanitizedValue || nickname;
      
      await updateProfile({ nickname: finalNickname });
      onComplete();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao salvar nickname. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Escolha seu nickname
            </h1>
            <p className="text-white/80 text-lg">
              Como você gostaria de ser chamado?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Digite seu nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
                disabled={isLoading}
                maxLength={20}
                minLength={2}
              />
              <p className="text-white/60 text-sm mt-2">
                Entre 2 e 20 caracteres. Apenas letras, números e símbolos básicos.
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!nickname.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {isLoading ? 'Salvando...' : 'Continuar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
