
import { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
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
    console.log('🔥 Firebase hook iniciado - configurando listeners...');
    console.log('🔥 Database object:', database);
    console.log('🔥 Database URL:', database.app.options.databaseURL);
    
    // Teste direto com get() para verificar conectividade - CAMINHOS CORRIGIDOS
    const testConnection = async () => {
      try {
        console.log('🔥 🧪 TESTE: Tentando get() na raiz...');
        const rootRef = ref(database, '/');
        const rootSnapshot = await get(rootRef);
        console.log('🔥 🧪 Root exists?', rootSnapshot.exists());
        console.log('🔥 🧪 Root val:', rootSnapshot.val());
        
        console.log('🔥 🧪 TESTE: Tentando get() em a/profile/about...');
        const aboutTestRef = ref(database, 'a/profile/about');
        const aboutSnapshot = await get(aboutTestRef);
        console.log('🔥 🧪 About get() exists?', aboutSnapshot.exists());
        console.log('🔥 🧪 About get() val:', aboutSnapshot.val());
        
        console.log('🔥 🧪 TESTE: Tentando get() em a/blog...');
        const blogTestRef = ref(database, 'a/blog');
        const blogSnapshot = await get(blogTestRef);
        console.log('🔥 🧪 Blog get() exists?', blogSnapshot.exists());
        console.log('🔥 🧪 Blog get() val:', blogSnapshot.val());
        
      } catch (error) {
        console.error('🔥 🧪 ERRO no teste:', error);
      }
    };
    
    testConnection();
    
    // Listen for about section changes - CAMINHO CORRIGIDO
    const aboutRef = ref(database, 'a/profile/about');
    console.log('🔥 About ref criado:', aboutRef.toString());
    
    const aboutUnsubscribe = onValue(aboutRef, (snapshot) => {
      console.log('🔥 About snapshot recebido!');
      console.log('🔥 About snapshot existe?', snapshot.exists());
      console.log('🔥 About snapshot val:', snapshot.val());
      
      const data = snapshot.val();
      if (data !== null && data !== undefined) {
        console.log('🔥 Atualizando about com:', data);
        setAbout(data);
      } else {
        console.log('🔥 About data é null/undefined - mantendo valor padrão');
      }
    }, (error) => {
      console.error('🔥 Erro no listener about:', error);
    });

    // Listen for blog posts changes - CAMINHO CORRIGIDO
    const postsRef = ref(database, 'a/blog');
    console.log('🔥 Posts ref criado:', postsRef.toString());
    
    const postsUnsubscribe = onValue(postsRef, (snapshot) => {
      console.log('🔥 Blog snapshot recebido!');
      console.log('🔥 Blog snapshot existe?', snapshot.exists());
      console.log('🔥 Blog snapshot val:', snapshot.val());
      
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        // Converter a estrutura do Firebase para array de posts
        const postsArray = Object.keys(data).map(key => ({
          id: key,
          title: data[key].title || 'Título não encontrado',
          date: data[key].date || 'Data não encontrada',
          excerpt: data[key].excerpt || 'Resumo não encontrado',
          content: data[key].content || 'Conteúdo não encontrado',
          author: data[key].author || 'aleeessia'
        }));
        console.log('🔥 Posts processados:', postsArray);
        setPosts(postsArray);
      } else {
        console.log('🔥 Blog data é null/undefined - mantendo posts padrão');
      }
      setLoading(false);
    }, (error) => {
      console.error('🔥 Erro no listener blog:', error);
      setLoading(false);
    });

    return () => {
      console.log('🔥 Limpando listeners...');
      aboutUnsubscribe();
      postsUnsubscribe();
    };
  }, []);

  return { about, posts, loading };
};
