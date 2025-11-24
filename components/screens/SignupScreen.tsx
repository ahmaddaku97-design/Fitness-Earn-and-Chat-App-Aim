import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle2, AlertCircle, Gift } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Screen } from '../../types';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface SignupScreenProps {
  onNavigate: (screen: Screen) => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isPasswordValid = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate random referral code for the new user
      const myReferralCode = 'AIM-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Create User Document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        coins: 0, // Initial coins set to 0
        streak: 0,
        referralCode: myReferralCode,
        referredBy: referralInput || null,
        activityStatus: true,
        avatar: '',
        friends: [],
        createdAt: new Date().toISOString()
      });

      onNavigate(Screen.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col px-6 animate-slide-up bg-transparent relative z-10">
      <div className="mb-6 mt-4">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2 text-white tracking-tight drop-shadow-md">
          Get Started
        </h1>
        <p className="text-gray-200 text-sm drop-shadow-sm">Create your account to start earning.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-xl flex-1 flex flex-col mb-6">
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div className="space-y-4">
            <Input
                icon={User}
                placeholder="Full Name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/20"
            />

            <Input
                icon={Mail}
                placeholder="Email Address"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20"
            />
            
            <div className="space-y-2">
                <Input
                icon={Lock}
                placeholder="Create Password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20"
                />
                <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${isPasswordValid ? 'text-green-300' : 'text-gray-400'}`}>
                <CheckCircle2 size={14} className={isPasswordValid ? 'opacity-100' : 'opacity-0'} />
                Must be at least 8 characters
                </div>
            </div>

            <Input
                icon={Gift}
                placeholder="Referral Code (Optional)"
                label="Referral Code"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                className="bg-black/20"
            />

            {error && (
                <div className="flex items-center gap-2 text-red-100 text-sm bg-red-500/40 p-3 rounded-xl border border-red-500/20 backdrop-blur-md">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
            </div>

            <div className="pt-2">
            <Button type="submit" isLoading={isLoading} disabled={!isPasswordValid}>
                Create Account
            </Button>
            </div>
        </form>

        <div className="py-4 text-center border-t border-white/10 mt-2">
            <p className="text-gray-300 text-sm">
            Already have an account?{' '}
            <button 
                onClick={() => onNavigate(Screen.LOGIN)}
                className="text-white font-bold hover:underline transition-all"
            >
                Log in
            </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;