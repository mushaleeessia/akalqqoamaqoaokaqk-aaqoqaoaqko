
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { translateTextCached } from '@/services/translationService';

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
        
        let aboutText = defaultAbout;
        
        // Se tem texto específico do idioma, usa ele
        if (isEnglish && userData.about_en) {
          aboutText = userData.about_en;
        } else if (!isEnglish && userData.about) {
          aboutText = userData.about;
        } else if (userData.about) {
          // Se não tem no idioma desejado, traduz automaticamente
          if (isEnglish) {
            setTranslating(true);
            try {
              aboutText = await translateTextCached(userData.about, 'en');
            } catch (error) {
              console.error('Translation failed for about:', error);
              aboutText = userData.about; // Fallback
            } finally {
              setTranslating(false);
            }
          } else {
            aboutText = userData.about;
          }
        }
        
        setAbout(aboutText);
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
        
        setTranslating(true);
        
        const processedPosts = await Promise.all(
          Object.entries(blogData).map(async ([id, postData]: [string, any]) => {
            console.log(`📝 Processando post ${id}:`, postData);
            
            // Extrair dados base
            let title = postData?.title || postData?.['title:'] || (isEnglish ? 'Title not available' : 'Título não disponível');
            let content = postData?.content || (isEnglish ? 'Content not available' : 'Conteúdo não disponível');
            let excerpt = postData?.excerpt || (isEnglish ? 'Summary not available' : 'Resumo não disponível');
            let author = postData?.author || (isEnglish ? 'Author not informed' : 'Autor não informado');
            let date = postData?.date || (isEnglish ? 'Date not available' : 'Data não disponível');
            
            // Traduzir para inglês se necessário
            if (isEnglish && postData) {
              try {
                // Usar versões específicas em inglês se existirem, senão traduzir
                if (!postData.title_en && postData.title) {
                  title = await translateTextCached(String(postData.title).replace(/"/g, ''), 'en');
                } else if (postData.title_en) {
                  title = postData.title_en;
                }
                
                if (!postData.content_en && postData.content) {
                  content = await translateTextCached(String(postData.content), 'en');
                } else if (postData.content_en) {
                  content = postData.content_en;
                }
                
                if (!postData.excerpt_en && postData.excerpt) {
                  excerpt = await translateTextCached(String(postData.excerpt).replace(/"/g, ''), 'en');
                } else if (postData.excerpt_en) {
                  excerpt = postData.excerpt_en;
                }
                
                if (!postData.author_en && postData.author) {
                  author = await translateTextCached(String(postData.author), 'en');
                } else if (postData.author_en) {
                  author = postData.author_en;
                }
              } catch (error) {
                console.error(`Erro na tradução do post ${id}:`, error);
              }
            } else {
              // Para português, limpar aspas extras
              title = String(title).replace(/"/g, '');
              excerpt = String(excerpt).replace(/"/g, '');
              date = String(date).replace(/"/g, '');
            }
            
            return {
              id,
              title,
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
        setTranslating(false);
      } else {
        console.log('📝 Nenhum dado encontrado em "a/blog"');
        setPosts([]);
        setTranslating(false);
      }
    });

    return () => {
      userUnsubscribe();
      blogUnsubscribe();
    };
  }, [isEnglish]);

  return { about, posts, loading: loading || translating };
};
