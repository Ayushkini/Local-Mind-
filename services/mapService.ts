import { PlaceRecommendation } from "../types";

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
    gm_authFailure?: () => void;
  }
}

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Singleton to load the Google Maps Script securely
export const loadGoogleMapsApi = (): Promise<void> => {
  if (isLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // Robustly access and validate the key, removing potential quotes from .env
    const rawKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    const apiKey = rawKey ? rawKey.replace(/['"]/g, '').trim() : '';

    // Check for empty or explicitly "undefined" string
    if (!apiKey || apiKey === 'undefined') {
      console.warn("Google Maps API Key is missing or invalid.");
      reject(new Error("API_KEY not found"));
      return;
    }

    if (window.google && window.google.maps) {
        isLoaded = true;
        resolve();
        return;
    }

    // Handle global auth failure from Google Maps (e.g. invalid key or billing)
    window.gm_authFailure = () => {
        console.error("Google Maps Authentication Failed. Please check your API key constraints and billing.");
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      isLoaded = true;
      resolve();
    };
    script.onerror = (err) => {
        console.error("Failed to load Google Maps script", err);
        reject(err);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

// Search for a place and return the Google Maps details (geometry, photos, etc.)
export const fetchPlaceDetails = async (
  recommendation: PlaceRecommendation, 
  cityContext: string
): Promise<Partial<PlaceRecommendation>> => {
  try {
    await loadGoogleMapsApi();

    // Double check if maps loaded correctly
    if (!window.google || !window.google.maps || !window.google.maps.places) {
        return {};
    }

    return new Promise((resolve) => {
      const mapDiv = document.createElement('div'); // Ghost element for service
      const service = new window.google.maps.places.PlacesService(mapDiv);
      
      const request = {
        query: `${recommendation.name} in ${cityContext}`,
        fields: ['place_id', 'name', 'geometry', 'photos', 'rating', 'user_ratings_total', 'formatted_address', 'opening_hours']
      };

      service.findPlaceFromQuery(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const place = results[0];
          
          // Resolve Photo URL if available
          let photoUrl = null;
          if (place.photos && place.photos.length > 0) {
              try {
                photoUrl = place.photos[0].getUrl({ maxWidth: 800 });
              } catch (e) {
                console.warn("Failed to get photo URL", e);
              }
          }

          resolve({
            googlePlaceId: place.place_id,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            address: place.formatted_address,
            photoUrl: photoUrl || undefined,
            isOpen: place.opening_hours?.isOpen ? place.opening_hours.isOpen() : undefined
          });
        } else {
          // Fallback: Return empty to keep original Gemini data
          console.warn(`Google Maps could not find: ${recommendation.name}`);
          resolve({}); 
        }
      });
    });
  } catch (error) {
    // If Maps API fails to load (e.g. invalid key), catch error and return empty object
    // This allows the app to continue functioning with Gemini data only
    console.warn("Maps API not available, skipping place hydration.", error);
    return {};
  }
};
