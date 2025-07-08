export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePerSqft?: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land';
  listingType: 'sale' | 'rent';
  videoUrl: string;
  thumbnailUrl: string;
  images: string[];
  agent: {
    id: string;
    name: string;
    photo: string;
    phone: string;
    email: string;
    company: string;
  };
  amenities: string[];
  yearBuilt?: number;
  lotSize?: number;
  parking?: number;
  features: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface PropertyFilter {
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: Property['propertyType'];
  listingType?: Property['listingType'];
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}