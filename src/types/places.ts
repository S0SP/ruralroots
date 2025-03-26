export interface Place {
  id: string;
  name: string;
  type: 'shop' | 'training';
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  phone: string;
  website?: string;
  openingHours: string;
  products?: string[];
  courses?: string[];
  distance: number;
} 