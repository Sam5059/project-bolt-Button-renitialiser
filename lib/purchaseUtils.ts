export type PurchaseType = 'cart' | 'reservation' | 'contact';

const RESERVATION_CATEGORIES = [
  'vehicules',
  'immobilier',
  'location-immobiliere',
  'location-vacances',
  'location-vehicules',
  'location-equipements',
  'services',
  'emploi-services',
  'entreprises-vendre',
  'materiel-professionnel'
];

const CART_CATEGORIES = [
  'electronique',
  'mode-beaute',
  'maison-jardin',
  'animaux',
  'bebe-enfants',
  'loisirs-hobbies'
];

const SUBCATEGORY_PARENT_MAP: Record<string, string> = {
  // Véhicules (reservation)
  'voitures': 'vehicules',
  'motos': 'vehicules',
  'camions': 'vehicules',
  'vehicules-utilitaires': 'vehicules',
  'bateaux': 'vehicules',
  'pieces-auto': 'vehicules',
  'accessoires-auto': 'vehicules',
  
  // Immobilier (reservation)
  'appartement-location': 'immobilier',
  'maison-location': 'immobilier',
  'bureau-location': 'immobilier',
  'appartement-vente': 'immobilier',
  'maison-vente': 'immobilier',
  'terrain': 'immobilier',
  'bureau': 'immobilier',
  'local-commercial': 'immobilier',
  
  // Électronique (cart)
  'smartphones': 'electronique',
  'tablettes': 'electronique',
  'ordinateurs': 'electronique',
  'laptops': 'electronique',
  'tv-video': 'electronique',
  'audio': 'electronique',
  'consoles-jeux': 'electronique',
  'photo-video': 'electronique',
  'accessoires-electronique': 'electronique',
  
  // Mode & Beauté (cart)
  'vetements-homme': 'mode-beaute',
  'vetements-femme': 'mode-beaute',
  'chaussures': 'mode-beaute',
  'sacs-accessoires': 'mode-beaute',
  'bijoux-montres': 'mode-beaute',
  'produits-beaute': 'mode-beaute',
  
  // Maison & Jardin (cart)
  'meubles': 'maison-jardin',
  'electromenager': 'maison-jardin',
  'decoration': 'maison-jardin',
  'jardin': 'maison-jardin',
  'bricolage': 'maison-jardin',
  
  // Animaux (cart)
  'chiens': 'animaux',
  'chats': 'animaux',
  'oiseaux': 'animaux',
  'poissons': 'animaux',
  'rongeurs': 'animaux',
  'autres-animaux': 'animaux',
  'accessoires-animaux': 'animaux',
  
  // Bébé & Enfants (cart)
  'vetements-bebe': 'bebe-enfants',
  'puericulture': 'bebe-enfants',
  'jouets': 'bebe-enfants',
  'equipement-bebe': 'bebe-enfants',
  
  // Loisirs & Hobbies (cart)
  'sport': 'loisirs-hobbies',
  'velos': 'loisirs-hobbies',
  'camping': 'loisirs-hobbies',
  'musique': 'loisirs-hobbies',
  'livres': 'loisirs-hobbies',
  'collection': 'loisirs-hobbies',
  'jeux': 'loisirs-hobbies'
};

export function getListingPurchaseType(
  categorySlug: string,
  parentCategorySlug?: string | null
): PurchaseType {
  // Résoudre le slug parent : utiliser parentCategorySlug si fourni, sinon chercher dans le mapping
  const resolvedParent = parentCategorySlug || SUBCATEGORY_PARENT_MAP[categorySlug] || categorySlug;

  if (RESERVATION_CATEGORIES.includes(resolvedParent)) {
    return 'reservation';
  }

  if (CART_CATEGORIES.includes(resolvedParent)) {
    return 'cart';
  }

  return 'contact';
}

export function canAddToCart(
  categorySlug: string,
  parentCategorySlug?: string | null
): boolean {
  return getListingPurchaseType(categorySlug, parentCategorySlug) === 'cart';
}

export function requiresReservation(
  categorySlug: string,
  parentCategorySlug?: string | null
): boolean {
  return getListingPurchaseType(categorySlug, parentCategorySlug) === 'reservation';
}

export function getPurchaseButtonText(
  purchaseType: PurchaseType,
  language: 'fr' | 'en' | 'ar' = 'fr'
): string {
  const texts = {
    cart: {
      fr: 'Ajouter au panier',
      en: 'Add to cart',
      ar: 'أضف إلى السلة'
    },
    reservation: {
      fr: 'Réserver',
      en: 'Reserve',
      ar: 'احجز'
    },
    contact: {
      fr: 'Contacter',
      en: 'Contact',
      ar: 'اتصل'
    }
  };

  return texts[purchaseType][language];
}

export function getPurchaseButtonIcon(purchaseType: PurchaseType): string {
  const icons = {
    cart: '🛒',
    reservation: '📅',
    contact: '💬'
  };

  return icons[purchaseType];
}
