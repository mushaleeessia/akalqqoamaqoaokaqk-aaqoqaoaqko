
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

    // Verificar a estrutura raiz do Firebase
    const rootRef = ref(database, '/');
    const rootUnsubscribe = onValue(rootRef, (snapshot) => {
      if (snapshot.exists()) {
        const rootData = snapshot.val();
        console.log('📝 ESTRUTURA RAIZ DO FIREBASE:', Object.keys(rootData));
        console.log('📝 DADOS COMPLETOS DA RAIZ:', JSON.stringify(rootData, null, 2));
      }
    });

    // Listen to blog posts changes - tentando diferentes caminhos
    const blogRef = ref(database, 'blog');
    const blogUnsubscribe = onValue(blogRef, (snapshot) => {
      console.log('📝 Verificando caminho "blog"...');
      if (snapshot.exists()) {
        const blogData = snapshot.val();
        console.log('📝 Dados encontrados em "blog":', JSON.stringify(blogData, null, 2));
        processAndSetPosts(blogData);
      } else {
        console.log('📝 Nenhum dado em "blog", tentando "posts"...');
        
        // Tentar caminho alternativo "posts"
        const postsRef = ref(database, 'posts');
        const postsUnsubscribe = onValue(postsRef, (snapshot) => {
          if (snapshot.exists()) {
            const postsData = snapshot.val();
            console.log('📝 Dados encontrados em "posts":', JSON.stringify(postsData, null, 2));
            processAndSetPosts(postsData);
          } else {
            console.log('📝 Nenhum dado em "posts" também');
            setPosts([]);
          }
        });
      }
    });

    const processAndSetPosts = (data: any) => {
      if (!data) {
        setPosts([]);
        return;
      }

      const processedPosts = Object.entries(data).map(([id, postData]: [string, any]) => {
        console.log(`📝 Processando post ${id}:`, postData);
        
        // Extrair título
        let title = 'Título não disponível';
        if (postData && typeof postData === 'object') {
          if (postData.title) {
            title = postData.title;
          } else if (postData['title:']) {
            title = postData['title:'];
          } else {
            const keys = Object.keys(postData);
            console.log(`📝 Chaves disponíveis para ${id}:`, keys);
            const titleKey = keys.find(key => 
              key.toLowerCase().includes('title') || 
              key.toLowerCase().includes('titulo')
            );
            if (titleKey) {
              title = postData[titleKey];
            }
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
      
      console.log('📝 Posts finais processados:', processedPosts);
      setPosts(processedPosts);
    };

    return () => {
      userUnsubscribe();
      blogUnsubscribe();
      rootUnsubscribe();
    };
  }, []);

  return { about, posts, loading };
};
