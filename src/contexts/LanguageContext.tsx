import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('aleeessia-language');
    return (saved as Language) || 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aleeessia-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['pt'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Traduções completas
const translations = {
  pt: {
    // Header e Navegação
    'store': 'Loja',
    'forum': 'Fórum',
    'staff': 'Equipe',
    'leaderboard': 'Leaderboard',
    'punishments': 'Punições',
    'help': 'Ajuda',
    'support_area': 'Área de atendimento',
    'sales_support': 'Suporte de vendas',
    'connection_issues': 'Problemas de conexão',
    'portuguese': 'Português',
    'english': 'English',
    'italian': 'Italiano',
    'toggle_theme': 'Alternar tema',
    
    // Perfil e Biografia
    'secondary_moderator': 'Moderadora Secundária da rede de servidores Mush.',
    'staff_since': 'Staff desde',
    'partner_since': 'Partner desde',
    'welcome_corner': 'Bem-vindos ao meu cantinho!',
    'hello_iam': 'Olá! Sou a',
    'moderator_network': 'moderadora da rede de servidores',
    
    // Blog
    'first_post': 'Primeiro post',
    'first_post_content': 'Esse é o primeiro post no meu blog!',
    'blog_post_1': 'Agora que percebi, eu posso do nada soltar uma chave de um vip aqui e ela não seria resgatada por muuuito tempo, que doido né? Até parece que eu faria isso... até parece...',
    'blog_post_2': 'Olha que legal, É verdade né...',
    
    // Links e botões
    'my_tiktok': 'Meu TikTok',
    'mush_website': 'Site Mush',
    'mush_discord': 'Discord Mush',
    'official_server_website': 'Site oficial do servidor',
    'join_discord': 'Entre no nosso Discord',
    'check_truth': 'Confira aqui toda a verdade',
    'ban_question': 'A Alessia bane errado ou sem motivo?',
    'italian_clan_discord': 'Discord do clan [ITALIAN]',
    
    // Jogos
    'teeermo': 'TEEERMO',
    'crosswords': 'PALAVRAS CRUZADAS',
    'back': 'Voltar',
    'loading': 'Carregando...',
    'loading_game': 'Carregando jogo...',
    'words_not_found': 'Palavras do dia não encontradas!',
    'check_configuration': 'Verifique a configuração.',
    
    // Jogo Termo
    'solo_mode': 'Solo',
    'duo_mode': 'Duo',
    'trio_mode': 'Trio',
    'quartet_mode': 'Quarteto',
    'infinity_mode': 'Infinito',
    'guest_mode': 'Modo Visitante',
    'login_required': 'Login necessário',
    'login_required_desc': 'Faça login para jogar!',
    'login_with_discord': 'Entrar com Discord',
    'enter_guest_mode': 'Entrar como visitante',
    'guest_mode_active': 'Modo Visitante Ativo',
    'logout': 'Sair',
    'enter_your_name': 'Digite seu nome',
    'name_placeholder': 'Seu nome aqui...',
    'save_name': 'Salvar Nome',
    'game_over': 'Fim de Jogo',
    'congratulations': 'Parabéns!',
    'try_again': 'Tente Novamente',
    'play_again': 'Jogar Novamente',
    'share_result': 'Compartilhar Resultado',
    'next_game_in': 'Próximo jogo em',
    'winstreak': 'Sequência de vitórias',
    'games_played': 'Jogos jogados',
    'win_rate': 'Taxa de vitória',
    'average_attempts': 'Tentativas médias',
    'current_streak': 'Sequência atual',
    'max_streak': 'Melhor sequência',
    'attempts': 'Tentativas',
    'enter_guess': 'Digite sua palavra...',
    'invalid_word': 'Palavra inválida',
    'word_too_short': 'Palavra muito curta',
    'word_too_long': 'Palavra muito longa',
    'word_not_found': 'Palavra não encontrada',
    'correct_word_was': 'A palavra correta era',
    
    // Estatísticas e compartilhamento
    'statistics': 'Estatísticas',
    'wins': 'Vitórias',
    'losses': 'Derrotas',
    'total_games': 'Total de jogos',
    'share_text_win': 'Consegui resolver o TEEERMO de hoje em',
    'share_text_lose': 'Não consegui resolver o TEEERMO de hoje',
    'attempts_text': 'tentativas',
    'copy_result': 'Copiar resultado',
    'result_copied': 'Resultado copiado!',
    
    // Avisos e notificações
    'foreigner_notice': '⚠️ Você está visualizando este site em português. As traduções podem não estar 100% precisas.',
    'translation_warning': '⚠️ Você está visualizando este site traduzido. As traduções podem não estar 100% precisas.',
    
    // Ajuda e tutoriais
    'how_to_play': 'Como jogar',
    'game_rules': 'Regras do jogo',
    'keyboard_shortcuts': 'Atalhos do teclado',
    'tips_tricks': 'Dicas e truques',
    
    // Teclado virtual
    'virtual_keyboard': 'Teclado virtual',
    'enter': 'Enter',
    'delete': 'Apagar',
    
    // Estados do jogo
    'waiting_next_word': 'Aguardando próxima palavra...',
    'generating_word': 'Gerando palavra...',
    'word_generated': 'Palavra gerada!',
    'game_completed': 'Jogo concluído!',
    'excellent': 'Excelente!',
    'very_good': 'Muito bom!',
    'good': 'Bom!',
    'not_bad': 'Nada mal!',
    'could_be_better': 'Pode melhorar!'
  },
  
  en: {
    // Header e Navegação
    'store': 'Store',
    'forum': 'Forum',
    'staff': 'Staff',
    'leaderboard': 'Leaderboard',
    'punishments': 'Punishments',
    'help': 'Help',
    'support_area': 'Support Area',
    'sales_support': 'Sales Support',
    'connection_issues': 'Connection Issues',
    'portuguese': 'Português',
    'english': 'English',
    'italian': 'Italiano',
    'toggle_theme': 'Toggle theme',
    
    // Perfil e Biografia
    'secondary_moderator': 'Secondary Moderator of the Mush server network.',
    'staff_since': 'Staff since',
    'partner_since': 'Partner since',
    'welcome_corner': 'Welcome to my corner!',
    'hello_iam': 'Hello! I am',
    'moderator_network': 'moderator of the server network',
    
    // Blog
    'first_post': 'First post',
    'first_post_content': 'This is the first post on my blog!',
    'blog_post_1': 'Now that I realized, I can randomly drop a VIP key here and it wouldn\'t be claimed for a very long time, that\'s crazy right? As if I would do that... as if...',
    'blog_post_2': 'Look how cool, It\'s true right...',
    
    // Links e botões
    'my_tiktok': 'My TikTok',
    'mush_website': 'Mush Website',
    'mush_discord': 'Mush Discord',
    'official_server_website': 'Official server website',
    'join_discord': 'Join our Discord',
    'check_truth': 'Check out the whole truth here',
    'ban_question': 'Does Alessia ban wrongly or without reason?',
    'italian_clan_discord': 'Italian clan Discord',
    
    // Jogos
    'teeermo': 'TEEERMO',
    'crosswords': 'CROSSWORDS',
    'back': 'Back',
    'loading': 'Loading...',
    'loading_game': 'Loading game...',
    'words_not_found': 'Today\'s words not found!',
    'check_configuration': 'Check configuration.',
    
    // Jogo Termo
    'solo_mode': 'Solo',
    'duo_mode': 'Duo',
    'trio_mode': 'Trio',
    'quartet_mode': 'Quartet',
    'infinity_mode': 'Infinity',
    'guest_mode': 'Guest Mode',
    'login_required': 'Login Required',
    'login_required_desc': 'Please log in to play!',
    'login_with_discord': 'Login with Discord',
    'enter_guest_mode': 'Enter as Guest',
    'guest_mode_active': 'Guest Mode Active',
    'logout': 'Logout',
    'enter_your_name': 'Enter your name',
    'name_placeholder': 'Your name here...',
    'save_name': 'Save Name',
    'game_over': 'Game Over',
    'congratulations': 'Congratulations!',
    'try_again': 'Try Again',
    'play_again': 'Play Again',
    'share_result': 'Share Result',
    'next_game_in': 'Next game in',
    'winstreak': 'Win streak',
    'games_played': 'Games played',
    'win_rate': 'Win rate',
    'average_attempts': 'Average attempts',
    'current_streak': 'Current streak',
    'max_streak': 'Best streak',
    'attempts': 'Attempts',
    'enter_guess': 'Enter your word...',
    'invalid_word': 'Invalid word',
    'word_too_short': 'Word too short',
    'word_too_long': 'Word too long',
    'word_not_found': 'Word not found',
    'correct_word_was': 'The correct word was',
    
    // Estatísticas e compartilhamento
    'statistics': 'Statistics',
    'wins': 'Wins',
    'losses': 'Losses',
    'total_games': 'Total games',
    'share_text_win': 'I solved today\'s TEEERMO in',
    'share_text_lose': 'I couldn\'t solve today\'s TEEERMO',
    'attempts_text': 'attempts',
    'copy_result': 'Copy result',
    'result_copied': 'Result copied!',
    
    // Avisos e notificações
    'foreigner_notice': '⚠️ You are viewing this website in English. Translations may not be 100% accurate.',
    'translation_warning': '⚠️ You are viewing this website translated. Translations may not be 100% accurate.',
    
    // Ajuda e tutoriais
    'how_to_play': 'How to play',
    'game_rules': 'Game rules',
    'keyboard_shortcuts': 'Keyboard shortcuts',
    'tips_tricks': 'Tips and tricks',
    
    // Teclado virtual
    'virtual_keyboard': 'Virtual keyboard',
    'enter': 'Enter',
    'delete': 'Delete',
    
    // Estados do jogo
    'waiting_next_word': 'Waiting for next word...',
    'generating_word': 'Generating word...',
    'word_generated': 'Word generated!',
    'game_completed': 'Game completed!',
    'excellent': 'Excellent!',
    'very_good': 'Very good!',
    'good': 'Good!',
    'not_bad': 'Not bad!',
    'could_be_better': 'Could be better!'
  },
  
  it: {
    // Header e Navigazione
    'store': 'Negozio',
    'forum': 'Forum',
    'staff': 'Staff',
    'leaderboard': 'Classifica',
    'punishments': 'Punizioni',
    'help': 'Aiuto',
    'support_area': 'Area di supporto',
    'sales_support': 'Supporto vendite',
    'connection_issues': 'Problemi di connessione',
    'portuguese': 'Português',
    'english': 'English',
    'italian': 'Italiano',
    'toggle_theme': 'Cambia tema',
    
    // Profilo e Biografia
    'secondary_moderator': 'Moderatrice Secondaria della rete di server Mush.',
    'staff_since': 'Staff dal',
    'partner_since': 'Partner dal',
    'welcome_corner': 'Benvenuti nel mio angolo!',
    'hello_iam': 'Ciao! Sono',
    'moderator_network': 'moderatrice della rete di server',
    
    // Blog
    'first_post': 'Primo post',
    'first_post_content': 'Questo è il primo post del mio blog!',
    'blog_post_1': 'Ora che ci penso, posso rilasciare casualmente una chiave VIP qui e non verrebbe rivendicata per molto tempo, pazzesco vero? Come se lo facessi davvero... come se...',
    'blog_post_2': 'Guarda che bello, È vero eh...',
    
    // Link e pulsanti
    'my_tiktok': 'Il mio TikTok',
    'mush_website': 'Sito Mush',
    'mush_discord': 'Discord Mush',
    'official_server_website': 'Sito ufficiale del server',
    'join_discord': 'Unisciti al nostro Discord',
    'check_truth': 'Scopri tutta la verità qui',
    'ban_question': 'Alessia banna in modo sbagliato o senza motivo?',
    'italian_clan_discord': 'Discord del clan [ITALIAN]',
    
    // Giochi
    'teeermo': 'TEEERMO',
    'crosswords': 'PAROLE CROCIATE',
    'back': 'Indietro',
    'loading': 'Caricamento...',
    'loading_game': 'Caricamento gioco...',
    'words_not_found': 'Parole del giorno non trovate!',
    'check_configuration': 'Controlla la configurazione.',
    
    // Gioco Termo
    'solo_mode': 'Solo',
    'duo_mode': 'Duo',
    'trio_mode': 'Trio',
    'quartet_mode': 'Quartetto',
    'infinity_mode': 'Infinito',
    'guest_mode': 'Modalità Ospite',
    'login_required': 'Login Richiesto',
    'login_required_desc': 'Effettua il login per giocare!',
    'login_with_discord': 'Accedi con Discord',
    'enter_guest_mode': 'Entra come Ospite',
    'guest_mode_active': 'Modalità Ospite Attiva',
    'logout': 'Esci',
    'enter_your_name': 'Inserisci il tuo nome',
    'name_placeholder': 'Il tuo nome qui...',
    'save_name': 'Salva Nome',
    'game_over': 'Fine Gioco',
    'congratulations': 'Congratulazioni!',
    'try_again': 'Riprova',
    'play_again': 'Gioca Ancora',
    'share_result': 'Condividi Risultato',
    'next_game_in': 'Prossimo gioco tra',
    'winstreak': 'Serie di vittorie',
    'games_played': 'Partite giocate',
    'win_rate': 'Tasso di vittoria',
    'average_attempts': 'Tentativi medi',
    'current_streak': 'Serie attuale',
    'max_streak': 'Migliore serie',
    'attempts': 'Tentativi',
    'enter_guess': 'Inserisci la tua parola...',
    'invalid_word': 'Parola non valida',
    'word_too_short': 'Parola troppo corta',
    'word_too_long': 'Parola troppo lunga',
    'word_not_found': 'Parola non trovata',
    'correct_word_was': 'La parola corretta era',
    
    // Statistiche e condivisione
    'statistics': 'Statistiche',
    'wins': 'Vittorie',
    'losses': 'Sconfitte',
    'total_games': 'Totale partite',
    'share_text_win': 'Ho risolto il TEEERMO di oggi in',
    'share_text_lose': 'Non sono riuscito a risolvere il TEEERMO di oggi',
    'attempts_text': 'tentativi',
    'copy_result': 'Copia risultato',
    'result_copied': 'Risultato copiato!',
    
    // Avvisi e notifiche
    'foreigner_notice': '⚠️ Stai visualizzando questo sito web in italiano. Le traduzioni potrebbero non essere accurate al 100%.',
    'translation_warning': '⚠️ Stai visualizzando questo sito web tradotto. Le traduzioni potrebbero non essere accurate al 100%.',
    
    // Aiuto e tutorial
    'how_to_play': 'Come giocare',
    'game_rules': 'Regole del gioco',
    'keyboard_shortcuts': 'Scorciatoie da tastiera',
    'tips_tricks': 'Suggerimenti e trucchi',
    
    // Tastiera virtuale
    'virtual_keyboard': 'Tastiera virtuale',
    'enter': 'Invio',
    'delete': 'Cancella',
    
    // Stati del gioco
    'waiting_next_word': 'In attesa della prossima parola...',
    'generating_word': 'Generando parola...',
    'word_generated': 'Parola generata!',
    'game_completed': 'Gioco completato!',
    'excellent': 'Eccellente!',
    'very_good': 'Molto bene!',
    'good': 'Bene!',
    'not_bad': 'Non male!',
    'could_be_better': 'Può migliorare!'
  }
};