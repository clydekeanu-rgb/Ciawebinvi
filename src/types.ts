export interface PartyDetails {
  celebrantName: string;
  celebrantAge: number;
  celebrantBirthdayQuote: string;
  eventTitle: string;
  subtitle: string;
  dateIso: string; // e.g. "2026-09-19T14:00:00"
  dateDisplay: string; // e.g. "Saturday, September 19, 2026"
  timeDisplay: string; // e.g. "2:00 PM – 5:30 PM"
  venueName: string;
  venueAddress: string;
  venueCityState: string;
  venueNotes: string;
  parkingInfo: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  heroImageUrl: string;
  heroCutoutImageUrl?: string;
  avatarPlaceholderType: 'cute-kid' | 'gabby-fan' | 'photo-upload';
  rsvpDeadline: string;
  dressCode: string;
  themeNotes: string;
  contactName: string;
  contactPhone: string;
  childSizes: {
    clothing: string;
    shoes: string;
    favoriteColors: string[];
    favoriteCharacters: string[];
  };
}

export interface GiftItem {
  id: string;
  title: string;
  category: 'dollhouse' | 'crafts' | 'dressup' | 'books-stem' | 'favorites';
  description: string;
  priceRange: string;
  imageUrl: string;
  suggestedStore: string;
  searchUrl: string;
  isClaimed: boolean;
  claimedByName?: string;
  claimedAt?: string;
  isTopPick?: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  color: string;
}

export interface RsvpSubmission {
  id: string;
  guestName: string;
  emailOrPhone: string;
  attending: 'yes' | 'no';
  adultsCount: number;
  kidsCount: number;
  kidsNames?: string;
  dietaryRestrictions: string;
  birthdayWish: string;
  submittedAt: string;
}

export interface BirthdayWish {
  id: string;
  sender: string;
  message: string;
  sticker: string;
  timestamp: string;
  likes: number;
}

export interface GuestPhoto {
  id: string;
  uploaderName: string;
  caption?: string;
  imageUrl: string;
  createdAt: string;
  likes: number;
}

