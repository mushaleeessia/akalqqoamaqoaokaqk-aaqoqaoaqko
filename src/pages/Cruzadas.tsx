
import { CrosswordGame } from "@/components/CrosswordGame";
import { CrosswordLogin } from "@/components/CrosswordLogin";
import { useAuth } from "@/contexts/AuthContext";

const Cruzadas = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center text-white">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <CrosswordLogin />;
  }

  return <CrosswordGame />;
};

export default Cruzadas;
