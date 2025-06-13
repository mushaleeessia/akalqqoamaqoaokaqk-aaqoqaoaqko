
interface FooterProps {
  isVisible: boolean;
}

export const Footer = ({ isVisible }: FooterProps) => {
  if (!isVisible) return null;

  return (
    <footer className="mt-12 mb-6 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-4 text-center">
          <p className="text-amber-200 text-sm">
            ⚠️ You are viewing this website in English. Translations may not be 100% accurate.
          </p>
        </div>
      </div>
    </footer>
  );
};
