import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  provider: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, provider, ...props }) => {
  return (
    <button
      className="w-full bg-transparent border border-dark-700 text-white py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-dark-700/50 transition-all duration-300 hover:border-gray-600 active:scale-[0.98] group"
      {...props}
    >
      <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>
      <span className="text-sm font-medium">Log in with {provider}</span>
    </button>
  );
};

export default SocialButton;