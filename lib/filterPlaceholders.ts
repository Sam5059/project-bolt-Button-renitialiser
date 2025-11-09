export type FilterField = 
  | 'brand' | 'model' | 'yearMin' | 'yearMax' 
  | 'priceMin' | 'priceMax' | 'fuel' | 'transmission'
  | 'mileageMin' | 'mileageMax' | 'color'
  | 'propertyType' | 'city' | 'surface' | 'surfaceMin' | 'surfaceMax' | 'rooms'
  | 'monthlyRentMin' | 'monthlyRentMax'
  | 'deviceType' | 'condition' | 'serviceType' | 'tariff'
  | 'sector';

type Language = 'fr' | 'ar' | 'en';

type PlaceholderMap = {
  [key in Language]: {
    [field in FilterField]?: string;
  };
};

export const FILTER_PLACEHOLDERS: PlaceholderMap = {
  fr: {
    brand: 'Quelle marque recherchez-vous ?',
    model: 'Quel modèle souhaitez-vous ?',
    yearMin: 'Année minimum ? Ex: 2010',
    yearMax: 'Année maximum ? Ex: 2024',
    priceMin: 'Prix minimum en DA ? Ex: 500000',
    priceMax: 'Prix maximum en DA ? Ex: 5000000',
    fuel: 'Quel type de carburant ?',
    transmission: 'Quelle boîte de vitesse ?',
    mileageMin: 'Kilométrage minimum ? Ex: 50000',
    mileageMax: 'Kilométrage maximum ? Ex: 200000',
    color: 'Quelle couleur ? Ex: Noir, Blanc',
    propertyType: 'Quel type de bien ?',
    city: 'Dans quelle ville cherchez-vous ?',
    surface: 'Surface minimale en m² ? Ex: 50',
    surfaceMin: 'Surface minimale en m² ? Ex: 50',
    surfaceMax: 'Surface maximale en m² ? Ex: 300',
    rooms: 'Combien de pièces minimum ?',
    monthlyRentMin: 'Loyer minimum/mois ? Ex: 20000',
    monthlyRentMax: 'Loyer maximum/mois ? Ex: 100000',
    deviceType: 'Quel type d\'appareil ?',
    condition: 'Dans quel état ?',
    serviceType: 'Quel type de service ?',
    tariff: 'Quelle fourchette tarifaire ?',
    sector: 'Secteur d\'activité ? Ex: Informatique',
  },
  en: {
    brand: 'Which brand are you looking for?',
    model: 'Which model do you want?',
    yearMin: 'Minimum year? e.g. 2010',
    yearMax: 'Maximum year? e.g. 2024',
    priceMin: 'Minimum price in DA? e.g. 500000',
    priceMax: 'Maximum price in DA? e.g. 5000000',
    fuel: 'What fuel type?',
    transmission: 'What transmission?',
    mileageMin: 'Minimum mileage? e.g. 50000',
    mileageMax: 'Maximum mileage? e.g. 200000',
    color: 'What color? e.g. Black, White',
    propertyType: 'What property type?',
    city: 'Which city are you searching in?',
    surface: 'Minimum surface in m²? e.g. 50',
    surfaceMin: 'Minimum surface in m²? e.g. 50',
    surfaceMax: 'Maximum surface in m²? e.g. 300',
    rooms: 'How many rooms minimum?',
    monthlyRentMin: 'Minimum rent/month? e.g. 20000',
    monthlyRentMax: 'Maximum rent/month? e.g. 100000',
    deviceType: 'What device type?',
    condition: 'In what condition?',
    serviceType: 'What service type?',
    tariff: 'What price range?',
    sector: 'Business sector? e.g. IT',
  },
  ar: {
    brand: 'أي علامة تجارية تبحث عنها؟',
    model: 'أي طراز تريد؟',
    yearMin: 'السنة الدنيا؟ مثال: 2010',
    yearMax: 'السنة القصوى؟ مثال: 2024',
    priceMin: 'السعر الأدنى بالدينار؟ مثال: 500000',
    priceMax: 'السعر الأقصى بالدينار؟ مثال: 5000000',
    fuel: 'أي نوع وقود؟',
    transmission: 'أي ناقل حركة؟',
    mileageMin: 'المسافة الدنيا؟ مثال: 50000',
    mileageMax: 'المسافة القصوى؟ مثال: 200000',
    color: 'أي لون؟ مثال: أسود، أبيض',
    propertyType: 'أي نوع عقار؟',
    city: 'في أي مدينة تبحث؟',
    surface: 'المساحة الدنيا بالمتر المربع؟ مثال: 50',
    surfaceMin: 'المساحة الدنيا بالمتر المربع؟ مثال: 50',
    surfaceMax: 'المساحة القصوى بالمتر المربع؟ مثال: 300',
    rooms: 'كم عدد الغرف على الأقل؟',
    monthlyRentMin: 'الإيجار الأدنى/شهر؟ مثال: 20000',
    monthlyRentMax: 'الإيجار الأقصى/شهر؟ مثال: 100000',
    deviceType: 'أي نوع جهاز؟',
    condition: 'في أي حالة؟',
    serviceType: 'أي نوع خدمة؟',
    tariff: 'أي نطاق سعري؟',
    sector: 'قطاع النشاط؟ مثال: معلوماتية',
  },
};

export function getPlaceholder(field: FilterField, language: Language = 'fr'): string {
  return FILTER_PLACEHOLDERS[language][field] || '';
}
