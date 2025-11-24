import React, { useState } from 'react';
import { Wand2, ChevronDown, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { Screen, Plan } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CreatePlanScreenProps {
  onNavigate: (screen: Screen) => void;
  userId: string;
}

const CreatePlanScreen: React.FC<CreatePlanScreenProps> = ({ onNavigate, userId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSteps, setGeneratedSteps] = useState<string[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = () => {
    if (!title || !description) return;
    
    setIsGenerating(true);
    
    // Mock AI generation for now, could be replaced with actual AI call later
    setTimeout(() => {
      setGeneratedSteps([
        "Warm up: 5 minutes of light cardio (jogging or jumping jacks).",
        "Main Set: 3 sets of 12 Push-ups focusing on form.",
        "Main Set: 3 sets of 15 Bodyweight Squats.",
        "Main Set: 3 sets of 30-second Plank hold.",
        "Cool down: 5 minutes of stretching major muscle groups."
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSave = async () => {
    if (!title || !generatedSteps) return;
    setIsSaving(true);

    try {
        await addDoc(collection(db, 'plans'), {
            userId: userId,
            title,
            category: category || 'General',
            description,
            steps: generatedSteps,
            createdAt: new Date().toLocaleDateString(),
            timestamp: serverTimestamp()
        });
        onNavigate(Screen.PLANS);
    } catch (e) {
        console.error("Error saving plan", e);
        alert("Failed to save plan.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-dark-800 shrink-0 bg-dark-900 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-white">Create Plan</h1>
          <p className="text-gray-400 text-xs">AI-powered fitness planning.</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-6 shadow-lg">
          <h2 className="text-white font-semibold mb-4 text-sm">Plan Details</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">Plan Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-white outline-none transition-colors placeholder-gray-600"
                placeholder="e.g., Morning Hiit"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">Category</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-white outline-none transition-colors appearance-none"
                >
                  <option value="">Select a category</option>
                  <option value="Workout">Workout</option>
                  <option value="Diet">Diet</option>
                  <option value="Wellness">Wellness</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">Goal Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-white outline-none transition-colors min-h-[120px] resize-none placeholder-gray-600"
                placeholder="I want to lose weight and build muscle. I have dumbbells at home..."
              />
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !title || !description}>
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wand2 size={18} /> Generate Plan
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-4 text-sm">Generated Steps</h2>
          
          {generatedSteps ? (
            <div className="space-y-3 animate-fade-in">
              {generatedSteps.map((step, idx) => (
                <div key={idx} className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
              <div className="pt-4">
                 <Button variant="outline" onClick={handleSave} isLoading={isSaving}>Save Plan to Library</Button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-dark-700 rounded-2xl p-8 text-center bg-dark-800/30">
              <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-3">
                 <Wand2 className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-500 text-xs">
                Fill out the form above to generate<br/>your personalized plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlanScreen;