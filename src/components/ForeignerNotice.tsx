
import { useEffect, useState } from 'react';

interface ForeignerNoticeProps {
  isVisible: boolean;
}

export const ForeignerNotice = ({ isVisible }: ForeignerNoticeProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure element is in DOM before animation
      timeoutId = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      setIsAnimating(false);
      // Wait for fade-out animation to complete before removing from DOM
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, 500);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`w-full max-w-sm p-3 bg-gradient-to-br from-amber-50/80 via-orange-100/70 to-red-200/60 backdrop-blur-sm rounded-lg border border-red-300/50 shadow-lg transition-all duration-500 ease-in-out ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="text-red-800 text-xs leading-relaxed">
        <p className="font-bold mb-2">Are you a foreigner and want to play in MushMC? Read below.</p>
        <p className="mb-2">
          <strong>For Premium Accounts:</strong> Send an e-mail to contas@mush.com.br with your IGN and explain that you cannot login due to country restrictions;
        </p>
        <p>
          <strong>For Cracked Accounts:</strong> Send an e-mail to contas@mush.com.br with the desired IGN and explain that you are unable to create accounts due to country restrictions.
        </p>
      </div>
    </div>
  );
};
