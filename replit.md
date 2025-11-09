# BuyGo - Algerian Classifieds Marketplace

## Overview
BuyGo is a classifieds marketplace for Algeria, built with React Native (Expo) and Supabase. It allows users to buy, sell, and rent items across various categories, featuring specialized "PRO Stores" for professional sellers. The platform aims to be the go-to destination for classifieds in Algeria.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React Native (Expo), TypeScript, Expo Router, NativeWind.
- **Key Design Patterns**: Context-based state management (Auth, Language, Search), multi-language support (French, Arabic, English with RTL), responsive design, tab-based navigation, intelligent category auto-detection.
- **Core Features**: User authentication, multi-category listings, advanced search with geolocation, smart global search synchronization, automatic category detection, real-time messaging, PRO subscription system, admin dashboard, shopping cart.

### Backend
- **Database**: Supabase (PostgreSQL).
- **Core Tables**: `profiles`, `categories`, `sub_categories`, `listings`, `pro_packages`, `pro_subscriptions`, `pro_stores`, `pro_transactions`, `brands`, `communes`.
- **Security Model**: Row Level Security (RLS), `SECURITY DEFINER` functions, role-based access control, API key authentication.
- **Key Stored Functions**: `search_listings()`, `calculate_distance_km()`, `activate_pro_subscription()`, `check_pro_status()`, `assign_admin_role()`.
- **Data Architecture Decisions**: Separated categories and subcategories, migrated critical searchable fields from JSONB to dedicated columns, implemented GIN indexes, automatic triggers for timestamps and analytics.

### UI/UX Decisions
- Streamlined publish form, smart category detection with visual feedback, global search synchronization via TopBar, adaptive TopBar layout based on page context (e.g., search bar appears only on search page), color-coded navigation buttons for intuitive action types.
- Listing card badges updated for clarity (e.g., "RECHERCHÉ" to "DEMANDE").

### Feature Specifications
- **Smart Category Detection**: Multilingual keyword dictionary for 9 major categories, auto-selects and highlights categories based on search input.
- **Global Search Synchronization**: Single search bar in TopBar controls app-wide search state, query persists across navigation, synchronizes bidirectionally with URL.
- **Rental Listings**: Category-aware filter rendering to correctly display rental listings.
- **PRO Stores**: Professional seller storefronts with tiered subscription packages.
- **Admin System**: Multi-tier admin system (user, admin, super_admin) for moderation.

## External Dependencies

- **Supabase**: Backend-as-a-Service (PostgreSQL, authentication, storage, real-time).
- **Google Maps API**: For location-based features.
- **Expo Push Notifications**: For mobile push notifications.
- **React Native Maps**: Native map components for mobile.
- **Payment Methods**: CCP (Compte Chèque Postal), BaridiMob, Bank transfers.
- **Deployment Platforms**: Netlify (Web), Expo Application Services (EAS) for native builds.
- **Development Tools**: EAS CLI, Supabase CLI, Expo CLI.