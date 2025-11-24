
import React from 'react';
import { Home, Compass, Plus, MessageSquare, User, Globe } from 'lucide-react';
import { Screen } from '../../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { screen: Screen.DASHBOARD, icon: Home, label: 'Dashboard' },
    { screen: Screen.PLANS, icon: Compass, label: 'Plans' },
    { screen: Screen.CREATE_PLAN, icon: Plus, label: 'Create', isAction: true },
    { screen: Screen.SOCIAL, icon: Globe, label: 'Social' },
    { screen: Screen.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-700 px-6 pb-2 pt-2 flex justify-between items-end z-50">
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        const Icon = item.icon;

        if (item.isAction) {
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className="relative -top-3"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform active:scale-95">
                <Plus className="w-7 h-7 text-black" strokeWidth={2.5} />
              </div>
            </button>
          );
        }

        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center gap-1.5 w-16 transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;