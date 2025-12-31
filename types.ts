export enum AppView {
  HOME = 'HOME',
  CITY_SELECT = 'CITY_SELECT',
  ONBOARDING = 'ONBOARDING',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS'
}

export interface UserLocation {
  lat: number;
  lng: number;
  label?: string; // e.g., "Indiranagar, Bangalore"
}

export interface LocalDNA {
  budget: '₹' | '₹₹' | '₹₹₹';
  crowdPreference: 'Quiet' | 'Moderate' | 'Busy';
  foodPreference: string[];
  lifestyle: 'Student' | 'Working' | 'Family' | 'Explorer';
  timePreference: 'Morning' | 'Evening' | 'Late Night';
}

export interface PlaceRecommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  localAuthenticityScore: number; // 0 to 100
  touristScore: number; // 0 to 100
  bestTime: string;
  aiReasoning: string; // The "Explainable AI" part
  crowdBadge: 'Hidden Gem' | 'Local Favorite' | 'Buzzing';
  coordinates: {
    lat: number;
    lng: number;
  };
  tags: string[];
  distance?: number; // Distance in km from user
  
  // Real Google Maps Data
  googlePlaceId?: string;
  rating?: number;
  userRatingsTotal?: number;
  address?: string;
  photoUrl?: string; // Resolved URL from Google Photos API
  isOpen?: boolean;
}

export interface City {
  name: string;
  country: string;
  image: string;
}
