import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PlaceRecommendation, LocalDNA, UserLocation } from '../types';
import { MapPin, Star, Clock, ArrowLeft, Heart, Share2, ExternalLink, Navigation, Map as MapIcon, SearchX } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsViewProps {
  city: string;
  dna: LocalDNA;
  places: PlaceRecommendation[];
  userLocation: UserLocation | null;
  onBack: () => void;
}

// Haversine formula for distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
};

const ResultsView: React.FC<ResultsViewProps> = ({ city, dna, places, userLocation, onBack }) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(places[0]?.id || null);
  const [sortBy, setSortBy] = useState<'match' | 'distance'>('match');
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const hasPlaces = places && places.length > 0;

  // Augment places with distance if user location exists
  const augmentedPlaces = useMemo(() => {
    if (!hasPlaces) return [];
    return places.map(place => ({
      ...place,
      distance: userLocation 
        ? calculateDistance(userLocation.lat, userLocation.lng, place.coordinates.lat, place.coordinates.lng)
        : undefined
    })).sort((a, b) => {
      if (sortBy === 'distance' && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return b.localAuthenticityScore - a.localAuthenticityScore;
    });
  }, [places, userLocation, sortBy, hasPlaces]);

  const selectedPlace = augmentedPlaces.find(p => p.id === selectedPlaceId) || augmentedPlaces[0];

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || !hasPlaces || !selectedPlace) return;
    
    // Check if Google Maps is actually loaded
    if (!window.google || !window.google.maps) {
        setMapError(true);
        return;
    }

    try {
        if (!googleMapInstance.current) {
            googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: selectedPlace.coordinates,
                zoom: 14,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                styles: [
                    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] } // Clean look
                ]
            });
        }
    } catch (e) {
        console.error("Error initializing map", e);
        setMapError(true);
    }
  }, [hasPlaces]);

  // Update Markers when places change
  useEffect(() => {
    if (!googleMapInstance.current || !window.google || mapError || !hasPlaces) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoords = false;

    augmentedPlaces.forEach(place => {
        // Skip invalid coordinates
        if (!place.coordinates || (place.coordinates.lat === 0 && place.coordinates.lng === 0)) return;
        
        hasValidCoords = true;
        const marker = new window.google.maps.Marker({
            position: place.coordinates,
            map: googleMapInstance.current,
            title: place.name,
            animation: window.google.maps.Animation.DROP,
            // Custom color pin based on selection
            icon: place.id === selectedPlaceId 
                ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' 
                : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });

        marker.addListener('click', () => {
            setSelectedPlaceId(place.id);
            // Scroll to card
            const el = document.getElementById(`card-${place.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        markersRef.current.push(marker);
        bounds.extend(place.coordinates);
    });

    if (userLocation) {
        // Add User Marker
        new window.google.maps.Marker({
            position: { lat: userLocation.lat, lng: userLocation.lng },
            map: googleMapInstance.current,
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#4f46e5',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
            },
            title: "You are here"
        });
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    }

    // Fit bounds if multiple places, else zoom to selected
    if (hasValidCoords) {
        if (augmentedPlaces.length > 1 || userLocation) {
            googleMapInstance.current.fitBounds(bounds);
        } else {
            googleMapInstance.current.panTo(selectedPlace.coordinates);
            googleMapInstance.current.setZoom(15);
        }
    }

  }, [augmentedPlaces, selectedPlaceId, userLocation, mapError, hasPlaces]);

  // Sync Map center with selection from list
  useEffect(() => {
    if (googleMapInstance.current && selectedPlace && selectedPlace.coordinates.lat !== 0) {
        googleMapInstance.current.panTo(selectedPlace.coordinates);
    }
  }, [selectedPlace]);

  const AuthenticityChart = ({ score }: { score: number }) => {
    const data = [
      { name: 'Local', value: score },
      { name: 'Tourist', value: 100 - score },
    ];
    return (
      <div className="h-16 w-16 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={20}
              outerRadius={30}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : 'var(--chart-bg, #e2e8f0)'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
            {score}%
        </div>
      </div>
    );
  };

  const hasApiKey = typeof process !== 'undefined' && process.env.API_KEY && process.env.API_KEY !== 'undefined';

  if (!hasPlaces) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-6">
          <SearchX className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No places found</h2>
        <p className="text-slate-500 max-w-md mb-8">We couldn't verify the location of the AI recommendations on Google Maps. Please try a different city or check your internet connection.</p>
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between z-20 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
            <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{city}</span>
        <div className="w-8" />
      </div>

      {/* Left: Map */}
      <div className="hidden lg:block lg:w-1/2 h-full relative border-r border-slate-200 dark:border-slate-800">
        <button 
          onClick={onBack} 
          className="absolute top-6 left-6 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft size={16} /> New Search
        </button>
        
        {/* Real Interactive Map Container or Fallback */}
        {mapError ? (
           <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MapIcon size={48} className="mb-4 opacity-50" />
              <p>Map unavailable. Please check API Key configuration.</p>
           </div>
        ) : (
           <div ref={mapRef} className="w-full h-full bg-slate-200 dark:bg-slate-800" />
        )}
      </div>

      {/* Right: Place Cards */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
        <div className="max-w-xl mx-auto p-4 lg:p-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {userLocation ? 'Near Your Location' : `Hidden Gems in ${city}`}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                AI-curated based on your {dna.lifestyle} vibe.
              </p>
            </div>
            
            {userLocation && (
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                <button 
                  onClick={() => setSortBy('match')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'match' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Best Match
                </button>
                <button 
                  onClick={() => setSortBy('distance')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === 'distance' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Nearest
                </button>
              </div>
            )}
          </div>

          {augmentedPlaces.map((place) => (
            <div 
              key={place.id}
              id={`card-${place.id}`}
              onClick={() => setSelectedPlaceId(place.id)}
              className={`
                bg-white dark:bg-slate-900 rounded-2xl p-0 shadow-sm border transition-all duration-300 overflow-hidden cursor-pointer group
                ${selectedPlaceId === place.id 
                  ? 'ring-2 ring-indigo-500 shadow-xl scale-[1.01] z-10 relative' 
                  : 'border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900'
                }
              `}
            >
              {/* Image Header with Real Photo or Fallback */}
              <div className="h-48 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                <img 
                  src={place.photoUrl || `https://image.pollinations.ai/prompt/high%20quality%20photography%20of%20${encodeURIComponent(place.name)}%20${encodeURIComponent(city)}%20india%20landmark%20daylight?width=800&height=400&nologo=true&seed=${place.id}`} 
                  alt={place.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md
                    ${place.crowdBadge === 'Hidden Gem' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}
                  `}>
                    {place.crowdBadge}
                  </span>
                  {place.distance !== undefined && (
                     <span className="px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-slate-900/80 text-white flex items-center gap-1">
                        <Navigation size={10} /> {place.distance} km
                     </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{place.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm opacity-90">{place.category}</p>
                    {place.rating && (
                         <span className="flex items-center gap-1 text-xs bg-black/40 px-1.5 py-0.5 rounded text-amber-300">
                             <Star size={10} fill="currentColor" /> {place.rating} ({place.userRatingsTotal})
                         </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Stats Row */}
                <div className="flex items-center gap-6 mb-4">
                   <div className="flex items-center gap-3">
                      <AuthenticityChart score={place.localAuthenticityScore} />
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Authenticity</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {place.localAuthenticityScore > 80 ? 'Very High' : 'Moderate'}
                        </span>
                      </div>
                   </div>
                   <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                   <div className="flex flex-col">
                     <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                        <Clock size={12} /> Best Time
                     </span>
                     <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{place.bestTime}</span>
                   </div>
                </div>

                {/* AI Reasoning Box */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 mt-0.5">
                      <Star size={14} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase mb-1">Why Locals Love It</h4>
                      <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                        {place.aiReasoning}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  {place.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {place.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="mt-6 flex gap-3">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.googlePlaceId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={16} /> Open in Maps
                    </a>
                    <button className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Heart size={20} />
                    </button>
                    <button className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:border-indigo-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        <Share2 size={20} />
                    </button>
                </div>
                
                {/* Mobile Map View Helper */}
                <div className="lg:hidden mt-4">
                    <div className="w-full h-48 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {hasApiKey && place.googlePlaceId ? (
                             <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.API_KEY}&q=place_id:${place.googlePlaceId}`}
                            />
                        ) : (
                            <div className="text-slate-400 text-xs flex flex-col items-center">
                                <MapIcon size={24} className="mb-2 opacity-50" />
                                <span>Preview Unavailable</span>
                            </div>
                        )}
                    </div>
                </div>

              </div>
            </div>
          ))}
          
          <div className="h-12 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
             End of recommendations
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
