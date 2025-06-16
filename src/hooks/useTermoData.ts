
import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/lib/firebase';

interface TermoData {
  [date: string]: string; // YYYY-MM-DD: palavra
}

export const useTermoData = () => {
  const [todayWord, setTodayWord] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  };

  useEffect(() => {
    const termoRef = ref(database, 'termo/words');
    
    const unsubscribe = onValue(termoRef, (snapshot) => {
      console.log('Termo data snapshot received');
      
      if (snapshot.exists()) {
        const data = snapshot.val() as TermoData;
        const today = getTodayDate();
        console.log('Today date:', today);
        console.log('Available words:', data);
        
        if (data[today]) {
          setTodayWord(data[today].toLowerCase());
          console.log('Today word:', data[today]);
        } else {
          // Se não há palavra para hoje, usar uma palavra padrão
          setTodayWord('termo');
          console.log('No word for today, using default: termo');
        }
      } else {
        // Se não há dados, criar estrutura inicial
        const today = getTodayDate();
        const initialData = {
          [today]: 'TERMO'
        };
        
        set(termoRef, initialData);
        setTodayWord('termo');
        console.log('Created initial termo data');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addWordForDate = async (date: string, word: string) => {
    const termoRef = ref(database, `termo/words/${date}`);
    try {
      await set(termoRef, word.toUpperCase());
      console.log('Word added for date:', date, word);
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  return { 
    todayWord, 
    loading, 
    addWordForDate 
  };
};
