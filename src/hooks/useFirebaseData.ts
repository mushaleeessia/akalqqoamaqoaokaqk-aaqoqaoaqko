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
    console.log('useFirebaseData effect triggered, isEnglish:', isEnglish);
    
    // Listen to user data changes
    const userRef = ref(database, 'a/profile');
    const userUnsubscribe = onValue(userRef, async (snapshot) => {
      console.log('User data snapshot received');
      if (snapshot.exists()) {
        const userData = snapshot.val() as UserData;
        console.log('User data:', userData);
        
        const defaultAbout = isEnglish 
          ? 'Hello! I\'m aleeessia, moderator of the Mush server. Welcome to my corner!'
          : 'Olá! Sou a aleeessia, moderadora do servidor Mush. Bem-vindos ao meu cantinho!';
        
        // Use texto específico do idioma se disponível
        if (isEnglish && userData.about_en) {
          console.log('Using about_en');
          setAbout(userData.about_en);
        } else if (!isEnglish && userData.about) {
          console.log('Using Portuguese about');
          setAbout(userData.about);
        } else if (isEnglish && userData.about) {
          // Traduzir automaticamente se não tiver versão em inglês
          console.log('Translating about to English');
          setTranslating(true);
          try {
            const translatedAbout = await translateText(userData.about, 'en');
            console.log('Translation result:', translatedAbout);
            setAbout(translatedAbout);
          } catch (error) {
            console.error('Translation error:', error);
            setAbout(userData.about);
          }
          setTranslating(false);
        } else {
          console.log('Using default about');
          setAbout(defaultAbout);
        }
      } else {
        console.log('No user data found');
      }
      setLoading(false);
    });

    // Listen to blog posts changes
    const blogRef = ref(database, 'a/blog');
    const blogUnsubscribe = onValue(blogRef, async (snapshot) => {
      console.log('Blog data snapshot received');
      if (snapshot.exists()) {
        const blogData = snapshot.val();
        console.log('Blog data:', blogData);
        
        const processedPosts = await Promise.all(
          Object.entries(blogData).map(async ([id, postData]: [string, any]) => {
            console.log('Processing post:', id, postData);
            
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
                  const originalTitle = postData.title || postData['title:'];
                  console.log('Translating title:', originalTitle);
                  title = await translateText(originalTitle, 'en');
                }
                
                if (postData.content_en) {
                  content = postData.content_en;
                } else if (postData.content) {
                  console.log('Translating content:', postData.content);
                  content = await translateText(postData.content, 'en');
                }
                
                if (postData.excerpt_en) {
                  excerpt = postData.excerpt_en;
                } else if (postData.excerpt) {
                  console.log('Translating excerpt:', postData.excerpt);
                  excerpt = await translateText(String(postData.excerpt).replace(/"/g, ''), 'en');
                }
                
                if (postData.author_en) {
                  author = postData.author_en;
                } else if (postData.author && postData.author !== 'aleeessia') {
                  console.log('Translating author:', postData.author);
                  author = await translateText(postData.author, 'en');
                }
              } catch (error) {
                console.error('Translation error for post:', id, error);
                // Translation failed, keep original values
              }
            }
            
            const processedPost = {
              id,
              title: String(title).replace(/"/g, ''),
              date,
              excerpt,
              content,
              author
            };
            
            console.log('Processed post:', processedPost);
            return processedPost;
          })
        );
        
        // Inverter a ordem dos posts (mais recentes primeiro)
        const reversedPosts = processedPosts.reverse();
        console.log('Final posts:', reversedPosts);
        
        setPosts(reversedPosts);
      } else {
        console.log('No blog data found');
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
