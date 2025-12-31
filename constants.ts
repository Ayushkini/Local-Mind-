import { City, PlaceRecommendation } from './types';

export const POPULAR_CITIES: City[] = [
  { name: "Mumbai", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mumbai_Aug_2018_433977.jpg/800px-Mumbai_Aug_2018_433977.jpg" },
  { name: "Delhi", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg" },
  { name: "Bangalore", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Vidhana_Soudha_Bangalore.jpg/800px-Vidhana_Soudha_Bangalore.jpg" },
  { name: "Hyderabad", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Charminar_Hyderabad_1.jpg/800px-Charminar_Hyderabad_1.jpg" },
  { name: "Chennai", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Chennai_Central_Station.jpg/800px-Chennai_Central_Station.jpg" },
  { name: "Kolkata", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Victoria_Memorial_Hall%2C_Kolkata.jpg/800px-Victoria_Memorial_Hall%2C_Kolkata.jpg" },
  { name: "Pune", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Shaniwarwada_Pune.jpg/800px-Shaniwarwada_Pune.jpg" },
  { name: "Jaipur", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/800px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg" },
  { name: "Ahmedabad", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Sabarmati_Ashram_Ahmedabad.jpg/800px-Sabarmati_Ashram_Ahmedabad.jpg" },
  { name: "Goa", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Goa_Palolem_Beach_2009.jpg/800px-Goa_Palolem_Beach_2009.jpg" },
  { name: "Varanasi", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Varanasi_Ghats.jpg/800px-Varanasi_Ghats.jpg" },
  { name: "Udaipur", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Udaipur.jpg/800px-Palace_of_Udaipur.jpg" },
  { name: "Kochi", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Chinese_Fishing_Nets_Kochi.jpg/800px-Chinese_Fishing_Nets_Kochi.jpg" },
  { name: "Indore", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Rajwada_Indore.jpg/800px-Rajwada_Indore.jpg" },
  { name: "Chandigarh", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Open_Hand_Monument_Chandigarh.jpg/800px-Open_Hand_Monument_Chandigarh.jpg" },
  { name: "Surat", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Sardar_Patel_Museum_Surat.jpg/800px-Sardar_Patel_Museum_Surat.jpg" },
  { name: "Lucknow", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Rumi_Darwaza_Lucknow.jpg/800px-Rumi_Darwaza_Lucknow.jpg" },
  { name: "Nagpur", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Deekshabhoomi_Nagpur.jpg/800px-Deekshabhoomi_Nagpur.jpg" },
  { name: "Bhopal", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sanchi_Stupa_Bhopal.jpg/800px-Sanchi_Stupa_Bhopal.jpg" },
  { name: "Visakhapatnam", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Visakhapatnam_Beach.jpg/800px-Visakhapatnam_Beach.jpg" },
  { name: "Coimbatore", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Adiyogi_Shiva_statue.jpg/800px-Adiyogi_Shiva_statue.jpg" },
  { name: "Amritsar", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Golden_Temple_India.jpg/800px-Golden_Temple_India.jpg" },
  { name: "Jodhpur", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Mehrangarh_Fort_Jodhpur.jpg/800px-Mehrangarh_Fort_Jodhpur.jpg" },
  { name: "Patna", country: "India", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Golghar_Patna.jpg/800px-Golghar_Patna.jpg" }
];

export const MOCK_RECOMMENDATIONS: PlaceRecommendation[] = [
  {
    id: "1",
    name: "Khotachiwadi",
    category: "Heritage Village",
    description: "A frozen-in-time heritage village with Portuguese-style wooden houses, tucked away in the chaotic Girgaon lanes.",
    localAuthenticityScore: 94,
    touristScore: 20,
    bestTime: "Early Morning",
    aiReasoning: "Matches your 'Quiet' preference. This is a residential heritage pocket that tourists often miss while rushing to Marine Drive.",
    crowdBadge: "Hidden Gem",
    coordinates: { lat: 18.9550, lng: 72.8217 },
    tags: ["Heritage", "Walk", "Architecture"]
  },
  {
    id: "2",
    name: "Britannia & Co.",
    category: "Parsi Cafe",
    description: "Legendary Parsi cafe famous for its Berry Pulao. The decor hasn't changed since pre-independence.",
    localAuthenticityScore: 88,
    touristScore: 45,
    bestTime: "Lunch (12 PM)",
    aiReasoning: "A perfect match for 'Authentic' food preference. While known, it retains a strictly local old-world charm distinct from modern cafes.",
    crowdBadge: "Local Favorite",
    coordinates: { lat: 18.9345, lng: 72.8407 },
    tags: ["Food", "History", "Parsi"]
  },
  {
    id: "3",
    name: "Sassoon Docks",
    category: "Fish Market",
    description: "The city's oldest wet dock. Intense, smelly, colorful, and absolutely real.",
    localAuthenticityScore: 98,
    touristScore: 10,
    bestTime: "Sunrise (5 AM)",
    aiReasoning: "For the 'Explorer' lifestyle. It's raw and chaotic, offering a glimpse into the real trade life of Mumbai away from the glitz.",
    crowdBadge: "Buzzing",
    coordinates: { lat: 18.9217, lng: 72.8294 },
    tags: ["Photography", "Culture", "Raw"]
  }
];
