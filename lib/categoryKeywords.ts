interface CategoryKeywords {
  [categoryId: string]: {
    fr: string[];
    en: string[];
    ar: string[];
  };
}

export const categoryKeywords: CategoryKeywords = {
  vehicles: {
    fr: [
      'voiture', 'auto', 'automobile', 'véhicule', 'moto', 'scooter', 'camion', 'utilitaire',
      'toyota', 'hyundai', 'volkswagen', 'renault', 'peugeot', 'citroen', 'nissan', 'kia',
      'mercedes', 'bmw', 'audi', 'ford', 'chevrolet', 'honda', 'suzuki', 'mazda',
      'diesel', 'essence', 'électrique', 'hybride', 'automatique', 'manuelle',
      'berline', 'suv', '4x4', 'pickup', 'coupé', 'break', 'monospace', 'utilitaire'
    ],
    en: [
      'car', 'auto', 'automobile', 'vehicle', 'motorcycle', 'bike', 'scooter', 'truck', 'van',
      'toyota', 'hyundai', 'volkswagen', 'renault', 'peugeot', 'citroen', 'nissan', 'kia',
      'mercedes', 'bmw', 'audi', 'ford', 'chevrolet', 'honda', 'suzuki', 'mazda',
      'diesel', 'petrol', 'gasoline', 'electric', 'hybrid', 'automatic', 'manual',
      'sedan', 'suv', '4x4', 'pickup', 'coupe', 'wagon', 'minivan', 'utility'
    ],
    ar: [
      'سيارة', 'مركبة', 'دراجة', 'نارية', 'شاحنة', 'سكوتر',
      'تويوتا', 'هيونداي', 'فولكسفاجن', 'رينو', 'بيجو', 'سيتروين',
      'ديزل', 'بنزين', 'كهربائي', 'هجين', 'أوتوماتيكي', 'يدوي'
    ]
  },
  real_estate: {
    fr: [
      'appartement', 'maison', 'villa', 'terrain', 'studio', 'duplex', 'f2', 'f3', 'f4', 'f5',
      'immobilier', 'logement', 'résidence', 'immeuble', 'local', 'commerce', 'bureau',
      'vente', 'location', 'louer', 'acheter', 'propriété', 'habitation',
      'chambre', 'pièce', 'salon', 'cuisine', 'salle de bain', 'balcon', 'jardin', 'garage',
      'meublé', 'vide', 'neuf', 'ancien', 'standing', 'luxe'
    ],
    en: [
      'apartment', 'house', 'villa', 'land', 'plot', 'studio', 'duplex', 'property',
      'real estate', 'housing', 'residence', 'building', 'commercial', 'office',
      'sale', 'rental', 'rent', 'buy', 'home', 'dwelling',
      'bedroom', 'room', 'living room', 'kitchen', 'bathroom', 'balcony', 'garden', 'garage',
      'furnished', 'unfurnished', 'new', 'old', 'luxury', 'premium'
    ],
    ar: [
      'شقة', 'منزل', 'فيلا', 'أرض', 'قطعة', 'ستوديو', 'دوبلكس', 'عقار',
      'إيجار', 'بيع', 'شراء', 'سكن', 'مسكن', 'مبنى', 'مكتب', 'محل',
      'غرفة', 'صالون', 'مطبخ', 'حمام', 'شرفة', 'حديقة', 'كراج',
      'مفروش', 'فارغ', 'جديد', 'قديم', 'فاخر'
    ]
  },
  electronics: {
    fr: [
      'téléphone', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'huawei', 'oppo', 'nokia',
      'ordinateur', 'pc', 'laptop', 'portable', 'tablette', 'ipad', 'macbook',
      'télévision', 'tv', 'écran', 'moniteur', 'console', 'playstation', 'xbox', 'nintendo',
      'appareil photo', 'caméra', 'drone', 'gopro', 'canon', 'nikon', 'sony',
      'électroménager', 'frigo', 'réfrigérateur', 'machine à laver', 'climatiseur', 'clim',
      'casque', 'écouteurs', 'enceinte', 'speaker', 'bluetooth', 'wifi', 'smart',
      'montre', 'smartwatch', 'watch', 'apple watch', 'galaxy watch', 'garmin',
      'accessoire', 'chargeur', 'batterie', 'câble', 'coque', 'protection'
    ],
    en: [
      'phone', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'huawei', 'oppo', 'nokia',
      'computer', 'pc', 'laptop', 'notebook', 'tablet', 'ipad', 'macbook',
      'television', 'tv', 'screen', 'monitor', 'console', 'playstation', 'xbox', 'nintendo',
      'camera', 'drone', 'gopro', 'canon', 'nikon', 'sony',
      'appliance', 'fridge', 'refrigerator', 'washing machine', 'air conditioner', 'ac',
      'headphones', 'earphones', 'speaker', 'bluetooth', 'wifi', 'smart',
      'watch', 'smartwatch', 'apple watch', 'galaxy watch', 'garmin',
      'accessory', 'charger', 'battery', 'cable', 'case', 'protection'
    ],
    ar: [
      'هاتف', 'جوال', 'آيفون', 'سامسونج', 'شاومي', 'هواوي', 'أوبو', 'نوكيا',
      'كمبيوتر', 'حاسوب', 'لابتوب', 'لوحي', 'آيباد', 'ماك بوك',
      'تلفزيون', 'شاشة', 'كونسول', 'بلايستيشن', 'إكسبوكس', 'نينتيندو',
      'كاميرا', 'طائرة', 'كانون', 'نيكون', 'سوني',
      'ثلاجة', 'غسالة', 'مكيف', 'تكييف',
      'سماعات', 'بلوتوث', 'واي فاي', 'ذكي',
      'ساعة', 'ساعة ذكية', 'أبل ووتش', 'جالاكسي ووتش', 'جارمن',
      'ملحقات', 'شاحن', 'بطارية', 'كابل', 'جراب', 'حماية'
    ]
  },
  furniture: {
    fr: [
      'meuble', 'mobilier', 'ameublement', 'décoration', 'déco',
      'canapé', 'sofa', 'fauteuil', 'chaise', 'table', 'bureau', 'lit', 'matelas',
      'armoire', 'placard', 'étagère', 'bibliothèque', 'commode', 'tiroir',
      'cuisine', 'cuisinière', 'évier', 'buffet', 'vaisselier',
      'tapis', 'rideau', 'lampe', 'lustre', 'miroir', 'cadre', 'tableau',
      'bois', 'métal', 'verre', 'tissu', 'cuir', 'rotin', 'osier',
      'neuf', 'occasion', 'vintage', 'moderne', 'classique', 'scandinave'
    ],
    en: [
      'furniture', 'furnishing', 'decoration', 'decor',
      'sofa', 'couch', 'armchair', 'chair', 'table', 'desk', 'bed', 'mattress',
      'wardrobe', 'closet', 'shelf', 'bookshelf', 'drawer', 'dresser',
      'kitchen', 'stove', 'sink', 'cabinet', 'buffet',
      'carpet', 'rug', 'curtain', 'lamp', 'chandelier', 'mirror', 'frame', 'painting',
      'wood', 'metal', 'glass', 'fabric', 'leather', 'rattan', 'wicker',
      'new', 'used', 'vintage', 'modern', 'classic', 'scandinavian'
    ],
    ar: [
      'أثاث', 'موبيليا', 'ديكور', 'زينة',
      'كنبة', 'أريكة', 'كرسي', 'طاولة', 'مكتب', 'سرير', 'فراش',
      'خزانة', 'دولاب', 'رف', 'مكتبة', 'درج',
      'مطبخ', 'موقد', 'حوض', 'بوفيه',
      'سجاد', 'ستارة', 'مصباح', 'نجفة', 'مرآة', 'إطار', 'لوحة',
      'خشب', 'معدن', 'زجاج', 'قماش', 'جلد', 'قصب',
      'جديد', 'مستعمل', 'عصري', 'كلاسيكي', 'اسكندنافي'
    ]
  },
  clothing: {
    fr: [
      'vêtement', 'habit', 'mode', 'fashion', 'fringue',
      'chemise', 'pantalon', 'jean', 'robe', 'jupe', 'pull', 'gilet', 'veste', 'manteau',
      'tshirt', 't-shirt', 'polo', 'sweat', 'hoodie', 'jogging', 'survêtement',
      'chaussure', 'basket', 'sneaker', 'bottine', 'botte', 'sandale', 'escarpin',
      'sac', 'sacoche', 'portefeuille', 'ceinture', 'chapeau', 'casquette', 'écharpe', 'gant',
      'homme', 'femme', 'enfant', 'bébé', 'garçon', 'fille',
      'nike', 'adidas', 'puma', 'zara', 'h&m', 'mango', 'bershka', 'pull&bear'
    ],
    en: [
      'clothing', 'clothes', 'fashion', 'apparel', 'wear', 'garment',
      'shirt', 'pants', 'jeans', 'dress', 'skirt', 'sweater', 'cardigan', 'jacket', 'coat',
      'tshirt', 't-shirt', 'polo', 'sweatshirt', 'hoodie', 'tracksuit', 'sportswear',
      'shoe', 'shoes', 'sneaker', 'boot', 'sandal', 'heel', 'pump',
      'bag', 'purse', 'wallet', 'belt', 'hat', 'cap', 'scarf', 'glove',
      'men', 'women', 'kids', 'baby', 'boy', 'girl',
      'nike', 'adidas', 'puma', 'zara', 'h&m', 'mango', 'bershka'
    ],
    ar: [
      'ملابس', 'لباس', 'موضة', 'أزياء',
      'قميص', 'بنطلون', 'جينز', 'فستان', 'تنورة', 'سترة', 'جاكيت', 'معطف',
      'تيشيرت', 'بولو', 'سويتشيرت', 'بدلة رياضية',
      'حذاء', 'أحذية', 'سنيكرز', 'بوت', 'صندل', 'كعب',
      'حقيبة', 'شنطة', 'محفظة', 'حزام', 'قبعة', 'وشاح', 'قفاز',
      'رجال', 'نساء', 'أطفال', 'رضيع', 'ولد', 'بنت',
      'نايك', 'أديداس', 'بوما', 'زارا', 'مانجو'
    ]
  },
  animals: {
    fr: [
      'animal', 'animaux', 'pet', 'chien', 'chiot', 'chat', 'chaton', 'oiseau', 'poisson',
      'lapin', 'hamster', 'cochon d\'inde', 'reptile', 'tortue', 'serpent',
      'berger', 'labrador', 'golden', 'husky', 'bulldog', 'chihuahua', 'caniche', 'yorkshire',
      'persan', 'siamois', 'maine coon', 'british shorthair',
      'cage', 'aquarium', 'nourriture', 'croquette', 'accessoire', 'litière',
      'mâle', 'femelle', 'vacciné', 'pedigree', 'race', 'pure race', 'croisé'
    ],
    en: [
      'animal', 'pet', 'dog', 'puppy', 'cat', 'kitten', 'bird', 'fish',
      'rabbit', 'hamster', 'guinea pig', 'reptile', 'turtle', 'snake',
      'shepherd', 'labrador', 'golden', 'husky', 'bulldog', 'chihuahua', 'poodle', 'yorkshire',
      'persian', 'siamese', 'maine coon', 'british shorthair',
      'cage', 'aquarium', 'food', 'kibble', 'accessory', 'litter',
      'male', 'female', 'vaccinated', 'pedigree', 'breed', 'purebred', 'mixed'
    ],
    ar: [
      'حيوان', 'حيوانات', 'أليف', 'كلب', 'جرو', 'قط', 'قطة', 'طائر', 'سمك',
      'أرنب', 'هامستر', 'زواحف', 'سلحفاة', 'ثعبان',
      'جيرمن', 'لابرادور', 'جولدن', 'هاسكي', 'بولدوج', 'شيواوا', 'كانيش', 'يوركشاير',
      'فارسي', 'سيامي', 'ماين كون',
      'قفص', 'حوض', 'طعام', 'أكسسوار',
      'ذكر', 'أنثى', 'ملقح', 'أصيل', 'سلالة', 'هجين'
    ]
  },
  services: {
    fr: [
      'service', 'prestation', 'travail', 'job', 'emploi',
      'plombier', 'plomberie', 'électricien', 'électricité', 'menuisier', 'menuiserie', 
      'peintre', 'peinture', 'maçon', 'maçonnerie', 'carreleur', 'carrelage',
      'réparation', 'dépannage', 'maintenance', 'installation', 'entretien',
      'nettoyage', 'ménage', 'jardinage', 'bricolage', 'déménagement', 'transport',
      'cours', 'formation', 'coaching', 'professeur', 'enseignant', 'tuteur',
      'informatique', 'web', 'design', 'graphisme', 'photographie', 'vidéo',
      'traduction', 'rédaction', 'comptabilité', 'juridique', 'avocat',
      'beauté', 'coiffure', 'coiffeur', 'esthétique', 'maquillage', 'massage',
      'heure', 'horaire', 'disponible', 'urgent', 'rapide', 'professionnel',
      'développeur', 'programmeur', 'développement', 'programmation', 'codeur', 'code'
    ],
    en: [
      'service', 'work', 'job', 'employment',
      'plumber', 'plumbing', 'electrician', 'electricity', 'carpenter', 'carpentry',
      'painter', 'painting', 'mason', 'masonry', 'tiler', 'tiling',
      'repair', 'fix', 'maintenance', 'installation', 'upkeep',
      'cleaning', 'housekeeping', 'gardening', 'handyman', 'moving', 'transport',
      'course', 'training', 'coaching', 'teacher', 'tutor', 'instructor',
      'it', 'web', 'design', 'graphics', 'photography', 'video',
      'translation', 'writing', 'accounting', 'legal', 'lawyer',
      'beauty', 'hairdresser', 'aesthetics', 'makeup', 'massage',
      'hour', 'hourly', 'available', 'urgent', 'fast', 'professional',
      'developer', 'programmer', 'development', 'programming', 'coder', 'code'
    ],
    ar: [
      'خدمة', 'خدمات', 'عمل', 'وظيفة',
      'سباك', 'سباكة', 'كهربائي', 'كهرباء', 'نجار', 'نجارة',
      'دهان', 'طلاء', 'بناء', 'بناية', 'بلاط', 'تبليط',
      'إصلاح', 'صيانة', 'تركيب', 'تثبيت',
      'تنظيف', 'نظافة', 'بستنة', 'نقل', 'شحن',
      'دروس', 'تدريب', 'تدريس', 'معلم', 'أستاذ',
      'معلوماتية', 'برمجة', 'ويب', 'تصميم', 'جرافيك', 'تصوير', 'فيديو',
      'ترجمة', 'كتابة', 'محاسبة', 'قانوني', 'محامي',
      'تجميل', 'حلاقة', 'مكياج', 'تدليك',
      'ساعة', 'متاح', 'عاجل', 'سريع', 'محترف',
      'مبرمج', 'مطور', 'تطوير', 'كود'
    ]
  },
  jobs: {
    fr: [
      'emploi', 'travail', 'job', 'poste', 'recrutement', 'offre d\'emploi', 'carrière',
      'cdi', 'cdd', 'stage', 'alternance', 'intérim', 'freelance', 'temps plein', 'temps partiel',
      'commercial', 'vendeur', 'responsable', 'manager', 'directeur', 'assistant', 'secrétaire',
      'ingénieur', 'technicien', 'développeur', 'programmeur', 'designer', 'graphiste',
      'comptable', 'juriste', 'rh', 'ressources humaines', 'marketing', 'communication',
      'serveur', 'cuisinier', 'chauffeur', 'livreur', 'agent de sécurité', 'gardien',
      'salaire', 'rémunération', 'expérience', 'diplôme', 'compétence', 'qualification'
    ],
    en: [
      'job', 'employment', 'work', 'position', 'recruitment', 'job offer', 'career',
      'permanent', 'contract', 'internship', 'apprenticeship', 'temp', 'freelance', 'full-time', 'part-time',
      'sales', 'seller', 'manager', 'director', 'assistant', 'secretary',
      'engineer', 'technician', 'developer', 'programmer', 'designer', 'graphic designer',
      'accountant', 'lawyer', 'hr', 'human resources', 'marketing', 'communication',
      'waiter', 'chef', 'driver', 'delivery', 'security guard',
      'salary', 'wage', 'experience', 'degree', 'skill', 'qualification'
    ],
    ar: [
      'وظيفة', 'عمل', 'توظيف', 'منصب', 'فرصة عمل', 'مهنة',
      'دائم', 'مؤقت', 'تدريب', 'فريلانس', 'دوام كامل', 'دوام جزئي',
      'تجاري', 'بائع', 'مسؤول', 'مدير', 'مساعد', 'سكرتير',
      'مهندس', 'تقني', 'مطور', 'مبرمج', 'مصمم', 'جرافيك',
      'محاسب', 'محامي', 'موارد بشرية', 'تسويق', 'اتصالات',
      'نادل', 'طباخ', 'سائق', 'توصيل', 'أمن', 'حارس',
      'راتب', 'أجر', 'خبرة', 'شهادة', 'مهارة', 'مؤهل'
    ]
  },
  rentals: {
    fr: [
      'location', 'louer', 'à louer', 'bail', 'locataire', 'loueur',
      'voiture de location', 'véhicule à louer', 'utilitaire à louer',
      'équipement', 'matériel', 'outil', 'machine', 'engin',
      'échafaudage', 'perceuse', 'marteau-piqueur', 'tronçonneuse', 'bétonnière',
      'maison de vacances', 'villa vacances', 'appartement vacances', 'séjour',
      'jour', 'semaine', 'mois', 'journée', 'weekend', 'court terme', 'long terme',
      'caution', 'garantie', 'disponible', 'réservation', 'booking'
    ],
    en: [
      'rental', 'rent', 'for rent', 'lease', 'tenant', 'landlord',
      'car rental', 'vehicle for rent', 'van rental',
      'equipment', 'tools', 'machinery', 'device',
      'scaffolding', 'drill', 'jackhammer', 'chainsaw', 'concrete mixer',
      'vacation home', 'holiday villa', 'vacation apartment', 'stay',
      'day', 'week', 'month', 'daily', 'weekend', 'short term', 'long term',
      'deposit', 'security', 'available', 'reservation', 'booking'
    ],
    ar: [
      'إيجار', 'تأجير', 'للإيجار', 'عقد', 'مستأجر', 'مؤجر',
      'سيارة للإيجار', 'مركبة للإيجار',
      'معدات', 'أدوات', 'آلات', 'جهاز',
      'سقالة', 'مثقاب', 'مطرقة', 'منشار', 'خلاطة',
      'منزل عطلة', 'فيلا عطلة', 'شقة عطلة', 'إقامة',
      'يوم', 'أسبوع', 'شهر', 'يومي', 'عطلة نهاية الأسبوع', 'قصير المدى', 'طويل المدى',
      'ضمان', 'تأمين', 'متاح', 'حجز'
    ]
  }
};

