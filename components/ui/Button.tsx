import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center relative overflow-hidden group";
  
  const variants = {
    primary: "bg-white text-black shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.98]",
    outline: "bg-transparent border border-dark-700 text-white hover:bg-dark-700/50 hover:border-white/50",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
      
      {/* Subtle shine effect for primary button */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10%, 0 100%)' }} />
      )}
    </button>
  );
};

export default Button;