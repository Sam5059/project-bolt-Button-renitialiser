export interface OfferTypeBadge {
  label: string;
  emoji: string;
  color: string;
}

export function getOfferTypeBadge(
  offerType: string | null | undefined,
  listingType: string | null | undefined,
  language: 'fr' | 'en' | 'ar' = 'fr'
): OfferTypeBadge {
  const badges: Record<string, Record<string, OfferTypeBadge>> = {
    free: {
      fr: { label: 'GRATUIT', emoji: '🎁', color: '#10B981' },
      en: { label: 'FREE', emoji: '🎁', color: '#10B981' },
      ar: { label: 'مجاني', emoji: '🎁', color: '#10B981' },
    },
    exchange: {
      fr: { label: 'ÉCHANGE', emoji: '🔄', color: '#F59E0B' },
      en: { label: 'EXCHANGE', emoji: '🔄', color: '#F59E0B' },
      ar: { label: 'للتبادل', emoji: '🔄', color: '#F59E0B' },
    },
    rent: {
      fr: { label: 'LOCATION', emoji: '🔑', color: '#3B82F6' },
      en: { label: 'RENT', emoji: '🔑', color: '#3B82F6' },
      ar: { label: 'للإيجار', emoji: '🔑', color: '#3B82F6' },
    },
  };

  const listingBadges: Record<string, Record<string, OfferTypeBadge>> = {
    sale: {
      fr: { label: 'VENTE', emoji: '🔖', color: '#2563EB' },
      en: { label: 'FOR SALE', emoji: '🔖', color: '#2563EB' },
      ar: { label: 'للبيع', emoji: '🔖', color: '#2563EB' },
    },
    rent: {
      fr: { label: 'LOCATION', emoji: '🔑', color: '#3B82F6' },
      en: { label: 'FOR RENT', emoji: '🔑', color: '#3B82F6' },
      ar: { label: 'للإيجار', emoji: '🔑', color: '#3B82F6' },
    },
    service: {
      fr: { label: 'SERVICE', emoji: '⚙️', color: '#8B5CF6' },
      en: { label: 'SERVICE', emoji: '⚙️', color: '#8B5CF6' },
      ar: { label: 'خدمة', emoji: '⚙️', color: '#8B5CF6' },
    },
    purchase: {
      fr: { label: 'RECHERCHE', emoji: '🛍️', color: '#EC4899' },
      en: { label: 'WANTED', emoji: '🛍️', color: '#EC4899' },
      ar: { label: 'مطلوب', emoji: '🛍️', color: '#EC4899' },
    },
  };

  if (offerType && badges[offerType]) {
    return badges[offerType][language] || badges[offerType].fr;
  }

  if (listingType && listingBadges[listingType]) {
    return listingBadges[listingType][language] || listingBadges[listingType].fr;
  }

  return {
    label: language === 'ar' ? 'مطلوب' : language === 'en' ? 'WANTED' : 'RECHERCHE',
    emoji: '🛍️',
    color: '#EC4899',
  };
}

export function getPriceLabel(
  offerType: string | null | undefined,
  listingType: string | null | undefined,
  language: 'fr' | 'en' | 'ar' = 'fr'
): string {
  if (offerType === 'rent' || listingType === 'rent') {
    return language === 'ar' ? 'سعر/يوم' : language === 'en' ? 'Price/day' : 'Prix/jour';
  }

  return language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix';
}