/**
 * Mapping des IDs du dictionnaire de mots-clés vers les slugs réels Supabase
 * Ceci permet de connecter la détection de mots-clés aux vraies catégories de la DB
 */
export const CATEGORY_KEYWORD_TO_SLUG: Record<string, string> = {
  'vehicles': 'vehicules',
  'real_estate': 'immobilier',
  'electronics': 'electronique',
  'furniture': 'maison-jardin',  // Meubles -> Maison & Jardin
  'clothing': 'mode-beaute',     // Vêtements -> Mode & Beauté
  'animals': 'animaux',
  'services': 'services',
  'jobs': 'emploi',
  'rentals': 'location-immobiliere'
};

/**
 * Détecte la catégorie à partir d'une requête de recherche avec scoring intelligent
 * Retourne l'ID logique de la catégorie (ex: 'vehicles', 'real_estate')
 * Utiliser CATEGORY_KEYWORD_TO_SLUG pour obtenir le slug Supabase
 */
export function detectCategoryFromQuery(query: string, language: 'fr' | 'en' | 'ar' = 'fr'): string | null {
  if (!query || query.trim().length < 2) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);

  const categoryScores: Record<string, number> = {};

  for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    const categoryWords = keywords[language] || keywords.fr;

    for (const word of words) {
      for (const keyword of categoryWords) {
        const normalizedKeyword = keyword.toLowerCase();
        
        // Match exact = score élevé (priorité aux marques, modèles)
        if (normalizedKeyword === word) {
          score += 10;
        }
        // Match partiel = score moyen
        else if (word.includes(normalizedKeyword) || normalizedKeyword.includes(word)) {
          score += 5;
        }
      }
    }

    if (score > 0) {
      categoryScores[categoryId] = score;
    }
  }

  if (Object.keys(categoryScores).length === 0) {
    return null;
  }

  // Retourner la catégorie avec le meilleur score
  const topCategory = Object.entries(categoryScores).reduce((a, b) => 
    a[1] > b[1] ? a : b
  );

  return topCategory[1] >= 5 ? topCategory[0] : null;
}
