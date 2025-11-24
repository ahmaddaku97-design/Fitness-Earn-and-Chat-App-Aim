
import React, { useState, useEffect } from 'react';
import { Flame, Users, Bell, Search, X, UserPlus, Coins, ChevronRight, Check, AlertCircle, Trophy } from 'lucide-react';
import { UserData, Friend } from '../../types';
import Button from '../ui/Button';
import { db } from '../../firebase';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface DashboardScreenProps {
  userData: UserData;
  onUpdateUser: (data: Partial<UserData>) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ userData, onUpdateUser }) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(false);

  useEffect(() => {
    // Check if user checked in today based on lastCheckInDate string
    if (userData.lastCheckInDate) {
        const lastDate = new Date(userData.lastCheckInDate).toDateString();
        const today = new Date().toDateString();
        if (lastDate === today) {
            setCheckedIn(true);
        } else {
            setCheckedIn(false);
        }
    } else {
        setCheckedIn(false);
    }
  }, [userData]);

  // Fetch Live Leaderboard
  useEffect(() => {
    const q = query(
        collection(db, 'users'),
        orderBy('streak', 'desc'),
        limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setLeaderboardError(false);
        const users: UserData[] = [];
        snapshot.forEach((doc) => {
            users.push(doc.data() as UserData);
        });
        setLeaderboard(users);
        setLoadingLeaderboard(false);
    }, (error) => {
        console.error("Error fetching leaderboard:", error);
        setLoadingLeaderboard(false);
        if (error.code === 'permission-denied') {
            setLeaderboardError(true);
        }
    });

    return () => unsubscribe();
  }, []);

  const handleCheckIn = async () => {
    if (checkedIn) return;
    
    // Double check date to prevent race conditions
    if (userData.lastCheckInDate) {
        const lastDate = new Date(userData.lastCheckInDate).toDateString();
        const today = new Date().toDateString();
        if (lastDate === today) return;
    }

    setCheckedIn(true);
    const newStreak = (userData.streak || 0) + 1;
    const newCoins = (userData.coins || 0) + 50;
    const now = new Date().toISOString();

    onUpdateUser({ 
        streak: newStreak, 
        coins: newCoins,
        lastCheckInDate: now
    });
  };

  const handleSearchFriend = async () => {
    if (!friendSearch.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);

    try {
        const q = query(collection(db, 'users'), where('uid', '==', friendSearch.trim()));
        const querySnapshot = await getDocs(q);
        const results: Friend[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Don't show self
            if (data.uid !== userData.uid) {
                results.push({
                    uid: data.uid,
                    name: data.name || 'User',
                    avatar: data.avatar || '',
                    status: data.activityStatus ? 'Online' : 'Offline'
                });
            }
        });
        setSearchResults(results);
    } catch (e) {
        console.error("Search error", e);
    }
    setIsSearching(false);
  };

  const handleAddFriend = async (friend: Friend) => {
    // Check if already friend
    if (userData.friends?.some(f => f.uid === friend.uid)) {
        alert("Already friends!");
        return;
    }

    // Optimistic Update
    const newFriends = [...(userData.friends || []), friend];
    onUpdateUser({ friends: newFriends });

    try {
        const userRef = doc(db, 'users', userData.uid!);
        await updateDoc(userRef, {
            friends: arrayUnion(friend)
        });
        alert(`Added ${friend.name} as friend!`);
        setFriendSearch('');
        setSearchResults([]);
        setHasSearched(false);
    } catch (e) {
        console.error("Add friend error", e);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Friend Sidebar */}
      <div 
        className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-dark-900 border-l border-dark-700 z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-dark-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Friends</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-dark-800 rounded-full">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
           {/* Add Friend Section */}
           <div className="bg-dark-800 rounded-xl p-3 border border-dark-700">
              <label className="text-xs text-gray-400 mb-2 block font-medium uppercase tracking-wider">Add Friend by UID</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  value={friendSearch}
                  onChange={(e) => {
                      setFriendSearch(e.target.value);
                      setHasSearched(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchFriend()}
                  placeholder="Enter UID..."
                  className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:border-white outline-none"
                />
                <button 
                  onClick={handleSearchFriend}
                  disabled={isSearching}
                  className="bg-white text-black p-2 rounded-lg flex items-center justify-center disabled:opacity-50"
                >
                  <Search size={18} />
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 ? (
                  <div className="space-y-2 mt-3 animate-fade-in">
                      <p className="text-xs text-gray-500">Found:</p>
                      {searchResults.map(user => (
                          <div key={user.uid} className="flex items-center justify-between bg-dark-900 p-2 rounded-lg border border-dark-700">
                              <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-dark-700 overflow-hidden">
                                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-600"/>}
                                  </div>
                                  <span className="text-sm font-medium text-white">{user.name}</span>
                              </div>
                              <button onClick={() => handleAddFriend(user)} className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                  <UserPlus size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              ) : (
                hasSearched && !isSearching && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg mt-2">
                        <AlertCircle size={14} />
                        {friendSearch.trim() === userData.uid ? 'You cannot add yourself.' : 'No user found.'}
                    </div>
                )
              )}
           </div>

           {/* Friends List */}
           <div>
              <label className="text-xs text-gray-400 mb-3 block font-medium uppercase tracking-wider px-1">My Friends ({userData.friends?.length || 0})</label>
              <div className="space-y-2">
                {userData.friends?.map(friend => (
                  <div key={friend.uid} className="flex items-center gap-3 p-3 hover:bg-dark-800 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-dark-700">
                    <div className="relative">
                      <img src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-10 h-10 rounded-full bg-dark-700 object-cover" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-dark-900 rounded-full ${friend.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{friend.name}</h3>
                      <p className="text-[10px] text-gray-500">UID: {friend.uid}</p>
                    </div>
                  </div>
                ))}
                {(!userData.friends || userData.friends.length === 0) && (
                    <p className="text-gray-500 text-sm italic p-2">No friends yet. Add someone!</p>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-2 animate-fade-in overflow-y-auto pb-40">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-dark-900/95 backdrop-blur-md py-4 z-10 -mx-6 px-6 border-b border-white/5">
          <div>
            <h1 className="text-xl font-bold text-white mb-0.5">
              Hi, {userData.name || 'Athlete'}
            </h1>
            <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full w-fit">
              <Coins size={12} className="fill-yellow-500" />
              <span className="text-xs font-bold">{userData.coins?.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center hover:bg-dark-700 transition-colors relative"
             >
                <Search className="w-5 h-5 text-white" />
             </button>
             <div className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center overflow-hidden">
                {userData.avatar ? (
                    <img src={userData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <Bell className="w-5 h-5 text-gray-400" />
                )}
             </div>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-3xl p-6 mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6 text-white fill-white" />
            <span className="text-lg font-bold text-white">Daily Streak</span>
          </div>
          
          <p className="text-gray-400 text-sm mb-8">Check in every day to build your streak and earn rewards.</p>
          
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-6xl font-bold text-white tracking-tighter">{userData.streak || 0}</span>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">Days</span>
          </div>

          <div className="relative z-10">
            <Button 
              variant={checkedIn ? 'outline' : 'primary'} 
              onClick={handleCheckIn}
              disabled={checkedIn}
            >
              {checkedIn ? <span className="flex items-center gap-2"><Check size={16}/> Checked In</span> : 'Daily Check-in (+50 Coins)'}
            </Button>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-dark-800 border border-dark-700 rounded-3xl p-6 mb-24">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-white">Global Leaderboard</h2>
             </div>
             {userData.streak && userData.streak > 0 && (
                 <span className="text-xs text-gray-500 bg-dark-900 px-2 py-1 rounded-full border border-dark-700">
                     Your Streak: {userData.streak}
                 </span>
             )}
          </div>
          
          <div className="space-y-3">
             {loadingLeaderboard ? (
                 <div className="text-center py-4 text-gray-500 text-sm flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                    Loading rankings...
                 </div>
             ) : leaderboardError ? (
                 <div className="text-center py-4 text-red-400 text-sm flex flex-col items-center gap-2 bg-red-500/5 rounded-xl border border-red-500/10">
                    <AlertCircle size={16} />
                    <span>Leaderboard unavailable</span>
                    <span className="text-[10px] text-gray-500">Access denied by server</span>
                 </div>
             ) : leaderboard.length > 0 ? (
                 leaderboard.map((user, index) => {
                     const rank = index + 1;
                     const isTop3 = rank <= 3;
                     
                     let rankStyle = "bg-dark-900 border-dark-700 text-white";
                     let icon = <span className="text-sm font-bold w-6 text-center text-gray-500">{rank}</span>;
                     
                     if (rank === 1) {
                         rankStyle = "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/50 text-yellow-500";
                         icon = <span className="text-xl w-6 text-center">🥇</span>;
                     } else if (rank === 2) {
                         rankStyle = "bg-gradient-to-r from-gray-300/10 to-transparent border-gray-300/50 text-gray-300";
                         icon = <span className="text-xl w-6 text-center">🥈</span>;
                     } else if (rank === 3) {
                         rankStyle = "bg-gradient-to-r from-orange-600/10 to-transparent border-orange-600/50 text-orange-400";
                         icon = <span className="text-xl w-6 text-center">🥉</span>;
                     }

                     return (
                         <div key={user.uid || index} className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] ${rankStyle}`}>
                             <div className="flex items-center gap-3">
                                 {icon}
                                 <div className="w-9 h-9 rounded-full bg-dark-700 p-0.5 border border-white/10 overflow-hidden relative shrink-0">
                                    {user.avatar ? (
                                        <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-500">{user.name?.charAt(0) || 'U'}</span>
                                        </div>
                                    )}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className={`text-sm font-bold ${isTop3 ? 'text-white' : 'text-gray-300'}`}>
                                        {user.name || 'Anonymous'}
                                        {user.uid === userData.uid && <span className="ml-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-normal">You</span>}
                                     </span>
                                     <span className="text-[10px] opacity-60">Streak Master</span>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
                                <Flame size={14} className={isTop3 ? "fill-orange-500 text-orange-500" : "text-gray-500"} />
                                <span className="font-bold text-sm">{user.streak || 0}</span>
                             </div>
                         </div>
                     );
                 })
             ) : (
                 <div className="text-center py-4 text-gray-500 text-sm">No rankings available.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
