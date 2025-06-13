
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
  about_en?: string;
}

export const useFirebaseData = (isEnglish = false) => {
  const [about, setAbout] = useState<string>(isEnglish ? 'Loading information...' : 'Carregando informações...');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to user data changes - corrigindo o caminho para a/profile
    const userRef = ref(database, 'a/profile');
    const userUnsubscribe = onValue(userRef, (snapshot) => {
      console.log('📝 Dados do perfil:', snapshot.val());
      if (snapshot.exists()) {
        const userData = snapshot.val() as UserData;
        const defaultAbout = isEnglish 
          ? 'Hello! I\'m aleeessia, moderator of the Mush server. Welcome to my corner!'
          : 'Olá! Sou a aleeessia, moderadora do servidor Mush. Bem-vindos ao meu cantinho!';
        
        // Use texto específico do idioma se disponível, senão use o texto padrão
        if (isEnglish && userData.about_en) {
          setAbout(userData.about_en);
        } else if (!isEnglish && userData.about) {
          setAbout(userData.about);
        } else {
          setAbout(defaultAbout);
        }
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
          let title = isEnglish ? 'Title not available' : 'Título não disponível';
          if (postData && typeof postData === 'object') {
            if (isEnglish && postData.title_en) {
              title = postData.title_en;
            } else if (postData.title) {
              title = postData.title;
            } else if (postData['title:']) {
              title = postData['title:'];
            }
          }
          
          // Processar conteúdo traduzido
          let content = isEnglish ? 'Content not available' : 'Conteúdo não disponível';
          let excerpt = isEnglish ? 'Summary not available' : 'Resumo não disponível';
          let author = isEnglish ? 'Author not informed' : 'Autor não informado';
          let date = isEnglish ? 'Date not available' : 'Data não disponível';
          
          if (postData) {
            // Conteúdo
            if (isEnglish && postData.content_en) {
              content = postData.content_en;
            } else if (postData.content) {
              content = postData.content;
            }
            
            // Resumo
            if (isEnglish && postData.excerpt_en) {
              excerpt = postData.excerpt_en;
            } else if (postData.excerpt) {
              excerpt = String(postData.excerpt).replace(/"/g, '');
            }
            
            // Autor
            if (isEnglish && postData.author_en) {
              author = postData.author_en;
            } else if (postData.author) {
              author = postData.author;
            }
            
            // Data
            if (postData.date) {
              date = String(postData.date).replace(/"/g, '');
            }
          }
          
          return {
            id,
            title: String(title).replace(/"/g, ''),
            date,
            excerpt,
            content,
            author
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
  }, [isEnglish]);

  return { about, posts, loading };
};
