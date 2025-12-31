import React, { useState, useEffect } from 'react';
import { AppView, LocalDNA, PlaceRecommendation, UserLocation } from './types';
import { generateRecommendations } from './services/geminiService';
import { fetchPlaceDetails, loadGoogleMapsApi } from './services/mapService';
import CitySelection from './components/CitySelection';
import OnboardingWizard from './components/OnboardingWizard';
import ResultsView from './components/ResultsView';
import { MapPin, Loader2, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [city, setCity] = useState<string>('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [dna, setDna] = useState<LocalDNA | null>(null);
  const [recommendations, setRecommendations] = useState<PlaceRecommendation[]>([]);
  const [loadingStage, setLoadingStage] = useState<string>('');
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Load Maps API on mount to be ready
  useEffect(() => {
    loadGoogleMapsApi().catch(err => console.error("Failed to load Maps API", err));
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleStart = () => setView(AppView.CITY_SELECT);

  const handleCitySelect = (selectedCity: string, location?: UserLocation) => {
    setCity(selectedCity);
    if (location) {
      setUserLocation(location);
    } else {
      setUserLocation(null);
    }
    setView(AppView.ONBOARDING);
  };

  const handleOnboardingComplete = async (userDna: LocalDNA) => {
    setDna(userDna);
    setView(AppView.PROCESSING);
    
    try {
      setLoadingStage('Analyzing vibes...');
      // 1. Get Curation from Gemini
      const geminiResults = await generateRecommendations(city, userDna, userLocation || undefined);
      
      setLoadingStage('Connecting to Google Maps...');
      // 2. Hydrate with Real Google Maps Data (Photos, Coords, Ratings)
      const hydratedResults = await Promise.all(
        geminiResults.map(async (place) => {
          const googleDetails = await fetchPlaceDetails(place, city);
          return { ...place, ...googleDetails };
        })
      );
      
      // Filter out places where Maps couldn't find coordinates (hallucinations or API errors)
      // We check for lat !== 0 because Gemini returns 0 as placeholder
      const validResults = hydratedResults.filter(p => p.coordinates.lat !== 0);

      setRecommendations(validResults);
      setView(AppView.RESULTS);
    } catch (e) {
      console.error(e);
      // Handle error gracefully - could go back or show alert
      setView(AppView.CITY_SELECT);
      alert("Something went wrong processing your request. Please check API Key.");
    }
  };

  const renderView = () => {
    switch (view) {
      case AppView.HOME:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative z-10">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-rose-200/20 dark:bg-rose-900/20 rounded-full blur-3xl"></div>
             </div>

             <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none rotate-3 animate-[pulse_4s_ease-in-out_infinite] transition-colors duration-300">
                <MapPin className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
             </div>
             
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 fade-in">
               Think Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">Local</span>.
             </h1>
             <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10 fade-in" style={{animationDelay: '0.1s'}}>
               Discover hidden gems, avoid tourist traps, and experience a city's authentic vibe with AI-powered insights.
             </p>
             <button 
               onClick={handleStart}
               className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 hover:-translate-y-1 fade-in"
               style={{animationDelay: '0.2s'}}
             >
               Start Exploring
               <span className="absolute inset-0 rounded-full ring-2 ring-white/20 dark:ring-slate-900/20 group-hover:ring-white/40 dark:group-hover:ring-slate-900/40 transition-all" />
             </button>
             
             <div className="mt-12 flex gap-8 text-sm text-slate-400 dark:text-slate-500 fade-in" style={{animationDelay: '0.3s'}}>
               <span>Powered by Gemini</span>
               <span>•</span>
               <span>Google Maps Platform</span>
               <span>•</span>
               <span>Real-time</span>
             </div>
          </div>
        );

      case AppView.CITY_SELECT:
        return <CitySelection onSelect={handleCitySelect} />;

      case AppView.ONBOARDING:
        return <OnboardingWizard city={city} onComplete={handleOnboardingComplete} />;

      case AppView.PROCESSING:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Local Patterns...</h2>
            <div className="space-y-2 text-center text-slate-500 dark:text-slate-400">
               <p className="animate-pulse">{loadingStage}</p>
               <p className="animate-pulse" style={{animationDelay: '0.5s'}}>Matching with your {dna?.lifestyle} vibe...</p>
               <p className="animate-pulse" style={{animationDelay: '1s'}}>Fetching real-time data...</p>
            </div>
          </div>
        );

      case AppView.RESULTS:
        return (
          <ResultsView 
            city={city} 
            dna={dna!} 
            places={recommendations} 
            userLocation={userLocation}
            onBack={() => setView(AppView.CITY_SELECT)} 
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
       <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-[60] p-3 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm transition-all hover:scale-110 text-slate-700 dark:text-slate-200"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      {renderView()}
    </div>
  );
};

export default App;
