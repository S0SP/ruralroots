import { Place } from '../types/places';

// Mock data for testing
const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'AgroTech Solutions',
    type: 'shop',
    address: '123 Farm Road, Delhi',
    rating: 4.5,
    location: { lat: 28.7041, lng: 77.1025 },
    phone: '+91 98765 43210',
    website: 'https://agrotech.com',
    openingHours: '9:00 AM - 8:00 PM',
    products: ['Seeds', 'Fertilizers', 'Pesticides', 'Tools'],
    distance: 0.5
  },
  {
    id: '2',
    name: 'Farm Training Institute',
    type: 'training',
    address: '456 Agriculture Street, Delhi',
    rating: 4.8,
    location: { lat: 28.6139, lng: 77.2090 },
    phone: '+91 98765 43211',
    website: 'https://farmtraining.com',
    openingHours: '9:00 AM - 6:00 PM',
    courses: ['Organic Farming', 'Pest Management', 'Soil Health'],
    distance: 0.8
  },
  {
    id: '3',
    name: 'Green Earth Store',
    type: 'shop',
    address: '789 Garden Lane, Delhi',
    rating: 4.2,
    location: { lat: 28.5679, lng: 77.1234 },
    phone: '+91 98765 43212',
    website: 'https://greenearth.com',
    openingHours: '8:00 AM - 7:00 PM',
    products: ['Organic Seeds', 'Natural Fertilizers', 'Garden Tools'],
    distance: 1.2
  }
];

export const getNearbyPlaces = async (userLocation: { lat: number; lng: number }): Promise<Place[]> => {
  try {
    // For now, return mock data based on user's location
    // In a real implementation, this would use the Overpass API with the user's coordinates
    const mockPlaces: Place[] = [
      {
        id: '1',
        name: 'Green Valley Agricultural Store',
        type: 'shop',
        location: {
          lat: userLocation.lat + 0.001,
          lng: userLocation.lng + 0.001
        },
        address: '123 Farm Road, Agricultural District',
        rating: 4.5,
        phone: '+91 98765 43210',
        website: 'https://greenvalleyagro.com',
        openingHours: '8:00 AM - 8:00 PM',
        products: [
          'Seeds',
          'Fertilizers',
          'Pesticides',
          'Farming Tools'
        ],
        distance: 0.5
      },
      {
        id: '2',
        name: 'FarmTech Training Center',
        type: 'training',
        location: {
          lat: userLocation.lat - 0.001,
          lng: userLocation.lng - 0.001
        },
        address: '456 Training Street, Education Zone',
        rating: 4.8,
        phone: '+91 98765 43211',
        website: 'https://farmtech.edu',
        openingHours: '9:00 AM - 6:00 PM',
        courses: [
          'Organic Farming',
          'Pest Management',
          'Soil Health',
          'Crop Rotation'
        ],
        distance: 0.8
      },
      {
        id: '3',
        name: 'Agro Solutions Shop',
        type: 'shop',
        location: {
          lat: userLocation.lat + 0.002,
          lng: userLocation.lng - 0.002
        },
        address: '789 Market Road, Commercial Area',
        rating: 4.2,
        phone: '+91 98765 43212',
        website: 'https://agrosolutions.com',
        openingHours: '7:00 AM - 9:00 PM',
        products: [
          'Organic Fertilizers',
          'Natural Pesticides',
          'Irrigation Systems',
          'Greenhouse Equipment'
        ],
        distance: 1.2
      },
      {
        id: '4',
        name: 'Sustainable Farming Institute',
        type: 'training',
        location: {
          lat: userLocation.lat - 0.002,
          lng: userLocation.lng + 0.002
        },
        address: '321 Learning Lane, Education Hub',
        rating: 4.7,
        phone: '+91 98765 43213',
        website: 'https://sustainablefarming.edu',
        openingHours: '8:30 AM - 5:30 PM',
        courses: [
          'Sustainable Agriculture',
          'Water Management',
          'Climate Smart Farming',
          'Market Access'
        ],
        distance: 1.5
      }
    ];

    // Sort places by distance
    return mockPlaces.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw new Error('Failed to fetch nearby places');
  }
}; 