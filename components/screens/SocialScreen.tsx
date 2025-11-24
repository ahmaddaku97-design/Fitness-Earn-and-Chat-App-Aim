import React, { useState, useEffect, useRef } from 'react';
import { Globe, Lock, Send, Plus, Hash, ArrowLeft, AlertCircle } from 'lucide-react';
import { UserData, Message } from '../../types';
import Button from '../ui/Button';
import { db } from '../../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, where, serverTimestamp } from 'firebase/firestore';

interface SocialScreenProps {
  userData: UserData;
}

const SocialScreen: React.FC<SocialScreenProps> = ({ userData }) => {
  const [activeTab, setActiveTab] = useState<'world' | 'private'>('world');
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [permissionError, setPermissionError] = useState(false);

  // Room State
  const [roomIdInput, setRoomIdInput] = useState(''); // For input
  const [currentRoom, setCurrentRoom] = useState<string | null>(null); // Active room

  const [messages, setMessages] = useState<Message[]>([]);

  // Listen for messages
  useEffect(() => {
    const roomId = activeTab === 'world' ? 'world' : currentRoom;
    if (!roomId) return;

    // Reset messages when switching rooms
    setMessages([]);
    setPermissionError(false);

    const q = query(
        collection(db, 'messages'),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'asc'),
        limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setPermissionError(false);
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
            msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
    }, (error) => {
        console.error("Chat Subscription Error:", error);
        // Explicitly handle permission denied to stop the "Uncaught Error" spam
        if (error.code === 'permission-denied') {
            setPermissionError(true);
        }
    });

    return () => unsubscribe();
  }, [activeTab, currentRoom]);

  // Scroll to bottom logic
  useEffect(() => {
    if (scrollRef.current) {
        // Use scrollTop instead of scrollIntoView to prevent the whole page from jumping
        const container = scrollRef.current;
        container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const targetRoom = activeTab === 'world' ? 'world' : currentRoom;
    if (!targetRoom) return;

    if (!userData.uid) {
        alert("Error: User ID missing. Please ensure you are logged in.");
        return;
    }

    try {
        await addDoc(collection(db, 'messages'), {
            text: inputMessage.trim(),
            senderId: userData.uid,
            senderName: userData.name || 'User',
            senderAvatar: userData.avatar || '',
            roomId: targetRoom,
            timestamp: serverTimestamp()
        });
        setInputMessage('');
        // Scrolling handled by useEffect
    } catch (e: any) {
        console.error("Error sending message", e);
        if (e.code === 'permission-denied') {
            alert("Message failed: You do not have permission to post in this channel (Database Rule Block).");
        } else {
            alert(`Failed to send message: ${e.message}`);
        }
    }
  };

  const handleCreateRoom = () => {
    const newId = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentRoom(newId);
  };

  const handleJoinRoom = () => {
    if (roomIdInput.length >= 4) {
      setCurrentRoom(roomIdInput);
      setRoomIdInput('');
    }
  };

  // If in Private tab and NOT in a room, show the selection UI
  if (activeTab === 'private' && !currentRoom) {
    return (
      <div className="h-full flex flex-col bg-dark-900 animate-fade-in relative">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-dark-700 flex items-center justify-between bg-dark-900 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-white">Social</h1>
          <div className="flex bg-dark-800 rounded-lg p-1 border border-dark-700">
            <button onClick={() => setActiveTab('world')} className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white transition-colors">World</button>
            <button onClick={() => setActiveTab('private')} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-black shadow-sm transition-colors">Private</button>
          </div>
        </div>

        {/* Selection Content */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pb-32">
           
           {/* Join Room Card */}
           <div className="bg-dark-800 border border-dark-700 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-black border border-dark-600 flex items-center justify-center">
                  <Hash size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Join a Room</h3>
                  <p className="text-xs text-gray-400">Enter a Room ID to join friends.</p>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="Enter Room ID..." 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-white transition-colors"
              />
              <Button onClick={handleJoinRoom} disabled={!roomIdInput}>Join Room</Button>
           </div>

           <div className="flex items-center gap-4">
             <div className="h-px bg-dark-700 flex-1" />
             <span className="text-xs text-gray-500 font-bold">OR</span>
             <div className="h-px bg-dark-700 flex-1" />
           </div>

           {/* Create Room Card */}
           <div className="bg-dark-800 border border-dark-700 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Create a Room</h3>
                  <p className="text-xs text-gray-400">Start a new private chat room.</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleCreateRoom}>Create New Room</Button>
           </div>
        </div>
      </div>
    );
  }

  // Chat Interface (World or Private Room)
  return (
    <div className="h-full flex flex-col bg-dark-900 animate-fade-in relative">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between bg-dark-900 z-10 shrink-0">
        <div className="flex items-center gap-3">
          {activeTab === 'private' && (
            <button onClick={() => setCurrentRoom(null)} className="p-2 -ml-2 hover:bg-dark-800 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {activeTab === 'world' ? 'World Chat' : `Room ${currentRoom}`}
              <span className={`w-2 h-2 rounded-full ${permissionError ? 'bg-red-500' : 'bg-green-500 animate-pulse'} shadow-[0_0_10px_rgba(34,197,94,0.5)]`} />
            </h2>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider font-medium">
              {activeTab === 'world' ? <Globe size={10} /> : <Lock size={10} />}
              {activeTab === 'world' ? 'Global Channel' : 'Private Channel'}
            </p>
          </div>
        </div>

        {/* Tab Switcher (only in World mode inside chat, or simple exit for private) */}
        {activeTab === 'world' && (
          <div className="flex bg-dark-800 rounded-lg p-1 border border-dark-700 scale-90 origin-right">
            <button onClick={() => setActiveTab('world')} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-black shadow-sm transition-colors">World</button>
            <button onClick={() => setActiveTab('private')} className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white transition-colors">Private</button>
          </div>
        )}
      </div>

      {/* Chat List - Rendered inline to prevent re-mounting on re-renders */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {permissionError ? (
           <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-70">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Chat Unavailable</h3>
              <p className="text-xs text-gray-400">Access denied. Please check your connection or database permissions.</p>
           </div>
        ) : messages.length > 0 ? (
           <>
            {messages.map((msg) => {
                const isMe = msg.senderId === userData.uid;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-dark-700 overflow-hidden shrink-0 mb-1 border border-dark-700">
                            <img src={msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName}`} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        )}
                        <div 
                        className={`px-4 py-2.5 rounded-2xl text-sm break-words leading-relaxed shadow-sm ${
                            isMe 
                            ? 'bg-white text-black rounded-br-sm' 
                            : 'bg-dark-800 text-white border border-dark-700 rounded-bl-sm'
                        }`}
                        >
                        {!isMe && <p className="text-[10px] text-gray-400 mb-0.5 font-bold">{msg.senderName}</p>}
                        {msg.text}
                        </div>
                    </div>
                    </div>
                );
            })}
           </>
        ) : (
            <div className="text-center text-gray-500 text-xs mt-10">No messages yet. Say hi!</div>
        )}
      </div>

      {/* Input Area - Pinned above bottom nav */}
      <div className="px-4 pt-3 pb-24 bg-dark-900 shrink-0 z-20">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-700 focus-within:border-white focus-within:bg-dark-800 transition-colors flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={permissionError ? "Read-only mode (Error)" : "Type a message..."}
              className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3.5 text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:scale-100 active:scale-95 hover:scale-105 transition-all shadow-lg shadow-white/10 shrink-0"
          >
            <Send size={20} className="text-black ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialScreen;