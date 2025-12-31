import React, { useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { POPULAR_CITIES } from '../constants';
import { UserLocation } from '../types';

interface CitySelectionProps {
  onSelect: (city: string, location?: UserLocation) => void;
}

const CitySelection: React.FC<CitySelectionProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locating, setLocating] = useState(false);

  const filteredCities = POPULAR_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Simple reverse geocoding using OpenStreetMap (Free, no key needed) to get context
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const cityContext = data.address.city || data.address.town || data.address.state_district || "Current Location";
          
          setLocating(false);
          onSelect(cityContext, { lat: latitude, lng: longitude, label: data.display_name });
        } catch (e) {
          // Fallback if network fails
          setLocating(false);
          onSelect("Current Location", { lat: latitude, lng: longitude });
        }
      },
      (error) => {
        console.error(error);
        setLocating(false);
        alert("Unable to retrieve your location. Please check permissions.");
      }
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 fade-in relative z-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">Where are you heading?</h2>
        <p className="text-slate-500 dark:text-slate-400">Choose a city or use your location to find hidden gems nearby.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-16">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            placeholder="Search for a city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm) {
                  onSelect(searchTerm);
              }
            }}
          />
        </div>
        
        <button
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg transition-all disabled:opacity-70 disabled:cursor-wait whitespace-nowrap"
        >
          {locating ? (
            <>Finding you...</>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              Use My Location
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCities.map((city) => (
          <button
            key={city.name}
            onClick={() => onSelect(city.name)}
            className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left border border-slate-100 dark:border-slate-800"
          >
            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
            <img 
              src={city.image} 
              alt={city.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 p-5 z-20 w-full bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 text-white mb-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-medium uppercase tracking-wider">{city.country}</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">{city.name}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CitySelection;
