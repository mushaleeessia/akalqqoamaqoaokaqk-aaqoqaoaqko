
interface SecretWordsRevealProps {
  showSecretWords: boolean;
  allTargetWords: string[];
}

export const SecretWordsReveal = ({ showSecretWords, allTargetWords }: SecretWordsRevealProps) => {
  if (!showSecretWords) return null;

  return (
    <div className="bg-white/20 p-4 rounded-lg mb-4">
      <h3 className="text-white font-bold mb-2">Palavras do dia:</h3>
      <div className="text-white/90 space-y-1">
        {allTargetWords.map((word, index) => (
          <p key={index} className="font-mono text-lg">
            {word.toUpperCase()}
          </p>
        ))}
      </div>
    </div>
  );
};
