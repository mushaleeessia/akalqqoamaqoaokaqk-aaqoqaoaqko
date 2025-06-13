
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { translateText } from '@/services/translationService';

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
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    // Listen to user data changes
    const userRef = ref(database, 'a/profile');
    const userUnsubscribe = onValue(userRef, async (snapshot) => {
      console.log('📝 Dados do perfil:', snapshot.val());
      if (snapshot.exists()) {
        const userData = snapshot.val() as UserData;
        const defaultAbout = isEnglish 
          ? 'Hello! I\'m aleeessia, moderator of the Mush server. Welcome to my corner!'
          : 'Olá! Sou a aleeessia, moderadora do servidor Mush. Bem-vindos ao meu cantinho!';
        
        // Use texto específico do idioma se disponível
        if (isEnglish && userData.about_en) {
          setAbout(userData.about_en);
        } else if (!isEnglish && userData.about) {
          setAbout(userData.about);
        } else if (isEnglish && userData.about) {
          // Traduzir automaticamente se não tiver versão em inglês
          setTranslating(true);
          try {
            const translatedAbout = await translateText(userData.about, 'en');
            setAbout(translatedAbout);
          } catch (error) {
            console.warn('Translation failed for about:', error);
            setAbout(userData.about);
          }
          setTranslating(false);
        } else {
          setAbout(defaultAbout);
        }
      }
      setLoading(false);
    });

    // Listen to blog posts changes
    const blogRef = ref(database, 'a/blog');
    const blogUnsubscribe = onValue(blogRef, async (snapshot) => {
      console.log('📝 Verificando caminho "a/blog"...');
      if (snapshot.exists()) {
        const blogData = snapshot.val();
        console.log('📝 Dados encontrados em "a/blog":', JSON.stringify(blogData, null, 2));
        
        const processedPosts = await Promise.all(
          Object.entries(blogData).map(async ([id, postData]: [string, any]) => {
            console.log(`📝 Processando post ${id}:`, postData);
            
            // Extrair dados originais
            let title = 'Título não disponível';
            let content = 'Conteúdo não disponível';
            let excerpt = 'Resumo não disponível';
            let author = 'Autor não informado';
            let date = 'Data não disponível';
            
            if (postData && typeof postData === 'object') {
              title = postData.title || postData['title:'] || title;
              content = postData.content || content;
              excerpt = String(postData.excerpt || excerpt).replace(/"/g, '');
              author = postData.author || author;
              date = String(postData.date || date).replace(/"/g, '');
            }
            
            // Se for inglês e não tiver versões específicas, traduzir
            if (isEnglish) {
              try {
                if (postData.title_en) {
                  title = postData.title_en;
                } else if (postData.title || postData['title:']) {
                  title = await translateText(postData.title || postData['title:'], 'en');
                }
                
                if (postData.content_en) {
                  content = postData.content_en;
                } else if (postData.content) {
                  content = await translateText(postData.content, 'en');
                }
                
                if (postData.excerpt_en) {
                  excerpt = postData.excerpt_en;
                } else if (postData.excerpt) {
                  excerpt = await translateText(String(postData.excerpt).replace(/"/g, ''), 'en');
                }
                
                if (postData.author_en) {
                  author = postData.author_en;
                } else if (postData.author) {
                  author = await translateText(postData.author, 'en');
                }
              } catch (error) {
                console.warn('Translation failed for post:', id, error);
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
          })
        );
        
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

  return { about, posts, loading: loading || translating };
};
