# BuyGo - Algerian Classifieds Marketplace

## Overview
BuyGo is an Algerian classifieds marketplace platform enabling users to buy, sell, and rent items across various categories. Built with React Native (Expo) for cross-platform access and Supabase for backend services, it features specialized "PRO Stores" for professional sellers. The platform aims to be a comprehensive solution for the Algerian market, focusing on user experience, advanced search capabilities, and robust backend infrastructure.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React Native with Expo, TypeScript, Expo Router, NativeWind.
- **Key Design Patterns**: Context-based state management (Auth, Language, Search), multi-language (French, Arabic, English) with RTL support, responsive design, tab-based navigation, intelligent category auto-detection.
- **Core Features**: User authentication and role management, hierarchical multi-category listings, advanced search with geolocation, smart global search synchronization, real-time messaging, PRO subscription system, admin dashboard, shopping cart.

### Backend
- **Database**: Supabase (PostgreSQL).
- **Core Tables**: `profiles`, `categories`, `sub_categories`, `listings`, `pro_packages`, `pro_subscriptions`, `pro_stores`, `pro_transactions`, `brands`, `communes`.
- **Security Model**: Row Level Security (RLS), `SECURITY DEFINER` functions, role-based access control, API key authentication.
- **Key Stored Functions**: `search_listings()`, `calculate_distance_km()`, `activate_pro_subscription()`, `check_pro_status()`, `assign_admin_role()`, `promote_user_to_admin()`.
- **Data Architecture Decisions**: Separated categories and subcategories, dedicated columns for searchable fields, GIN indexes, automatic triggers for timestamps and analytics.

### UI/UX Decisions
- **Smart Category Detection**: Multilingual keyword dictionary for auto-selecting categories in search, with visual highlighting.
- **Global Search Synchronization**: Single search bar in TopBar controls app search state via `SearchContext`, queries persist across navigation.
- **TopBar Filters Simplification** (November 9, 2025): Removed the FiltersModal component entirely in favor of direct navigation. The search bar remains expanded (45% width on desktop), but the Filters button and badge system have been removed. Category selection now happens exclusively through the sidebar, which redirects to the search-new page.
- **Sidebar Direct Navigation** (November 9, 2025): Modified the sidebar's `handleCategoryToggle` function in `CategoriesAndFilters.tsx` to redirect main categories (Véhicules, Immobilier, Électronique, etc.) directly to `/(tabs)/search-new?category_id=<uuid>` instead of expanding filters inline. This creates a cleaner, more focused user experience.
- **Homepage Simplification**: Removed search bar and location selector from homepage for a cleaner look.
- **Navigation Enhancements**: Renamed and reordered navigation buttons (e.g., "Post a listing", "Buy Pro package", "Offers", "Requests") in TopBar, with color-coding for intuitive user intent.

## External Dependencies
- **Supabase**: Backend-as-a-Service (PostgreSQL, authentication, storage, real-time).
- **Google Maps API**: For location-based features.
- **Expo Push Notifications**: For mobile push delivery.
- **React Native Maps**: Native map components for mobile.
- **Payment Methods**: CCP (Compte Chèque Postal), BaridiMob, Bank transfers.
- **Deployment Platforms**: Netlify (Web), Expo Application Services (EAS) for native builds.