
export const ForeignerNotice = () => {
  return (
    <div className="bg-gradient-to-br from-yellow-600 via-orange-500 to-red-900 p-6 rounded-xl border-2 border-transparent bg-clip-padding relative overflow-hidden max-w-2xl mx-auto">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-400 to-orange-400 rounded-xl blur-sm -z-10"></div>
      <div className="absolute inset-[2px] bg-gradient-to-br from-yellow-600 via-orange-500 to-red-900 rounded-xl"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <p className="text-white font-bold text-lg mb-4">
          Are you a foreigner and want to play in MushMC? Read below.
        </p>
        <div className="space-y-3 text-white text-sm leading-relaxed">
          <p>
            <strong className="font-semibold">For Premium Accounts:</strong> Send an e-mail to{" "}
            <span className="font-mono bg-black/20 px-1 py-0.5 rounded">contas@mush.com.br</span>{" "}
            with your IGN and explain that you cannot login due to country restrictions;
          </p>
          <p>
            <strong className="font-semibold">For Cracked Accounts:</strong> Send an e-mail to{" "}
            <span className="font-mono bg-black/20 px-1 py-0.5 rounded">contas@mush.com.br</span>{" "}
            with the desired IGN and explain that you are unable to create accounts due to country restrictions.
          </p>
        </div>
      </div>
    </div>
  );
};
