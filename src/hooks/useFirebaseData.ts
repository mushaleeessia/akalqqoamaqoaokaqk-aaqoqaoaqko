
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

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
    const userRef = ref(db, 'user');
    const userUnsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val() as UserData;
        setAbout(userData.about || 'Olá! Sou a aleeessia, moderadora do servidor Mush. Bem-vindos ao meu cantinho!');
      }
      setLoading(false);
    });

    // Listen to blog posts changes
    const blogRef = ref(db, 'blog');
    const blogUnsubscribe = onValue(blogRef, (snapshot) => {
      if (snapshot.exists()) {
        const blogData = snapshot.val();
        const processedPosts = Object.entries(blogData).map(([id, post]: [string, any]) => ({
          id,
          title: post.title || post['title:'] || 'Título não encontrado',
          date: typeof post.date === 'string' ? post.date.replace(/"/g, '') : post.date,
          excerpt: typeof post.excerpt === 'string' ? post.excerpt.replace(/"/g, '') : post.excerpt,
          content: post.content,
          author: post.author
        }));
        
        setPosts(processedPosts);
      }
    });

    return () => {
      userUnsubscribe();
      blogUnsubscribe();
    };
  }, []);

  return { about, posts, loading };
};
