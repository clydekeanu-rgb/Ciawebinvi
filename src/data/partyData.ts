import { PartyDetails, GiftItem, TimelineEvent, BirthdayWish, MusicTrack } from '../types';

export const initialPartyDetails: PartyDetails = {
  celebrantName: 'Celestine',
  celebrantAge: 3,
  celebrantBirthdayQuote: '“Splash into the sunshine! Grab your swimsuit and let\'s celebrate by the pool!” 🏊‍♀️✨',
  eventTitle: "Celestine's 3rd Birthday Pool Party!",
  subtitle: "Casa de Clara Splash & Gabby's Dollhouse Pool Party",
  dateIso: '2026-10-03T14:00:00',
  dateDisplay: 'Saturday, October 3, 2026',
  timeDisplay: '2:00 PM – 6:00 PM',
  venueName: 'Casa de Clara',
  venueAddress: 'Saint Claire, Tañong, Marikina',
  venueCityState: 'Inside Provident Village, Marikina City',
  venueNotes: 'Inside Provident Village. Pool party celebration with swimming! Please bring your swimsuits, towels, and extra change of clothes.',
  parkingInfo: 'Street and designated guest parking inside Provident Village near Casa de Clara.',
  googleMapsUrl: 'https://maps.google.com/?q=Casa+de+Clara,+Saint+Claire,+Tañong,+Marikina',
  appleMapsUrl: 'https://maps.apple.com/?q=Casa+de+Clara,+Saint+Claire,+Tañong,+Marikina',
  heroImageUrl: '/celestine_bg.jpg',
  heroCutoutImageUrl: '/celestine_cutout.png',
  avatarPlaceholderType: 'cute-kid',
  rsvpDeadline: 'September 26, 2026',
  dressCode: 'Swimsuits / Pool Attire & Change of Clothes! 🩱🏊‍♂️',
  themeNotes: 'Pool Party, Gabby\'s Dollhouse fun, poolside cupcakes, and splash games!',
  contactName: 'Celestine\'s Family',
  contactPhone: '(0917) 123-4567',
  childSizes: {
    clothing: 'Size 3T / 3-4 (Toddler)',
    shoes: 'Size 7-8 Toddler',
    favoriteColors: ['Glitter Pink', 'Mercat Aqua Teal', 'Sunny Yellow', 'Ocean Blue'],
    favoriteCharacters: ['Gabby', 'Pandy Paws', 'Mercat', 'Cakey Cat', 'Judy Hopps']
  }
};

export const initialGiftRegistry: GiftItem[] = [
  {
    id: 'gift-1',
    title: "Gabby's Purrfect Dollhouse Playset with Delivery Tower",
    category: 'dollhouse',
    description: 'The iconic 2-foot tall dollhouse with Cat-A-Vator elevator, dollhouse deliveries, and sound buttons.',
    priceRange: '$55 - $75',
    imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Amazon / Target',
    searchUrl: 'https://www.google.com/search?q=Gabby%27s+Purrfect+Dollhouse+Playset',
    isClaimed: false,
    isTopPick: true
  },
  {
    id: 'gift-2',
    title: 'Pandy Paws & Mercat Talking Plushies Bundle',
    category: 'dollhouse',
    description: 'Soft cuddly musical plush friends with glowing lights and signature catchphrases.',
    priceRange: '$20 - $30',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Target / Walmart',
    searchUrl: 'https://www.google.com/search?q=Gabby%27s+Dollhouse+Pandy+Paws+talking+plush',
    isClaimed: true,
    claimedByName: 'Auntie Chloe & Uncle Ben',
    claimedAt: '2 days ago',
    isTopPick: true
  },
  {
    id: 'gift-3',
    title: 'Cakey Cat Magical Cupcake Baking & Clay Decorating Kit',
    category: 'crafts',
    description: 'Fun play-dough or baking set with sprinkle cutters, icing squishers, and sparkle molds.',
    priceRange: '$18 - $25',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Amazon / Barnes & Noble',
    searchUrl: 'https://www.google.com/search?q=Cakey+Cat+cupcake+decorating+kit',
    isClaimed: false,
    isTopPick: false
  },
  {
    id: 'gift-4',
    title: "Gabby's Magical Musical Cat Ears Headband & Microphone",
    category: 'dressup',
    description: 'Interactive light-up cat ears that react to singing and play the "Hey Gabby" theme songs!',
    priceRange: '$15 - $22',
    imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Target / Amazon',
    searchUrl: 'https://www.google.com/search?q=Gabby+magical+musical+cat+ears+headband',
    isClaimed: false,
    isTopPick: true
  },
  {
    id: 'gift-5',
    title: 'Mercat Spa Bath Sparkle Science & Bath Bomb Kit',
    category: 'books-stem',
    description: 'Make fizzing kid-safe bath potions, sparkle soap, and ocean bath bombs.',
    priceRange: '$20 - $28',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Amazon',
    searchUrl: 'https://www.google.com/search?q=Mercat+spa+bath+science+kit',
    isClaimed: false,
    isTopPick: false
  },
  {
    id: 'gift-6',
    title: 'Zootopia 2 Adventure Storybook & Judy Hopps Scooter Set',
    category: 'books-stem',
    description: 'Illustrated adventure storybook with Judy & Nick figure playset.',
    priceRange: '$15 - $24',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Barnes & Noble / Amazon',
    searchUrl: 'https://www.google.com/search?q=Zootopia+storybook+and+figure+playset',
    isClaimed: false,
    isTopPick: false
  },
  {
    id: 'gift-7',
    title: 'Glitter Pink Roller Skates with Light-Up Wheels (Size 11)',
    category: 'favorites',
    description: 'Adjustable 4-wheel indoor/outdoor skates with light-up pastel LED wheels and knee pad set.',
    priceRange: '$35 - $45',
    imageUrl: 'https://images.unsplash.com/photo-1564594736624-def7a10ab047?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Amazon',
    searchUrl: 'https://www.google.com/search?q=girls+glitter+pink+roller+skates+size+11',
    isClaimed: false,
    isTopPick: true
  },
  {
    id: 'gift-8',
    title: 'Instant Print Kids Camera with Pastel Deco Stickers',
    category: 'crafts',
    description: 'Safe thermal paper instant camera so Celestine and friends can print cute photos on the spot.',
    priceRange: '$30 - $40',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
    suggestedStore: 'Amazon',
    searchUrl: 'https://www.google.com/search?q=instant+print+kids+camera+pink',
    isClaimed: false,
    isTopPick: false
  }
];

