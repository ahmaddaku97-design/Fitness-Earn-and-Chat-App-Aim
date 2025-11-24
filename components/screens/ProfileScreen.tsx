import React, { useState, useRef } from 'react';
import { User, Settings, LogOut, HelpCircle, ChevronRight, Bell, Shield, Coins, Gift, ArrowLeft, Copy, Check, Edit2, Camera, Loader2 } from 'lucide-react';
import { UserData, Screen } from '../../types';
import Button from '../ui/Button';
import { auth, storage } from '../../firebase';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfileScreenProps {
  userData: UserData;
  onNavigate: (screen: Screen) => void;
  onUpdateUser: (data: Partial<UserData>) => void;
}

type SubScreen = 'MAIN' | 'REFERRAL' | 'PERSONAL_INFO' | 'PRIVACY';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userData, onNavigate, onUpdateUser }) => {
  const [currentSubScreen, setCurrentSubScreen] = useState<SubScreen>('MAIN');
  const [copied, setCopied] = useState(false);
  const [uidCopied, setUidCopied] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'easypaisa' | 'jazzcash'>('easypaisa');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userData.name || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const coins = userData.coins || 0;
  const withdrawThreshold = 100000;
  const exchangeRate = 2800 / 10000; 
  const currentPkrValue = Math.floor(coins * exchangeRate);
  const progress = Math.min((coins / withdrawThreshold) * 100, 100);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userData.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUid = () => {
    navigator.clipboard.writeText(userData.uid || '');
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 2000);
  };

  const handleNameSave = () => {
    if (newName.trim()) {
      onUpdateUser({ name: newName });
    }
    setIsEditingName(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Use currently authenticated user's ID primarily
    const uid = auth.currentUser?.uid;
    
    if (!uid) {
        alert("Authentication error: You seem to be logged out. Please log in again to upload.");
        return;
    }

    setIsUploading(true);
    try {
        console.log(`Starting upload for UID: ${uid}`);
        const storageRef = ref(storage, `avatars/${uid}`);
        
        // 1. Upload the file
        await uploadBytes(storageRef, file);
        console.log("Upload successful");
        
        // 2. Get the URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL obtained:", downloadURL);
        
        // 3. Update Firestore
        // Note: onUpdateUser handles the Firestore update. If Firestore rules block this, 
        // the image is uploaded but profile not updated.
        onUpdateUser({ avatar: downloadURL });
        
    } catch (e: any) {
        console.error("Upload failed", e);
        if (e.code === 'storage/unauthorized') {
            alert("Permission denied: Unable to upload image to storage.");
        } else if (e.code === 'permission-denied') {
            alert("Permission denied: Unable to update profile with new image.");
        } else {
            alert(`Failed to upload image: ${e.message}`);
        }
    } finally {
        setIsUploading(false);
        // Reset file input to allow re-uploading the same file if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const toggleActivityStatus = () => {
      onUpdateUser({ activityStatus: !userData.activityStatus });
  };

  const handleLogout = () => {
      signOut(auth).then(() => {
          onNavigate(Screen.LOGIN);
      });
  };

  const MenuItem = ({ icon: Icon, label, value, onClick, danger, highlight }: { icon: any, label: string, value?: string, onClick?: () => void, danger?: boolean, highlight?: boolean }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 transition-all active:bg-dark-700 first:rounded-t-2xl last:rounded-b-2xl border-b border-dark-800 last:border-0 relative overflow-hidden ${
        highlight 
        ? 'bg-gradient-to-r from-yellow-500/10 to-transparent hover:from-yellow-500/20' 
        : 'bg-dark-900/50 hover:bg-dark-800'
      }`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            danger ? 'bg-red-500/10 text-red-400' : 
            highlight ? 'bg-yellow-500 text-black' : 'bg-dark-800 text-gray-300'
        }`}>
           <Icon size={18} className={highlight ? 'fill-black/20 stroke-current' : ''} />
        </div>
        <div className="text-left">
            <span className={`text-sm font-medium block ${danger ? 'text-red-400' : highlight ? 'text-yellow-500' : 'text-white'}`}>{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-10">
        {value && <span className={`text-xs ${highlight ? 'text-yellow-500/70' : 'text-gray-500'}`}>{value}</span>}
        <ChevronRight size={16} className={highlight ? 'text-yellow-500/50' : 'text-dark-600'} />
      </div>
    </button>
  );

  // Render Content based on Subscreen
  if (currentSubScreen === 'REFERRAL') {
    return (
      <div className="h-full flex flex-col animate-slide-up bg-dark-900 z-50 overflow-y-auto">
        <div className="p-6 pb-2 sticky top-0 bg-dark-900 z-10">
          <button onClick={() => setCurrentSubScreen('MAIN')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
            <ArrowLeft size={20} /> <span className="text-sm font-medium">Back to Profile</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">Refer & Earn <Gift className="text-yellow-500 animate-bounce" /></h1>
          <p className="text-gray-400 text-sm">Invite friends and earn real money.</p>
        </div>

        <div className="px-6 pb-32 space-y-6">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-6 text-black shadow-lg shadow-orange-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Coins size={120} className="fill-black" /></div>
             <p className="font-bold opacity-70 mb-1 text-sm uppercase tracking-wide">Your Balance</p>
             <h2 className="text-5xl font-bold mb-4 flex items-baseline gap-2">{coins.toLocaleString()} <span className="text-lg opacity-60">Coins</span></h2>
             <div className="bg-black/10 rounded-xl p-3 flex justify-between items-center backdrop-blur-sm border border-black/5">
                <span className="font-medium">Est. Value</span>
                <span className="font-bold text-xl">{currentPkrValue.toLocaleString()} PKR</span>
             </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
             <h3 className="text-white font-bold mb-4 text-sm">Your Referral Code</h3>
             <div className="flex gap-2">
                <div className="flex-1 bg-dark-900 border border-dashed border-dark-600 rounded-xl flex items-center justify-center p-3">
                   <span className="text-xl font-mono font-bold text-white tracking-widest">{userData.referralCode}</span>
                </div>
                <button onClick={handleCopyCode} className="bg-white text-black px-4 rounded-xl flex items-center justify-center gap-2 font-medium active:scale-95 transition-transform">
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
             </div>
             <div className="mt-4 bg-dark-900/50 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
                <p>• <span className="text-white">New user gets:</span> 500 Coins</p>
                <p>• <span className="text-white">You get:</span> 1000 Coins</p>
             </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2"><Shield size={16} /> Withdrawal Request</h3>
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 space-y-5">
               <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Progress to Withdraw</span>
                    <span className={coins >= withdrawThreshold ? "text-green-500 font-bold" : "text-gray-400"}>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full transition-all duration-1000 ${coins >= withdrawThreshold ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 text-right">Min: 100,000 Coins</p>
               </div>

               <div>
                  <label className="text-xs text-gray-400 mb-3 block font-medium">Select Method</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setSelectedPayment('easypaisa')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedPayment === 'easypaisa' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-dark-900 border-dark-700 text-gray-500 hover:border-gray-500'}`}>
                       <span className="font-bold text-sm">Easypaisa</span>
                     </button>
                     <button onClick={() => setSelectedPayment('jazzcash')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedPayment === 'jazzcash' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-dark-900 border-dark-700 text-gray-500 hover:border-gray-500'}`}>
                       <span className="font-bold text-sm">JazzCash</span>
                     </button>
                  </div>
               </div>
               <Button disabled={coins < withdrawThreshold}>{coins < withdrawThreshold ? `Reach ${withdrawThreshold.toLocaleString()} to Withdraw` : 'Request Withdrawal'}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSubScreen === 'PERSONAL_INFO') {
    return (
      <div className="h-full flex flex-col animate-slide-up bg-dark-900 z-50">
        <div className="p-6 border-b border-dark-800">
          <button onClick={() => setCurrentSubScreen('MAIN')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft size={20} /> <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Personal Information</h1>
        </div>
        <div className="p-6 space-y-4">
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">User ID (UID)</label>
                <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-white font-mono text-sm sm:text-lg break-all">{userData.uid || 'Not assigned'}</span>
                    <button 
                      onClick={handleCopyUid} 
                      className="text-gray-500 hover:text-white bg-dark-700 p-2 rounded-lg transition-colors shrink-0"
                    >
                      {uidCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Email Address</label>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-white">{userData.email || 'No email'}</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (currentSubScreen === 'PRIVACY') {
    return (
      <div className="h-full flex flex-col animate-slide-up bg-dark-900 z-50">
        <div className="p-6 border-b border-dark-800">
          <button onClick={() => setCurrentSubScreen('MAIN')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft size={20} /> <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Privacy & Security</h1>
        </div>
        <div className="p-6">
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 flex items-center justify-between">
                <div>
                    <h3 className="text-white font-medium">Activity Status</h3>
                    <p className="text-xs text-gray-400 mt-1">
                        {userData.activityStatus ? 'You are visible online.' : 'You are hidden.'}
                    </p>
                </div>
                <button 
                  onClick={toggleActivityStatus}
                  className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${userData.activityStatus ? 'bg-green-500' : 'bg-dark-600'}`}
                >
                    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${userData.activityStatus ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in pt-6 pb-32 overflow-y-auto px-6 bg-dark-900">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* Header Profile Card */}
      <div className="flex flex-col items-center mb-8">
        <div 
            className="relative mb-4 group cursor-pointer" 
            onClick={() => !isUploading && fileInputRef.current?.click()}
        >
           <div className="w-28 h-28 rounded-full bg-dark-800 border-2 border-dark-700 p-1 transition-colors group-hover:border-gray-500 relative">
              <div className="w-full h-full rounded-full bg-dark-700 overflow-hidden relative">
                 {userData.avatar ? (
                   <img src={userData.avatar} alt="Profile" className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-dark-800">
                     <User size={40} className="text-gray-600" />
                   </div>
                 )}
                 {isUploading && (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <Loader2 className="animate-spin text-white" />
                     </div>
                 )}
              </div>
           </div>
           <button 
             onClick={(e) => {
                 e.stopPropagation();
                 fileInputRef.current?.click();
             }}
             className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg border-2 border-dark-900 transition-transform hover:scale-110"
           >
              <Camera size={16} />
           </button>
        </div>

        {isEditingName ? (
          <div className="flex items-center gap-2 mb-1">
             <input 
               type="text" 
               value={newName}
               onChange={(e) => setNewName(e.target.value)}
               className="bg-dark-800 border border-dark-700 text-white px-3 py-1 rounded-lg text-xl font-bold outline-none focus:border-white w-40 text-center"
               autoFocus
             />
             <button onClick={handleNameSave} className="p-1 bg-green-500 rounded text-black"><Check size={16}/></button>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 group">
             {userData.name || 'User Name'}
             <button onClick={() => setIsEditingName(true)} className="text-gray-600 hover:text-white transition-colors"><Edit2 size={14} /></button>
          </h1>
        )}
        
        {userData.activityStatus && (
            <div className="flex items-center gap-2 bg-dark-800 px-3 py-1 rounded-full border border-dark-700">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-gray-300">Online</span>
            </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex justify-center gap-4 mb-8">
        <div className="bg-dark-800 border border-dark-700 rounded-2xl px-6 py-3 text-center min-w-[100px]">
            <span className="block text-xl font-bold text-white">{userData.streak || 0}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Day Streak</span>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-2xl px-6 py-3 text-center min-w-[100px]">
            <span className="block text-xl font-bold text-white">{coins.toLocaleString()}</span>
            <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-medium">Coins</span>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        
        {/* Refer & Earn Banner */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Earnings</h3>
            <div className="rounded-2xl overflow-hidden border border-yellow-500/30">
               <MenuItem 
                 icon={Gift} 
                 label="Refer & Earn Rewards" 
                 value={`${coins.toLocaleString()} Pts`}
                 highlight={true}
                 onClick={() => setCurrentSubScreen('REFERRAL')}
               />
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Account</h3>
            <div className="rounded-2xl overflow-hidden border border-dark-700 bg-dark-800/30">
               <MenuItem icon={User} label="Personal Information" onClick={() => setCurrentSubScreen('PERSONAL_INFO')} />
               <MenuItem icon={Shield} label="Privacy & Security" onClick={() => setCurrentSubScreen('PRIVACY')} />
               <MenuItem icon={Bell} label="Notifications" value="On" />
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">App</h3>
            <div className="rounded-2xl overflow-hidden border border-dark-700 bg-dark-800/30">
               <MenuItem icon={HelpCircle} label="Help & Support" />
               <MenuItem icon={Settings} label="Preferences" />
            </div>
        </div>

        <div className="pt-2">
             <button 
                onClick={handleLogout}
                className="w-full bg-dark-800/50 border border-dark-700 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-400 font-medium hover:bg-dark-800 hover:text-red-300 transition-all active:scale-[0.98]"
             >
                <LogOut size={18} />
                Log Out
             </button>
             <p className="text-center text-[10px] text-dark-600 mt-6 font-medium">aim v1.0.1</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;