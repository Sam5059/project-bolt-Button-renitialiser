/**
 * Centralized mapping between UI listing types (French/localized) and database canonical values
 * This ensures consistency across the application for listing type filtering and display
 */

// Database canonical values (what's stored in Supabase)
export type DBListingType = 'sale' | 'purchase' | 'rent' | 'service' | 'job';

// UI/Frontend values (user-facing, localized)
export type UIListingType = 'offre' | 'je_cherche' | 'rent' | 'service' | 'job';

/**
 * Convert UI listing type to database canonical value
 * Used when sending data to backend (RPC calls, form submissions)
 */
export function uiToDbListingType(uiType: UIListingType | string): DBListingType {
  const mapping: Record<string, DBListingType> = {
    // French UI terms
    'offre': 'sale',
    'je_cherche': 'purchase',
    
    // English canonical (passthrough)
    'sale': 'sale',
    'purchase': 'purchase',
    'rent': 'rent',
    'service': 'service',
    'job': 'job',
    
    // Legacy/alternative terms
    'sell': 'sale',
    'buy': 'purchase',
    'offer': 'sale',
    'request': 'purchase',
  };

  return mapping[uiType] || 'sale'; // Default to 'sale' if unknown
}

/**
 * Convert database listing type to UI value
 * Used when displaying data from backend
 */
export function dbToUiListingType(dbType: DBListingType | string): UIListingType {
  const mapping: Record<string, UIListingType> = {
    'sale': 'offre',
    'purchase': 'je_cherche',
    'rent': 'rent',
    'service': 'service',
    'job': 'job',
    
    // Legacy support
    'sell': 'offre',
    'buy': 'je_cherche',
    'offer': 'offre',
  };

  return mapping[dbType] || 'offre'; // Default to 'offre' if unknown
}

/**
 * Validate if a string is a valid UI listing type
 */
export function isValidUIListingType(type: string): type is UIListingType {
  return ['offre', 'je_cherche', 'rent', 'service', 'job'].includes(type);
}

/**
 * Validate if a string is a valid DB listing type
 */
export function isValidDBListingType(type: string): type is DBListingType {
  return ['sale', 'purchase', 'rent', 'service', 'job'].includes(type);
}

/**
 * Get display label for listing type in specified language
 */
export function getListingTypeLabel(type: UIListingType, language: 'fr' | 'ar' | 'en' = 'fr'): string {
  const labels: Record<UIListingType, Record<string, string>> = {
    'offre': {
      fr: 'Offres',
      en: 'Offers',
      ar: 'عروض'
    },
    'je_cherche': {
      fr: 'Demandes',
      en: 'Requests',
      ar: 'طلبات'
    },
    'rent': {
      fr: 'Location',
      en: 'Rent',
      ar: 'إيجار'
    },
    'service': {
      fr: 'Services',
      en: 'Services',
      ar: 'خدمات'
    },
    'job': {
      fr: 'Emploi',
      en: 'Jobs',
      ar: 'وظائف'
    }
  };

  return labels[type]?.[language] || labels[type]?.fr || type;
}