export const partyTimeline: TimelineEvent[] = [
  {
    id: 't-1',
    time: '2:00 PM',
    title: 'Poolside Arrival & Welcome Station',
    description: 'Arrive at Casa de Clara, grab your party wristband, get changed into your swimsuits, and receive custom cat ears & pool gear!',
    iconName: 'Sparkles',
    badge: 'Welcome & Check-in',
    color: 'from-pink-400 to-rose-400'
  },
  {
    id: 't-2',
    time: '2:45 PM',
    title: 'Pool Splash Games & Mercat Bubble Fun',
    description: 'Jump in the pool! Enjoy pool floats, water balloon relays, giant bubble wand popping, and pool games for all ages.',
    iconName: 'Wand2',
    badge: 'Pool Splash & Games',
    color: 'from-cyan-400 to-teal-400'
  },
  {
    id: 't-3',
    time: '4:00 PM',
    title: 'Birthday Cake Cutting & Poolside Buffet',
    description: 'Gather by the pool to sing Happy 3rd Birthday to Celestine, blow the candles, and enjoy delicious food, Cakey cupcakes, and treats!',
    iconName: 'Cake',
    badge: 'Birthday Cake & Food',
    color: 'from-amber-400 to-yellow-400'
  },
  {
    id: 't-4',
    time: '4:45 PM',
    title: 'Free Swim & Zootopia Dance Splash!',
    description: 'Afternoon swimming time with poolside music, fun dance jams, and water games!',
    iconName: 'Music',
    badge: 'Pool Party Jams',
    color: 'from-purple-400 to-indigo-400'
  },
  {
    id: 't-5',
    time: '5:30 PM',
    title: 'Piñata Splash & Party Favor Giveaways',
    description: 'Hit the birthday piñata, dry off, and take home your special pool party thank-you goodie bags before 6:00 PM.',
    iconName: 'Gift',
    badge: 'Grand Finale',
    color: 'from-fuchsia-400 to-pink-500'
  }
];

export const initialBirthdayWishes: BirthdayWish[] = [
  {
    id: 'w-1',
    sender: 'Grandma & Grandpa Rosa',
    message: 'Happy 3rd Birthday to our sweet little sunshine princess Celestine! We can\'t wait to splash and celebrate with you!',
    sticker: '👑',
    timestamp: 'Yesterday',
    likes: 4
  },
  {
    id: 'w-2',
    sender: 'Emma & Family',
    message: 'Happy 3rd birthday Celestine! Bringing our cute swimsuits & cat ears! Can\'t wait to eat Cakey cupcakes together! 💖',
    sticker: '🐱',
    timestamp: 'Today at 10:15 AM',
    likes: 6
  },
  {
    id: 'w-3',
    sender: 'Tito Dan & Tita Bea',
    message: 'Have an A-meow-zing 3rd birthday pool party, Celestine! Keep shining bright and splashing around!',
    sticker: '✨',
    timestamp: '3 hours ago',
    likes: 2
  }
];

export const availableMusicTracks: MusicTrack[] = [
  {
    id: 'zootopia-try-everything',
    title: 'Try Everything',
    artist: 'Shakira',
    movieOrShow: 'Zootopia Soundtrack',
    tempo: 120,
    color: 'bg-gradient-to-r from-amber-400 to-pink-500'
  },
  {
    id: 'gabby-sprinkle-party',
    title: 'Sprinkle Party & Hey Gabby!',
    artist: 'Gabby & Pandy Paws',
    movieOrShow: "Gabby's Dollhouse",
    tempo: 118,
    color: 'bg-gradient-to-r from-pink-400 to-purple-500'
  }
];
