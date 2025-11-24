
import React from 'react';
import { Trophy, Target, Zap } from 'lucide-react';

const EarnScreen: React.FC = () => {
  return (
    <div className="h-full flex flex-col px-6 pt-2 animate-fade-in pb-24 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Earn Rewards</h1>
        <p className="text-gray-400 text-sm">Complete tasks to earn points and badges.</p>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-white to-gray-300 rounded-3xl p-6 mb-8 text-black shadow-lg shadow-white/5">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Total Balance</p>
            <h2 className="text-4xl font-bold mt-1">0 PTS</h2>
          </div>
          <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
        </div>
        <div className="flex gap-2">
           <button className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-medium">Redeem</button>
           <button className="flex-1 bg-white/50 backdrop-blur-sm text-black border border-black/10 py-2.5 rounded-xl text-sm font-medium">History</button>
        </div>
      </div>

      {/* Daily Tasks */}
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Target size={18} /> Daily Tasks
      </h3>
      
      <div className="space-y-3">
        {[
          { title: 'Complete Daily Check-in', reward: '10 PTS', done: false },
          { title: 'Create a Workout Plan', reward: '50 PTS', done: false },
          { title: 'Share progress', reward: '20 PTS', done: false }
        ].map((task, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border ${task.done ? 'bg-white border-white' : 'border-gray-600'}`} />
              <span className="text-gray-200 text-sm">{task.title}</span>
            </div>
            <span className="text-xs font-bold bg-dark-700 px-2 py-1 rounded text-white">{task.reward}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarnScreen;
