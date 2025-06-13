
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
    // Listen to user data changes - corrigindo o caminho para a/profile
    const userRef = ref(database, 'a/profile');
    const userUnsubscribe = onValue(userRef, (snapshot) => {
      console.log('📝 Dados do perfil:', snapshot.val());
      if (snapshot.exists()) {
        const userData = snapshot.val() as UserData;
        setAbout(userData.about || 'Olá! Sou a aleeessia, moderadora do servidor Mush. Bem-vindos ao meu cantinho!');
      }
      setLoading(false);
    });

    // Listen to blog posts changes - corrigindo o caminho para a/blog
    const blogRef = ref(database, 'a/blog');
    const blogUnsubscribe = onValue(blogRef, (snapshot) => {
      console.log('📝 Verificando caminho "a/blog"...');
      if (snapshot.exists()) {
        const blogData = snapshot.val();
        console.log('📝 Dados encontrados em "a/blog":', JSON.stringify(blogData, null, 2));
        
        const processedPosts = Object.entries(blogData).map(([id, postData]: [string, any]) => {
          console.log(`📝 Processando post ${id}:`, postData);
          
          // Extrair título - tratando o caso especial do "title:"
          let title = 'Título não disponível';
          if (postData && typeof postData === 'object') {
            if (postData.title) {
              title = postData.title;
            } else if (postData['title:']) {
              title = postData['title:'];
            }
          }
          
          return {
            id,
            title: String(title).replace(/"/g, ''),
            date: postData?.date ? String(postData.date).replace(/"/g, '') : 'Data não disponível',
            excerpt: postData?.excerpt ? String(postData.excerpt).replace(/"/g, '') : 'Resumo não disponível',
            content: postData?.content || 'Conteúdo não disponível',
            author: postData?.author || 'Autor não informado'
          };
        });
        
        // Inverter a ordem dos posts (mais recentes primeiro)
        const reversedPosts = processedPosts.reverse();
        
        console.log('📝 Posts finais processados (ordem invertida):', reversedPosts);
        setPosts(reversedPosts);
      } else {
        console.log('📝 Nenhum dado encontrado em "a/blog"');
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
