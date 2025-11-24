import React, { useState } from 'react';
import { Check, Sparkles, Activity } from 'lucide-react';
import Button from '../ui/Button';
import { Screen } from '../../types';

interface SuccessScreenProps {
  onNavigate: (screen: Screen) => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col px-6 justify-center items-center animate-slide-up text-center">
      
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/10">
           <Activity className="w-10 h-10 text-black stroke-[3]" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-white fill-white/20 animate-bounce" />
      </div>

      <h1 className="text-3xl font-bold mb-3 text-white">You're in!</h1>
      <p className="text-gray-400 mb-12 max-w-[250px]">
        Your account is verified. Start moving, chatting, and earning rewards.
      </p>

      <Button onClick={() => onNavigate(Screen.LOGIN)}>
        Start your journey
      </Button>
    </div>
  );
};

export default SuccessScreen;