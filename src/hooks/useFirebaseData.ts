
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

interface UserData {
  about: string;
}

export const useFirebaseData = () => {
  const [about, setAbout] = useState<string>('Carregando informações...');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to user data changes
    const userRef = ref(database, 'user');
    const userUnsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val() as UserData;
        setAbout(userData.about || 'Olá! Sou a aleeessia, moderadora do servidor Mush. Bem-vindos ao meu cantinho!');
      }
      setLoading(false);
    });

    // Listen to blog posts changes
    const blogRef = ref(database, 'blog');
    const blogUnsubscribe = onValue(blogRef, (snapshot) => {
      if (snapshot.exists()) {
        const blogData = snapshot.val();
        console.log('📝 Estrutura completa do Firebase:', JSON.stringify(blogData, null, 2));
        
        const processedPosts = Object.entries(blogData).map(([id, postData]: [string, any]) => {
          console.log(`📝 Post ID: ${id}`);
          console.log(`📝 Dados do post:`, postData);
          
          // Tenta diferentes formas de acessar o título
          let title = 'Título não disponível';
          if (postData && typeof postData === 'object') {
            // Verifica se há uma propriedade title diretamente
            if (postData.title) {
              title = postData.title;
            }
            // Verifica se há uma propriedade com sufixo
            else if (postData['title:']) {
              title = postData['title:'];
            }
            // Verifica outras variações possíveis
            else {
              const keys = Object.keys(postData);
              console.log(`📝 Chaves disponíveis para ${id}:`, keys);
              const titleKey = keys.find(key => key.toLowerCase().includes('title') || key.toLowerCase().includes('titulo'));
              if (titleKey) {
                title = postData[titleKey];
              }
            }
          }
          
          console.log(`📝 Título final extraído para ${id}:`, title);
          
          return {
            id,
            title: String(title).replace(/"/g, ''),
            date: postData?.date ? String(postData.date).replace(/"/g, '') : 'Data não disponível',
            excerpt: postData?.excerpt ? String(postData.excerpt).replace(/"/g, '') : 'Resumo não disponível',
            content: postData?.content || 'Conteúdo não disponível',
            author: postData?.author || 'Autor não informado'
          };
        });
        
        console.log('📝 Posts processados finais:', processedPosts);
        setPosts(processedPosts);
      } else {
        console.log('📝 Nenhum dado encontrado no Firebase blog');
        setPosts([]);
      }
    });

    return () => {
      userUnsubscribe();
      blogUnsubscribe();
    };
  }, []);

  return { about, posts, loading };
};
