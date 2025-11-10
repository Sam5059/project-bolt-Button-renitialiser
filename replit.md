# BuyGo - Algerian Classifieds Marketplace

## Overview
BuyGo is a classifieds marketplace for Algeria, built with React Native (Expo) and Supabase. It enables users to buy, sell, and rent items across various categories, featuring specialized "PRO Stores" for professional sellers. The platform aims to be the leading destination for classifieds in Algeria, offering a comprehensive and user-friendly experience.

## Recent Changes (November 10, 2025)
- **Help Center Page**: New dedicated help page (/help) with comprehensive FAQ sections (Getting Started, Account, Payments, Safety, Contact) and full multilingual support (FR/EN/AR)
- **TopBar Enhancements**: Language selector now displays abbreviated codes (FR/EN/AR), added badge counters on icons (cart shows real item count, favorites and listings show placeholders), help icon now routes to /help page
- **Badge Component**: New reusable Badge component for displaying notification counters with customizable size and color, auto-hides when count is zero
- **My Listings Page Redesign**: Complete refactor with modern sidebar-based filtering (All, Active, Suspended, Sold) and grid layout similar to search page
- **Category Filter in My Listings**: Added category filtering to MyListingsSidebar with:
  - Categories loaded from Supabase with localized names (FR/EN/AR)
  - Scrollable category list in sidebar with "All Categories" reset option
  - Combined filtering logic (status + category)
  - Full multilingual support with RTL compatibility
- **New MyListingCard Component**: Action buttons integrated directly into cards (Edit, Deactivate/Reactivate, Mark as Sold, Delete)
- **MyListingsSidebar Component**: Filter panel with live counts, category filtering, and multilingual support
- **Improved UX**: Users can manage all their listings in one place with visual status badges, category filtering, and quick actions

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React Native (Expo), TypeScript, Expo Router, NativeWind.
- **Key Design Patterns**: Context-based state management (Auth, Language, Search), multi-language support (French, Arabic, English with RTL), responsive design, tab-based navigation, intelligent category auto-detection.
- **Core Features**: User authentication, multi-category listings, advanced search with geolocation, smart global search synchronization, automatic category detection, real-time messaging with a right-side chat drawer, PRO subscription system, admin dashboard, shopping cart.
- **UI/UX Decisions**: Resizable and collapsible filter sidebar with persistence, responsive filter layouts adapting to sidebar width, engaging multilingual placeholders, streamlined publish forms with smart offer type selection, edge-to-edge image display on listing cards, quick action buttons on listing cards for instant seller contact, intuitive color-coded navigation, and clear listing card badges.
- **Cart System Robustness**: Cart context handles deleted listings gracefully by filtering null listings during refresh and using safe null-checks in total calculations to prevent runtime crashes.

### Backend
- **Database**: Supabase (PostgreSQL).
- **Core Tables**: `profiles`, `categories`, `sub_categories`, `listings`, `pro_packages`, `pro_subscriptions`, `pro_stores`, `pro_transactions`, `brands`, `communes`, `wilayas`, `vehicle_reservations`, `purchase_requests`, `free_item_requests`, `exchange_requests`.
- **Security Model**: Row Level Security (RLS), `SECURITY DEFINER` functions, role-based access control, API key authentication.
- **Key Stored Functions**: `search_listings()`, `calculate_distance_km()`, `activate_pro_subscription()`, `check_pro_status()`, `assign_admin_role()`, `check_vehicle_availability()`.
- **Data Architecture Decisions**: Separated categories and subcategories, migrated critical searchable fields from JSONB to dedicated columns, implemented GIN indexes, automatic triggers for timestamps and analytics, offer-type-specific request tables with RLS policies, wilayas table with all 58 Algerian provinces for location selection.

### Feature Specifications
- **Smart Category Detection via Keywords**: Intelligent keyword-based category detection with multilingual support (FR/EN/AR), 300ms debounce, comprehensive keyword dictionary, visual highlighting in sidebar, and a scoring algorithm.
- **Global Search Synchronization**: A single search bar in the TopBar controls app-wide search state, persisting queries across navigation and synchronizing bidirectionally with the URL.
- **Rental Listings**: Category-aware filter rendering to correctly display rental listings.
- **PRO Stores**: Professional seller storefronts with tiered subscription packages.
- **Admin System**: Multi-tier admin system (user, admin, super_admin) for moderation.
- **Multi-Channel Contact System**: Offers WhatsApp, Messenger, and phone contact options, with smart rendering based on seller data and multilingual support.
- **Chat Drawer**: A right-side chat drawer for seamless messaging, featuring real-time updates, unread counter management, and responsive design for web and mobile.
- **Listing Card Quick Actions**: Circular phone, message, and CTA buttons on listing cards. Uses a ref-based guard system (`skipCardPressRef`) with 100ms timeout to prevent parent TouchableOpacity navigation when action buttons are pressed, enabling direct modal opening (add to cart, rental booking, etc.) without navigating to listing details. The ref provides synchronous reading to avoid race conditions in React Native Web where multiple onPress events can fire.
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