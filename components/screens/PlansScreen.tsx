import React, { useState, useEffect } from 'react';
import { Search, PackageOpen, Filter, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { Plan } from '../../types';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface PlansScreenProps {
  userId: string;
}

const CATEGORIES = ['All', 'Workout', 'Skincare', 'Haircare', 'Diet'];

const PlansScreen: React.FC<PlansScreenProps> = ({ userId }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
        try {
            const q = query(
                collection(db, 'plans'), 
                where('userId', '==', userId),
                orderBy('timestamp', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const fetchedPlans: Plan[] = [];
            querySnapshot.forEach((doc) => {
                fetchedPlans.push({ id: doc.id, ...doc.data() } as Plan);
            });
            setPlans(fetchedPlans);
        } catch (error: any) {
            // Error potentially due to missing index for composite query (userId + timestamp)
            // Fallback to client side sorting if index missing
             console.error("Error fetching plans:", error);
             // Retry without order by if it fails (simple fallback)
             try {
                const q2 = query(collection(db, 'plans'), where('userId', '==', userId));
                const snap = await getDocs(q2);
                const p: Plan[] = [];
                snap.forEach(d => p.push({id: d.id, ...d.data()} as Plan));
                setPlans(p);
             } catch (e) {}
        } finally {
            setLoading(false);
        }
    };
    fetchPlans();
  }, [userId]);

  const filteredPlans = plans.filter(plan => {
    const matchesCategory = activeCategory === 'All' || plan.category === activeCategory;
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col animate-fade-in pt-2">
      {/* Header & Search */}
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Plan Library</h1>
        <p className="text-gray-400 text-sm mb-6">Discover plans created by you.</p>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800 text-white placeholder-gray-600 pl-12 pr-12 py-3 rounded-xl border border-dark-700 focus:border-white outline-none transition-all text-sm"
          />
          <button className="absolute right-3 top-2.5 p-1 text-gray-500 hover:text-white">
            <Filter size={18} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-dark-800 text-gray-400 border border-dark-700 hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-24 overflow-y-auto">
        {loading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-white" />
            </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
                <div key={plan.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 active:scale-95 transition-transform">
                    <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 rounded bg-dark-700 text-[10px] font-bold text-gray-300 uppercase tracking-wider">{plan.category}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} /> {plan.createdAt || 'Recently'}
                        </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{plan.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{plan.description}</p>
                    
                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                        View Plan <ChevronRight size={16} />
                    </button>
                </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-dark-700 rounded-3xl p-8">
            <PackageOpen className="w-12 h-12 text-dark-700 mb-4" />
            <h3 className="text-white font-medium mb-1">No plans found.</h3>
            <p className="text-gray-500 text-sm">Create a new plan to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansScreen;