# BuyGo - Algerian Classifieds Marketplace

## Overview

BuyGo is a comprehensive classifieds marketplace platform for Algeria, built with React Native (Expo) for mobile/web and Supabase for backend services. The platform enables users to buy, sell, and rent items across multiple categories, with specialized features for professional sellers including premium "PRO Stores" functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React Native with Expo for cross-platform development (iOS, Android, Web)
- TypeScript for type safety
- Expo Router for file-based navigation
- NativeWind for Tailwind-style styling
- Platform-specific components (`.web.tsx` for web, `.tsx` for native)

**Key Design Patterns:**
- Context-based state management for authentication (`AuthContext`) and internationalization (`LanguageContext`)
- Multi-language support (French, Arabic, English) with RTL support
- Responsive design with platform-specific adaptations
- Tab-based navigation with nested routes

**Core Features:**
- User authentication and role management (user, admin, super_admin)
- Multi-category listings with hierarchical categories and subcategories
- Advanced search and filtering with geolocation-based distance calculation
- Real-time messaging and notifications
- Pro subscription system with tiered packages
- Admin dashboard for user and content moderation
- Shopping cart functionality

### Backend Architecture

**Database: Supabase (PostgreSQL)**

**Core Tables:**
- `profiles` - Extended user profiles with role management and PRO status
- `categories` - Parent categories only (children moved to `sub_categories`)
- `sub_categories` - Hierarchical subcategories with multilingual support
- `listings` - Product/service listings with JSONB attributes
- `pro_packages` - Tiered subscription packages per category
- `pro_subscriptions` - Active and historical PRO subscriptions
- `pro_stores` - Professional seller storefronts
- `pro_transactions` - Payment transaction history
- `brands` - Multi-category brand database
- `communes` - Algerian communes with GPS coordinates for distance calculation

**Security Model:**
- Row Level Security (RLS) policies on all tables
- SECURITY DEFINER functions for privileged operations
- Role-based access control with admin verification functions
- API key authentication for external integrations

**Key Stored Functions:**
- `search_listings()` - Advanced full-text search with relevance scoring across title, description, brand, and model
- `calculate_distance_km()` - Haversine formula for GPS distance calculation
- `activate_pro_subscription()` - Handles PRO subscription activation and transaction logging
- `check_pro_status()` - Validates active PRO subscriptions and quotas
- `assign_admin_role()` - Secure admin role assignment
- `promote_user_to_admin()` - User promotion workflow with audit logging

**Data Architecture Decisions:**
- Separated categories and subcategories into distinct tables for clearer hierarchy
- Migrated from JSONB `attributes` to dedicated columns for critical searchable fields (e.g., `vehicle_brand`, `vehicle_model`)
- Implemented GIN indexes on full-text search columns and JSONB fields
- Automatic triggers for updating timestamps and analytics

### External Dependencies

**Core Services:**
- **Supabase** - Backend-as-a-Service (PostgreSQL database, authentication, storage, real-time subscriptions)
  - Project URL: `https://jchywwamhmzzvhgbywkj.supabase.co`
  - Uses anonymous key for client-side access and service role key for admin operations

**Third-Party Integrations:**
- **Google Maps API** - Maps SDK for Android/iOS/Web for location-based features
- **Expo Push Notifications** - Mobile push notification delivery
- **React Native Maps** - Native map components (mobile only, web uses alternative)

**Payment Methods (Configured):**
- CCP (Compte Chèque Postal) - Algerian postal payment system
- BaridiMob - Mobile payment gateway
- Bank transfers (IBAN-based)

**Deployment Platforms:**
- Web: Netlify (recommended for production)
- Mobile: Expo Application Services (EAS) for native builds
- Development: Expo Go for rapid testing (limited native module support)

**Development Tools:**
- EAS CLI for building native apps
- Supabase CLI for migration management
- Expo CLI for development server

**Notable Architectural Decisions:**
- Platform-specific rendering for web vs. native (e.g., `ListingsMapView.web.tsx` vs. `ListingsMapView.tsx`)
- Migration from parent_id-based category hierarchy to separate `sub_categories` table
- PRO subscription system tied to specific categories with quota enforcement
- Distance-based search using pre-calculated GPS coordinates for major Algerian communes
- Multi-tier admin system (user → admin → super_admin) for moderation workflows