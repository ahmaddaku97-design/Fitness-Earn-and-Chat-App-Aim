import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { Screen } from '../../types';

interface VerifyScreenProps {
  onNavigate: (screen: Screen) => void;
  email: string;
}

const VerifyScreen: React.FC<VerifyScreenProps> = ({ onNavigate, email }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(digit => digit === '')) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNavigate(Screen.SUCCESS);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col px-6 animate-slide-up">
      {/* Back button */}
      <button 
        onClick={() => onNavigate(Screen.SIGNUP)} 
        className="mb-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-dark-800 transition-colors -ml-2"
      >
        <ArrowLeft className="text-gray-400 hover:text-white" />
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-white">
          Check your email
          <Sparkles className="w-5 h-5 text-white fill-white/20 animate-pulse" />
        </h1>
        <p className="text-gray-400 text-sm">
          We sent a verification link to <br/>
          <span className="text-white font-medium">{email || 'your email'}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-8 flex-1">
        <div className="flex justify-between gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full aspect-square bg-dark-800 text-white text-2xl font-bold text-center rounded-2xl border border-dark-700 focus:border-white focus:bg-dark-700 outline-none transition-all duration-300"
            />
          ))}
        </div>

        <div className="space-y-6">
          <Button type="submit" isLoading={isLoading} disabled={otp.some(d => d === '')}>
            Verify email
          </Button>

          <div className="text-center">
             <p className="text-gray-400 text-sm mb-4">
               Didn't receive the email?{' '}
               <button type="button" className="text-white font-medium hover:underline transition-colors">
                 Click to resend
               </button>
             </p>

             <button 
               type="button"
               onClick={() => onNavigate(Screen.LOGIN)}
               className="flex items-center justify-center w-full gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
             >
               <ArrowLeft size={16} />
               Back to log in
             </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VerifyScreen;