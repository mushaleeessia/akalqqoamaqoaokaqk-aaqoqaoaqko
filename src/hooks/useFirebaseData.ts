
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  author: string;
}

export const useFirebaseData = () => {
  const [about, setAbout] = useState("Moderadora apaixonada do MushMC, mantendo nossa comunidade segura e divertida! Amo construir, explorar e ajudar outros jogadores.");
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "1",
      title: "Bem-vindos ao MushMC!",
      date: "13 de Junho, 2025",
      excerpt: "Uma nova jornada começou no servidor mais incrível do Minecraft Brasil...",
      content: "Olá, pessoal! Estou muito animada para compartilhar com vocês algumas novidades incríveis que estão acontecendo no MushMC. Como moderadora, tenho visto nossa comunidade crescer de forma incrível, e cada dia traz novas aventuras e amizades. Temos novos mundos para explorar, eventos especiais toda semana, e uma comunidade que realmente se importa uns com os outros. Se você ainda não faz parte da nossa família MushMC, este é o momento perfeito para se juntar a nós!",
      author: "aleeessia"
    },
    {
      id: "2",
      title: "Evento de Construção - Resultados",
      date: "10 de Junho, 2025", 
      excerpt: "Os resultados do nosso último evento de construção estão aqui...",
      content: "Wow! O evento de construção desta semana foi absolutamente incrível. Vimos algumas das construções mais criativas que já passaram pelo servidor. Desde castelos medievais até cidades futuristas, nossa comunidade realmente mostrou do que é capaz. Parabéns a todos os participantes e um agradecimento especial aos nossos juízes voluntários. O próximo evento já está sendo planejado - fiquem atentos aos anúncios!",
      author: "aleeessia"
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for about section changes
    const aboutRef = ref(database, 'profile/about');
    const aboutUnsubscribe = onValue(aboutRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAbout(data);
      }
    });

    // Listen for blog posts changes
    const postsRef = ref(database, 'blog');
    const postsUnsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPosts(postsArray);
      }
      setLoading(false);
    });

    return () => {
      aboutUnsubscribe();
      postsUnsubscribe();
    };
  }, []);

  return { about, posts, loading };
};
