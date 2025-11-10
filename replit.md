# BuyGo - Algerian Classifieds Marketplace

## Overview
BuyGo is a classifieds marketplace for Algeria, built with React Native (Expo) and Supabase. It enables users to buy, sell, and rent items across various categories, featuring specialized "PRO Stores" for professional sellers. The platform aims to be the leading destination for classifieds in Algeria, offering a comprehensive and user-friendly experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React Native (Expo), TypeScript, Expo Router, NativeWind.
- **Key Design Patterns**: Context-based state management (Auth, Language, Search), multi-language support (French, Arabic, English with RTL), responsive design, tab-based navigation, intelligent category auto-detection.
- **Core Features**: User authentication, multi-category listings, advanced search with geolocation, smart global search synchronization, automatic category detection, real-time messaging with a right-side chat drawer, PRO subscription system, admin dashboard, shopping cart.
- **UI/UX Decisions**: Resizable and collapsible filter sidebar with persistence, responsive filter layouts adapting to sidebar width, engaging multilingual placeholders, streamlined publish forms with smart offer type selection, edge-to-edge image display on listing cards, quick action buttons on listing cards for instant seller contact, intuitive color-coded navigation, and clear listing card badges.

### Backend
- **Database**: Supabase (PostgreSQL).
- **Core Tables**: `profiles`, `categories`, `sub_categories`, `listings`, `pro_packages`, `pro_subscriptions`, `pro_stores`, `pro_transactions`, `brands`, `communes`, `vehicle_reservations`, `purchase_requests`, `free_item_requests`, `exchange_requests`.
- **Security Model**: Row Level Security (RLS), `SECURITY DEFINER` functions, role-based access control, API key authentication.
- **Key Stored Functions**: `search_listings()`, `calculate_distance_km()`, `activate_pro_subscription()`, `check_pro_status()`, `assign_admin_role()`, `check_vehicle_availability()`.
- **Data Architecture Decisions**: Separated categories and subcategories, migrated critical searchable fields from JSONB to dedicated columns, implemented GIN indexes, automatic triggers for timestamps and analytics, offer-type-specific request tables with RLS policies.

### Feature Specifications
- **Smart Category Detection via Keywords**: Intelligent keyword-based category detection with multilingual support (FR/EN/AR), 300ms debounce, comprehensive keyword dictionary, visual highlighting in sidebar, and a scoring algorithm.
- **Global Search Synchronization**: A single search bar in the TopBar controls app-wide search state, persisting queries across navigation and synchronizing bidirectionally with the URL.
- **Rental Listings**: Category-aware filter rendering to correctly display rental listings.
- **PRO Stores**: Professional seller storefronts with tiered subscription packages.
- **Admin System**: Multi-tier admin system (user, admin, super_admin) for moderation.
- **Multi-Channel Contact System**: Offers WhatsApp, Messenger, and phone contact options, with smart rendering based on seller data and multilingual support.
- **Chat Drawer**: A right-side chat drawer for seamless messaging, featuring real-time updates, unread counter management, and responsive design for web and mobile.
- **Listing Card Quick Actions**: Circular phone and message buttons on listing cards enable direct contact with sellers from search results.
- **Category Harmonization**: Synchronization of category-specific fields between publish forms and search filters, as demonstrated with the 'Animals' category.
- **Category Consolidation**: Merging of redundant categories (e.g., 'Loisirs & Divertissement' into 'Loisirs & Hobbies') for improved data consistency and user experience.
- **Multi-Type Offer Forms**: Specialized request forms for different offer types:
  - **RentalBookingModal**: For rental listings with date selection, location, and total calculation
  - **PurchaseRequestModal**: For sale listings with quantity, delivery address, and payment method selection (CCP, BaridiMob, bank transfer, cash on delivery)
  - **FreeItemRequestModal**: For free items with pickup date and location
  - **ExchangeRequestModal**: For exchange offers with item description, estimated value, and meeting preferences
  - **Intelligent Routing**: Automatic selection of the appropriate form based on `offer_type` (free, exchange, rent) with fallback to `listing_type` (sale, rent, service, purchase)
- **Offer Type Badge System**: Centralized badge rendering via `lib/offerTypeUtils.ts` with multilingual support (FR/EN/AR), emoji indicators, and color coding for consistent display across listing cards and detail pages.

## External Dependencies

- **Supabase**: Backend-as-a-Service (PostgreSQL, authentication, storage, real-time).
- **Google Maps API**: For location-based features.
- **Expo Push Notifications**: For mobile push notifications.
- **React Native Maps**: Native map components for mobile.
- **Payment Methods**: CCP (Compte Chèque Postal), BaridiMob, Bank transfers.
- **Deployment Platforms**: Netlify (Web), Expo Application Services (EAS) for native builds.