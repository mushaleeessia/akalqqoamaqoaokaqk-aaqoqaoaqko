
interface ForeignerNoticeProps {
  isVisible: boolean;
}

export const ForeignerNotice = ({ isVisible }: ForeignerNoticeProps) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-sm p-3 bg-gradient-to-br from-amber-100 via-orange-100 to-red-800 rounded-lg border-2 border-red-500 shadow-lg">
      <div className="text-red-900 text-xs leading-relaxed">
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
