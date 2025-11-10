// Configuration centralisée des filtres par type de catégorie
// Cette configuration définit quels filtres sont applicables et visibles pour chaque type

export type FilterField =
  | 'listingType'
  | 'subcategory'
  | 'brand'
  | 'model'
  | 'price'
  | 'year'
  | 'fuel'
  | 'transmission'
  | 'mileage'
  | 'color'
  | 'propertyType'
  | 'surface'
  | 'rooms'
  | 'bedrooms'
  | 'bathrooms'
  | 'furnished'
  | 'monthlyRent'
  | 'amenities'
  | 'deviceType'
  | 'condition'
  | 'storage'
  | 'contractType'
  | 'salary'
  | 'experience'
  | 'sector'
  | 'location';

export interface CategoryFilterConfig {
  categoryType: string;
  enabled: FilterField[];
  disabled: FilterField[];
  required?: FilterField[];
  description: string;
}

export const CATEGORY_FILTERS_CONFIG: Record<string, CategoryFilterConfig> = {
  vehicle: {
    categoryType: 'vehicle',
    enabled: ['listingType', 'subcategory', 'brand', 'model', 'price', 'year', 'fuel', 'transmission', 'mileage', 'color', 'location'],
    disabled: ['propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector', 'condition'],
    description: 'Véhicules: voitures, motos, camions',
  },
  realestate: {
    categoryType: 'realestate',
    enabled: ['listingType', 'subcategory', 'propertyType', 'price', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'amenities', 'location'],
    disabled: ['brand', 'model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'furnished', 'monthlyRent', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector', 'condition'],
    description: 'Immobilier: vente de biens immobiliers',
  },
  rental: {
    categoryType: 'rental',
    enabled: ['subcategory', 'propertyType', 'monthlyRent', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'amenities', 'location'],
    disabled: ['brand', 'model', 'price', 'year', 'fuel', 'transmission', 'mileage', 'color', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector', 'condition'],
    description: 'Location immobilière',
  },
  electronics: {
    categoryType: 'electronics',
    enabled: ['listingType', 'subcategory', 'brand', 'deviceType', 'price', 'condition', 'storage', 'location'],
    disabled: ['model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'contractType', 'salary', 'experience', 'sector'],
    description: 'Électronique: téléphones, ordinateurs, tablettes',
  },
  employment: {
    categoryType: 'employment',
    enabled: ['subcategory', 'contractType', 'salary', 'experience', 'sector', 'location'],
    disabled: ['brand', 'model', 'price', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'condition'],
    description: 'Emploi: offres et demandes d\'emploi',
  },
  service: {
    categoryType: 'service',
    enabled: ['listingType', 'subcategory', 'price', 'location'],
    disabled: ['brand', 'model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector', 'condition'],
    description: 'Services: prestations de services',
  },
  animals: {
    categoryType: 'animals',
    enabled: ['listingType', 'subcategory', 'price', 'location'],
    disabled: ['brand', 'model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector', 'condition'],
    description: 'Animaux: vente et adoption d\'animaux',
  },
  fashion: {
    categoryType: 'fashion',
    enabled: ['listingType', 'subcategory', 'brand', 'price', 'condition', 'location'],
    disabled: ['model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector'],
    description: 'Mode & Beauté: vêtements, chaussures, accessoires',
  },
  home: {
    categoryType: 'home',
    enabled: ['listingType', 'subcategory', 'price', 'condition', 'location'],
    disabled: ['brand', 'model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector'],
    description: 'Maison & Jardin: meubles, décoration',
  },
  equipment_rental: {
    categoryType: 'equipment_rental',
    enabled: ['subcategory', 'price', 'condition', 'location'],
    disabled: ['brand', 'model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector'],
    description: 'Location d\'équipement',
  },
  sport: {
    categoryType: 'sport',
    enabled: ['listingType', 'subcategory', 'brand', 'price', 'condition', 'location'],
    disabled: ['model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector'],
    description: 'Sport: équipements sportifs, salles de sport, vêtements de sport',
  },
  generic: {
    categoryType: 'generic',
    enabled: ['listingType', 'subcategory', 'price', 'condition', 'location'],
    disabled: ['brand', 'model', 'year', 'fuel', 'transmission', 'mileage', 'color', 'propertyType', 'surface', 'rooms', 'bedrooms', 'bathrooms', 'furnished', 'monthlyRent', 'amenities', 'deviceType', 'storage', 'contractType', 'salary', 'experience', 'sector'],
    description: 'Catégorie générique',
  },
};

/**
 * Vérifie si un champ de filtre est activé pour un type de catégorie donné
 */
export function isFilterEnabled(categoryType: string, field: FilterField): boolean {
  const config = CATEGORY_FILTERS_CONFIG[categoryType] || CATEGORY_FILTERS_CONFIG.generic;
  return config.enabled.includes(field);
}

/**
 * Vérifie si un champ de filtre est désactivé pour un type de catégorie donné
 */
export function isFilterDisabled(categoryType: string, field: FilterField): boolean {
  const config = CATEGORY_FILTERS_CONFIG[categoryType] || CATEGORY_FILTERS_CONFIG.generic;
  return config.disabled.includes(field);
}

/**
 * Récupère la configuration complète pour un type de catégorie
 */
export function getCategoryFilterConfig(categoryType: string): CategoryFilterConfig {
  return CATEGORY_FILTERS_CONFIG[categoryType] || CATEGORY_FILTERS_CONFIG.generic;
}

/**
 * Mapping des slugs de catégories vers les types de filtres
 * Utilisé pour déterminer quels filtres afficher pour chaque catégorie
 */
export const SLUG_TO_CATEGORY_TYPE: Record<string, string> = {
  // Véhicules
  'vehicules': 'vehicle',
  'voitures': 'vehicle',
  'motos': 'vehicle',
  'camions': 'vehicle',
  'auto-moto': 'vehicle',
  'automobile': 'vehicle',
  
  // Immobilier vente
  'immobilier': 'realestate',
  'immobilier-vente': 'realestate',
  'appartements': 'realestate',
  'maisons': 'realestate',
  'villas': 'realestate',
  'terrains': 'realestate',
  'bureaux': 'realestate',
  'locaux-commerciaux': 'realestate',
  
  // Location immobilière
  'location-immobiliere': 'rental',
  'location-vacances': 'rental',
  'location-appartements': 'rental',
  'location-maisons': 'rental',
  'colocations': 'rental',
  
  // Électronique
  'electronique': 'electronics',
  'electromenager': 'electronics',
  'telephones': 'electronics',
  'smartphones': 'electronics',
  'ordinateurs': 'electronics',
  'tablettes': 'electronics',
  'pc-portables': 'electronics',
  'informatique': 'electronics',
  
  // Emploi
  'emploi': 'employment',
  'offres-emploi': 'employment',
  'demandes-emploi': 'employment',
  'stages': 'employment',
  
  // Services
  'services': 'service',
  'prestations': 'service',
  
  // Animaux
  'animaux': 'animals',
  'chiens': 'animals',
  'chats': 'animals',
  'animaux-domestiques': 'animals',
  
  // Mode & Beauté
  'mode-beaute': 'fashion',
  'mode': 'fashion',
  'beaute': 'fashion',
  'vetements': 'fashion',
  'chaussures': 'fashion',
  'accessoires': 'fashion',
  'bijoux': 'fashion',
  
  // Maison & Jardin
  'maison-jardin': 'home',
  'maison': 'home',
  'jardin': 'home',
  'meubles': 'home',
  'decoration': 'home',
  
  // Location d'équipement
  'location-equipement': 'equipment_rental',
  'materiel': 'equipment_rental',
  
  // Sport
  'sport': 'sport',
  'sports': 'sport',
  'sports-loisirs': 'sport',
  'equipements-sport': 'sport',
  'vetements-sport': 'sport',
  'salles-sport': 'sport',
  'fitness': 'sport',
  'musculation': 'sport',
};

/**
 * Mapping des slugs vers les types de catégories pour la table brands
 */
export const SLUG_TO_BRAND_CATEGORY_TYPE: Record<string, string> = {
  // Véhicules -> 'vehicles'
  'vehicules': 'vehicles',
  'voitures': 'vehicles',
  'motos': 'vehicles',
  'camions': 'vehicles',
  'auto-moto': 'vehicles',
  'automobile': 'vehicles',
  
  // Électronique -> 'electronics'
  'electronique': 'electronics',
  'electromenager': 'electronics',
  'telephones': 'electronics',
  'smartphones': 'electronics',
  'ordinateurs': 'electronics',
  'tablettes': 'electronics',
  'pc-portables': 'electronics',
  'informatique': 'electronics',
  
  // Mode & Beauté -> 'fashion'
  'mode-beaute': 'fashion',
  'mode': 'fashion',
  'beaute': 'fashion',
  'vetements': 'fashion',
  'chaussures': 'fashion',
  'accessoires': 'fashion',
  
  // Maison & Jardin -> 'home_garden'
  'maison-jardin': 'home_garden',
  'maison': 'home_garden',
  'jardin': 'home_garden',
  'meubles': 'home_garden',
  'decoration': 'home_garden',
  
  // Sports & Loisirs -> 'sports_leisure'
  'sport': 'sports_leisure',
  'sports': 'sports_leisure',
  'loisirs': 'sports_leisure',
  'sports-loisirs': 'sports_leisure',
};
