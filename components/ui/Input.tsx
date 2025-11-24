import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label?: string;
}

const Input: React.FC<InputProps> = ({ icon: Icon, type = 'text', className = '', placeholder, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`w-full group ${className}`}>
      {props.label && <label className="block text-sm text-gray-400 mb-1.5">{props.label}</label>}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-500 group-focus-within:text-white transition-colors duration-300">
          <Icon size={20} />
        </div>
        
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className="w-full bg-dark-800 text-white placeholder-gray-600 pl-12 pr-10 py-3.5 rounded-xl border border-dark-700 focus:border-white focus:bg-dark-800 outline-none transition-all duration-300 text-sm"
          placeholder={placeholder}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;