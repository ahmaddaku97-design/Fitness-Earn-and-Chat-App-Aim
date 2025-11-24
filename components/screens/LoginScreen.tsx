import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Screen } from '../../types';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Auth state listener in App.tsx will handle navigation
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to login');
        setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col px-6 animate-slide-up bg-transparent relative z-10">
      <div className="mb-8 mt-4 relative">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2 text-white tracking-tight drop-shadow-md">
          Welcome back
        </h1>
        <p className="text-gray-200 text-sm drop-shadow-sm">Enter your details to access your dashboard.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-xl flex-1 flex flex-col mb-6">
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div className="space-y-4">
            <Input
                icon={Mail}
                placeholder="Enter your email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20"
            />
            
            <Input
                icon={Lock}
                placeholder="••••••••"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20"
            />

            {error && (
                <div className="flex items-center gap-2 text-red-100 text-sm bg-red-500/40 p-3 rounded-xl border border-red-500/20 backdrop-blur-md">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded bg-white/10 border-white/20 checked:bg-white checked:border-white accent-white" />
                Remember me
                </label>
                <button type="button" className="text-gray-300 hover:text-white transition-colors">
                Forgot password
                </button>
            </div>
            </div>

            <div className="pt-4">
            <Button type="submit" isLoading={isLoading}>
                Log In
            </Button>
            </div>
        </form>

        <div className="py-6 text-center border-t border-white/10 mt-4">
            <p className="text-gray-300 text-sm">
            Don't have an account?{' '}
            <button 
                onClick={() => onNavigate(Screen.SIGNUP)}
                className="text-white font-bold hover:underline transition-all"
            >
                Sign up
            </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;