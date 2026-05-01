// ─── USER ────────────────────────────────────────────────────────────────────
export type UserRole = 'buyer' | 'seller' | 'both';

export interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  role: UserRole;
  location?: string;
  phone?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  // seller extras
  businessName?: string;
  businessCategory?: ProductCategory;
  totalSales?: number;
  // buyer extras
  totalOrders?: number;
  wishlist?: string[]; // product ids
}

// ─── PRODUCT / LISTING ───────────────────────────────────────────────────────
export type ProductCategory =
  | 'food'        // Food & Catering
  | 'hospitality' // Hotels, Rooms, Apartments
  | 'minerals'    // Gold, Coltan, Oil, etc.
  | 'automobile'  // Cars, Trucks, Bikes
  | 'realestate'  // Buy/Sell/Rent Property
  | 'services'    // Cleaning, Delivery, etc.
  | 'talent'      // Skills, Hiring, Creative
  | 'other';

export type ListingType = 'sale' | 'rent' | 'auction' | 'service';
export type ListingStatus = 'active' | 'sold' | 'pending' | 'archived';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  title: string;
  description: string;
  category: ProductCategory;
  listingType: ListingType;
  status: ListingStatus;
  price: number;
  currency: string; // 'RWF' | 'USD' | 'EUR' | ...
  negotiable: boolean;
  images: string[];
  location: string;
  country: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  // category-specific extras (stored as flexible map)
  details?: Record<string, string | number | boolean>;
}

// ─── POST (Social Feed) ──────────────────────────────────────────────────────
export type PostType = 'text' | 'image' | 'video' | 'product_share';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorRole: UserRole;
  type: PostType;
  content: string;
  mediaUrls?: string[];
  productId?: string; // if sharing a product
  likes: number;
  comments: number;
  shares: number;
  likedBy?: string[]; // user ids
  createdAt: string;
}

// ─── ORDER ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── MESSAGE / CHAT ──────────────────────────────────────────────────────────
export interface ChatRoom {
  id: string;
  participants: string[]; // user ids
  participantNames: Record<string, string>;
  participantPhotos?: Record<string, string>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: Record<string, number>;
  productId?: string; // if chat is about a product
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  mediaUrl?: string;
  read: boolean;
  createdAt: string;
}

// ─── REVIEW ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  targetId: string; // seller or product id
  targetType: 'seller' | 'product';
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

// ─── SITE SETTINGS ───────────────────────────────────────────────────────────
export interface SiteSettings {
  appName: string;
  tagline: string;
  heroImage?: string;
  supportedCurrencies: string[];
  featuredCategories: ProductCategory[];
  maintenanceMode: boolean;
}

// ─── CATEGORY META ───────────────────────────────────────────────────────────
export const CATEGORY_META: Record<ProductCategory, { label: string; emoji: string; color: string }> = {
  food:        { label: 'Food & Catering',  emoji: '🍗', color: '#FF6B35' },
  hospitality: { label: 'Hotels & Stays',   emoji: '🏨', color: '#4ECDC4' },
  minerals:    { label: 'Minerals & Oil',   emoji: '⛏️', color: '#FFD700' },
  automobile:  { label: 'Automobiles',      emoji: '🚗', color: '#2E86AB' },
  realestate:  { label: 'Real Estate',      emoji: '🏡', color: '#A8DADC' },
  services:    { label: 'Services',         emoji: '🧹', color: '#C77DFF' },
  talent:      { label: 'Talent & Career',  emoji: '🎯', color: '#06D6A0' },
  other:       { label: 'Other',            emoji: '📦', color: '#ADB5BD' },
};