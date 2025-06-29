
-- Update the crossword game mode to have a different logic for completion tracking
-- We'll use a custom function to properly handle crossword completion
CREATE OR REPLACE FUNCTION public.is_crossword_complete(grid_data jsonb, target_words jsonb)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  word_record jsonb;
  word_text text;
  start_row int;
  start_col int;
  direction text;
  word_length int;
  current_row int;
  current_col int;
  cell_value text;
  user_word text := '';
BEGIN
  -- Iterar sobre todas as palavras no puzzle
  FOR word_record IN SELECT jsonb_array_elements(target_words)
  LOOP
    word_text := word_record->>'word';
    start_row := (word_record->>'startRow')::int;
    start_col := (word_record->>'startCol')::int;
    direction := word_record->>'direction';
    word_length := length(word_text);
    user_word := '';
    
    -- Construir a palavra inserida pelo usuário
    FOR i IN 0..word_length-1
    LOOP
      IF direction = 'across' THEN
        current_row := start_row;
        current_col := start_col + i;
      ELSE
        current_row := start_row + i;
        current_col := start_col;
      END IF;
      
      -- Obter o valor da célula do grid
      cell_value := grid_data->current_row->current_col->>'userInput';
      
      IF cell_value IS NULL OR cell_value = '' THEN
        RETURN false; -- Célula vazia encontrada
      END IF;
      
      user_word := user_word || cell_value;
    END LOOP;
    
    -- Verificar se a palavra está correta
    IF upper(user_word) != upper(word_text) THEN
      RETURN false;
    END IF;
  END LOOP;
  
  RETURN true; -- Todas as palavras estão corretas
END;
$$;
