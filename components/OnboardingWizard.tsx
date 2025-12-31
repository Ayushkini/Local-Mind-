import React, { useState } from 'react';
import { LocalDNA } from '../types';
import { ArrowRight, Check, DollarSign, Users, Clock, Coffee, Briefcase } from 'lucide-react';

interface OnboardingWizardProps {
  city: string;
  onComplete: (dna: LocalDNA) => void;
}

const STEPS = [
  { id: 'budget', title: 'What is your budget?', icon: DollarSign },
  { id: 'crowd', title: 'Crowd tolerance?', icon: Users },
  { id: 'food', title: 'Food preference?', icon: Coffee }, // Multi-select
  { id: 'lifestyle', title: 'Your travel lifestyle?', icon: Briefcase },
  { id: 'time', title: 'When are you active?', icon: Clock },
];

const OPTIONS: Record<string, any[]> = {
  budget: [
    { value: '₹', label: 'Budget / Student', desc: 'Street food & public transport' },
    { value: '₹₹', label: 'Moderate', desc: 'Casual dining & comfort' },
    { value: '₹₹₹', label: 'Premium', desc: 'Fine dining & luxury' },
  ],
  crowd: [
    { value: 'Quiet', label: 'Quiet & Peaceful', desc: 'Avoid the masses' },
    { value: 'Moderate', label: 'Balanced', desc: 'Some buzz is okay' },
    { value: 'Busy', label: 'Energetic', desc: 'Love the crowd' },
  ],
  food: [
    { value: 'Street', label: 'Street Food' },
    { value: 'Café', label: 'Hipster Cafés' },
    { value: 'Authentic', label: 'Local Authentic' },
    { value: 'Fine Dine', label: 'Fine Dining' },
  ],
  lifestyle: [
    { value: 'Student', label: 'Student / Backpacker' },
    { value: 'Working', label: 'Digital Nomad' },
    { value: 'Family', label: 'Family Friendly' },
    { value: 'Explorer', label: 'Urban Explorer' },
  ],
  time: [
    { value: 'Morning', label: 'Early Bird' },
    { value: 'Evening', label: 'Evening Chill' },
    { value: 'Late Night', label: 'Night Owl' },
  ],
};

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ city, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dna, setDna] = useState<Partial<LocalDNA>>({
    foodPreference: []
  });

  const stepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleSelect = (value: string) => {
    if (stepData.id === 'food') {
      const current = dna.foodPreference || [];
      const updated = current.includes(value)
        ? current.filter(i => i !== value)
        : [...current, value];
      setDna({ ...dna, foodPreference: updated });
    } else {
      const updated = { ...dna, [stepData.id === 'crowd' ? 'crowdPreference' : stepData.id === 'time' ? 'timePreference' : stepData.id]: value };
      setDna(updated);
      
      // Auto advance for single select
      if (currentStep < STEPS.length - 1) {
        setTimeout(() => setCurrentStep(curr => curr + 1), 250);
      } else {
        // Final step
        setTimeout(() => onComplete(updated as LocalDNA), 250);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onComplete(dna as LocalDNA);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[60vh] fade-in relative z-10">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-12 overflow-hidden">
        <div 
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <stepData.icon size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{stepData.title}</h2>
        <p className="text-slate-500 dark:text-slate-400">Helping us find the perfect spots in {city}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
        {OPTIONS[stepData.id].map((opt) => {
          const isSelected = stepData.id === 'food' 
            ? dna.foodPreference?.includes(opt.value)
            : (dna as any)[stepData.id === 'crowd' ? 'crowdPreference' : stepData.id === 'time' ? 'timePreference' : stepData.id] === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`
                p-6 rounded-xl border-2 text-left transition-all duration-200 group relative
                ${isSelected 
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm'
                }
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`block font-semibold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-200'}`}>
                    {opt.label}
                  </span>
                  {opt.desc && (
                    <span className={`text-sm mt-1 block ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {opt.desc}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {stepData.id === 'food' && (
        <button
          onClick={handleNext}
          disabled={!dna.foodPreference?.length}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all
            ${dna.foodPreference?.length 
              ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white hover:scale-105 shadow-lg' 
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}
          `}
        >
          Next Step <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};

export default OnboardingWizard;
