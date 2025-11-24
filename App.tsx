import React, { useState, useEffect } from 'react';
import { Screen, UserData, Plan } from './types';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import VerifyScreen from './components/screens/VerifyScreen';
import SuccessScreen from './components/screens/SuccessScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import PlansScreen from './components/screens/PlansScreen';
import CreatePlanScreen from './components/screens/CreatePlanScreen';
import SocialScreen from './components/screens/SocialScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import BottomNav from './components/ui/BottomNav';
import { Target, Loader2 } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data() as UserData);
            if (currentScreen === Screen.LOGIN || currentScreen === Screen.SIGNUP) {
                setCurrentScreen(Screen.DASHBOARD);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
        if (![Screen.LOGIN, Screen.SIGNUP, Screen.VERIFY, Screen.SUCCESS].includes(currentScreen)) {
            setCurrentScreen(Screen.LOGIN);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentScreen]);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!auth.currentUser || !userData) return;
    
    // Update local state immediately for UI responsiveness
    setUserData(prev => prev ? ({ ...prev, ...data }) : null);

    // Update Firestore
    try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user data in DB:", error);
    }
  };

  const isAuthScreen = [Screen.LOGIN, Screen.SIGNUP, Screen.VERIFY, Screen.SUCCESS].includes(currentScreen);
  const showBottomNav = !isAuthScreen && userData;

  if (loading) {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center sm:p-4 p-0 font-sans overflow-hidden">
      {/* Background Ambience - Gooey Effect */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-blob mix-blend-screen" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-600/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      {/* Mobile Container Frame */}
      <div className="w-full h-full sm:h-[850px] sm:max-w-[400px] bg-dark-900/80 backdrop-blur-3xl sm:border sm:border-white/10 sm:rounded-[3rem] sm:shadow-2xl overflow-hidden relative flex flex-col z-10">
        
        {/* Top Status Bar Decoration (Visual Only) */}
        <div className="hidden sm:flex justify-between items-center px-8 py-4 opacity-50 text-xs font-medium text-white shrink-0 z-20">
          <span>10:00</span>
          <div className="flex gap-1">
             <div className="w-4 h-4 rounded-sm border border-white/30" />
             <div className="w-4 h-4 rounded-sm border border-white/30" />
          </div>
        </div>

        {/* Branding Header - Show only on Auth screens */}
        {isAuthScreen && (
          <div className="px-6 pt-6 pb-2 z-10 animate-fade-in flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">aim</span>
          </div>
        )}
        
        {/* Screen Content Area - Flex 1 to take available space */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          {currentScreen === Screen.LOGIN && (
            <LoginScreen 
              onNavigate={handleNavigate} 
            />
          )}
          {currentScreen === Screen.SIGNUP && (
            <SignupScreen 
              onNavigate={handleNavigate}
            />
          )}
          {currentScreen === Screen.VERIFY && (
            <VerifyScreen 
              email={userData?.email || ''}
              onNavigate={handleNavigate}
            />
          )}
          {currentScreen === Screen.SUCCESS && (
            <SuccessScreen 
              onNavigate={(screen) => {
                  if (screen === Screen.LOGIN) {
                      handleNavigate(Screen.DASHBOARD);
                  } else {
                      handleNavigate(screen);
                  }
              }} 
            />
          )}

          {/* Main App Screens */}
          {userData && currentScreen === Screen.DASHBOARD && (
            <DashboardScreen 
              userData={userData} 
              onUpdateUser={updateUserData} 
            />
          )}
          {userData && currentScreen === Screen.PLANS && (
            <PlansScreen userId={userData.uid!} />
          )}
          {userData && currentScreen === Screen.CREATE_PLAN && (
            <CreatePlanScreen 
              onNavigate={handleNavigate} 
              userId={userData.uid!}
            />
          )}
          {userData && currentScreen === Screen.SOCIAL && (
            <SocialScreen userData={userData} />
          )}
          {userData && currentScreen === Screen.PROFILE && (
            <ProfileScreen 
              userData={userData} 
              onNavigate={handleNavigate} 
              onUpdateUser={updateUserData}
            />
          )}
        </div>

        {/* Bottom Navigation - Absolute positioned at bottom, z-index high enough to sit above content */}
        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
};

export default App;