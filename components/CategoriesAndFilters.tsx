import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { SlidersHorizontal, Search, Car, Hop as Home, Smartphone, Briefcase, ChevronDown, ChevronRight, Pin, PinOff, X, ListFilter as Filter } from 'lucide-react-native';
import { saveSearchHistory } from '@/lib/searchHistoryUtils';
import { useSearch } from '@/contexts/SearchContext';
import { uiToDbListingType, dbToUiListingType } from '@/lib/listingTypeMap';
import { detectCategoryFromQuery, CATEGORY_KEYWORD_TO_SLUG } from '@/lib/categoryKeywords';
import { SLUG_TO_CATEGORY_TYPE, SLUG_TO_BRAND_CATEGORY_TYPE } from '@/lib/categoryFiltersConfig';
import { getPlaceholder } from '@/lib/filterPlaceholders';

interface CategoriesAndFiltersProps {
  onFiltersApply: (listings: any[]) => void;
  onCategorySelect?: (categoryId: string) => void;
  initialCategory?: string;
  initialListingType?: string;
  searchQuery?: string;
  sidebarWidth?: number;
}

interface FilterState {
  category_id?: string;
  subcategory_id?: string;
  brand_id?: string;
  model_id?: string;
  yearMin?: string;
  yearMax?: string;
  priceMin?: string;
  priceMax?: string;
  fuel?: string;
  transmission?: string;
  mileageMin?: string;
  mileageMax?: string;
  color?: string;
  propertyType?: string;
  wilaya?: string;
  commune?: string;
  surface?: string;
  surfaceMin?: string;
  surfaceMax?: string;
  rooms?: string;
  bedrooms?: string;
  bathrooms?: string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  deviceType?: string;
  condition?: string;
  storage?: string;
  hasWarranty?: boolean;
  hasBox?: boolean;
  hasAccessories?: boolean;
  furnished?: string;
  monthlyRentMin?: string;
  monthlyRentMax?: string;
  hasWifi?: boolean;
  hasTV?: boolean;
  hasKitchen?: boolean;
  hasWashingMachine?: boolean;
  tariff?: string;
  contractType?: string;
  salary?: string;
  experience?: string;
  sector?: string;
  listing_type?: string;
  // Animaux
  age?: string;
  breed?: string;
  gender?: string;
  vaccinated?: boolean;
  sterilized?: boolean;
  pedigree?: boolean;
  microchipped?: boolean;
  healthStatus?: string;
}

const isWeb = Platform.OS === 'web';

export default function CategoriesAndFilters({
  onFiltersApply,
  onCategorySelect,
  initialCategory,
  initialListingType,
  searchQuery = '',
  sidebarWidth = 320,
}: CategoriesAndFiltersProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { globalSearchQuery, setGlobalSearchQuery } = useSearch();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(initialCategory || null);
  const [filters, setFilters] = useState<FilterState>({
    listing_type: initialListingType,
  });
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const [wilayas, setWilayas] = useState<Array<{id: number, code: string, name_fr: string, name_ar: string, name_en: string}>>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [showCommuneDropdown, setShowCommuneDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showContractTypeDropdown, setShowContractTypeDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [autoDetectedCategory, setAutoDetectedCategory] = useState<string | null>(null);

  // Effet de montage initial - se déclenche une seule fois
  useEffect(() => {
    loadCategories();
    loadWilayas();

    // Si une catégorie initiale existe, l'expand et déclenche le filtre
    if (initialCategory) {
      console.log('[CategoriesAndFilters] Initial category detected:', initialCategory);
      setExpandedCategory(initialCategory);
      // Les filtres seront appliqués par le useEffect qui surveille selectedCategory
    } else {
      // Charger toutes les annonces si pas de catégorie initiale
      loadAllListings();
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      console.log('[CategoriesAndFilters] Setting initial category from prop:', initialCategory);
      setSelectedCategory(initialCategory);
      setExpandedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Détecter automatiquement la catégorie depuis globalSearchQuery via mots-clés intelligents
  // Avec debounce de 300ms pour éviter trop de calculs pendant la frappe
  useEffect(() => {
    if (!globalSearchQuery || !categories.length || initialCategory) {
      // Recherche vide ou catégorie déjà sélectionnée = reset auto-detect
      setAutoDetectedCategory(null);
      return;
    }

    const debounceTimer = setTimeout(() => {
      const normalizedQuery = globalSearchQuery.toLowerCase().trim();

      // 1. Chercher correspondance exacte par nom de catégorie d'abord
      const exactMatch = categories.find(cat => {
        const nameFr = cat.name?.toLowerCase();
        const nameEn = cat.name_en?.toLowerCase();
        const nameAr = cat.name_ar?.toLowerCase();

        return nameFr === normalizedQuery || nameEn === normalizedQuery || nameAr === normalizedQuery;
      });

      if (exactMatch) {
        console.log('[Auto-detect] ✓ Exact category match:', exactMatch.name);
        setAutoDetectedCategory(exactMatch.id);
        setSelectedCategory(exactMatch.id);
        setExpandedCategory(exactMatch.id);
        if (onCategorySelect) {
          onCategorySelect(exactMatch.id);
        }
        return;
      }

      // 2. Utiliser le système de détection par mots-clés intelligents
      const detectedLogicalId = detectCategoryFromQuery(globalSearchQuery, language as 'fr' | 'en' | 'ar');
      
      if (detectedLogicalId) {
        // Convertir l'ID logique (ex: 'vehicles') vers le slug Supabase (ex: 'vehicules')
        const supabaseSlug = CATEGORY_KEYWORD_TO_SLUG[detectedLogicalId];
        
        if (supabaseSlug) {
          // Chercher la catégorie par son slug
          const matchedCategory = categories.find(cat => cat.slug === supabaseSlug);
          
          if (matchedCategory) {
            console.log('[Auto-detect] ✓ Keyword-based match:', matchedCategory.name, '| Query:', globalSearchQuery, '| Logical ID:', detectedLogicalId);
            setAutoDetectedCategory(matchedCategory.id);
            setSelectedCategory(matchedCategory.id);
            setExpandedCategory(matchedCategory.id);
            if (onCategorySelect) {
              onCategorySelect(matchedCategory.id);
            }
          } else {
            setAutoDetectedCategory(null);
          }
        } else {
          setAutoDetectedCategory(null);
        }
      } else {
        // Pas de détection = reset
        setAutoDetectedCategory(null);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(debounceTimer);
  }, [globalSearchQuery, categories, initialCategory, language]);

  useEffect(() => {
    if (filters.wilaya) {
      loadCommunesForWilaya(filters.wilaya);
    } else {
      setCommunes([]);
    }
  }, [filters.wilaya]);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategoriesForCategory(selectedCategory);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  async function loadAllListings() {
    setLoading(true);
    try {
      console.log('Loading all listings...');
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading all listings:', error);
        onFiltersApply([]);
      } else if (data) {
        console.log('Loaded listings count:', data.length);
        onFiltersApply(data);
      }
    } catch (error) {
      console.error('Exception loading all listings:', error);
      onFiltersApply([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedCategory) {
      loadBrandsForCategory();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (filters.brand_id) {
      loadModels(filters.brand_id);
    }
  }, [filters.brand_id]);

  useEffect(() => {
    // Ne déclencher applyFilters que si une catégorie est sélectionnée
    // ou si des filtres sont actifs (pas au montage initial vide)
    if (selectedCategory || Object.keys(filters).length > 0 || globalSearchQuery) {
      // Debounce pour éviter trop de requêtes lors de la saisie
      const timeoutId = setTimeout(() => {
        applyFilters();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [filters, selectedCategory, globalSearchQuery]);

  async function loadCategories() {
    // Charger TOUTES les catégories (principales + sous-catégories)
    // pour que getCategoryType() puisse trouver les sous-catégories
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) {
      setCategories(data);
    }
  }

  async function loadWilayas() {
    const { data } = await supabase
      .from('wilayas')
      .select('id, code, name_fr, name_ar, name_en')
      .order('code', { ascending: true });
    if (data) {
      setWilayas(data);
    }
  }

  async function loadCommunesForWilaya(wilayaCode: string) {
    if (!wilayaCode) {
      setCommunes([]);
      return;
    }

    console.log('[loadCommunes] Loading communes for wilaya:', wilayaCode, 'type:', typeof wilayaCode);

    // Essayer d'abord avec la valeur string directe
    let { data, error } = await supabase
      .from('communes')
      .select('id, name_fr, name_ar, name_en, wilaya_code')
      .eq('wilaya_code', wilayaCode)
      .order('name_fr', { ascending: true });

    // Si pas de résultats avec string, essayer avec integer
    if ((!data || data.length === 0) && !error) {
      console.log('[loadCommunes] No results with string, trying with integer');
      const result = await supabase
        .from('communes')
        .select('id, name_fr, name_ar, name_en, wilaya_code')
        .eq('wilaya_code', parseInt(wilayaCode))
        .order('name_fr', { ascending: true });
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('[loadCommunes] Error loading communes:', error);
    }

    if (data) {
      console.log('[loadCommunes] Loaded', data.length, 'communes');
      setCommunes(data);
    } else {
      setCommunes([]);
    }
  }

  async function loadSubcategoriesForCategory(categoryId: string) {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', categoryId)
      .order('display_order', { ascending: true });

    if (data) {
      setSubcategories(data);
    }
  }

  async function loadBrandsForCategory() {
    if (!selectedCategory) {
      setBrands([]);
      return;
    }

    console.log('[loadBrandsForCategory] Loading brands for category:', selectedCategory);

    // Déterminer le type de catégorie pour la table brands
    const brandCategoryType = getCategoryTypeForBrands(selectedCategory);

    if (!brandCategoryType) {
      console.log('[loadBrandsForCategory] No brands for this category type');
      setBrands([]);
      return;
    }

    console.log('[loadBrandsForCategory] Brand category type:', brandCategoryType);

    // Charger les marques filtrées par type de catégorie
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('category_type', brandCategoryType)
      .order('name');

    if (error) {
      console.error('[loadBrandsForCategory] Error loading brands:', error);
      setBrands([]);
    } else if (data) {
      console.log('[loadBrandsForCategory] Loaded', data.length, 'brands for', brandCategoryType);
      setBrands(data);
    }
  }

  async function loadModels(brandId: string) {
    const { data } = await supabase
      .from('models')
      .select('*')
      .eq('brand_id', brandId)
      .order('name');
    if (data) setModels(data);
  }

  async function applyFilters() {
    setLoading(true);
    console.log('[applyFilters] ========================================');
    console.log('[applyFilters] Applying filters:', { selectedCategory, filters, globalSearchQuery });
    console.log('[applyFilters] Active filters count:', Object.keys(filters).length);

    try {
      const searchParams = {
        search_term: globalSearchQuery || '',
        category_filter: selectedCategory || null,
        subcategory_filter: filters.subcategory_id || null,
        wilaya_filter: filters.wilaya || null,
        commune_filter: filters.commune || null,
        min_price_filter: filters.priceMin ? parseFloat(filters.priceMin) : null,
        max_price_filter: filters.priceMax ? parseFloat(filters.priceMax) : null,
        listing_type_filter: filters.listing_type ? uiToDbListingType(filters.listing_type) : null
      };

      console.log('[applyFilters] RPC params:', JSON.stringify(searchParams, null, 2));

      // Utiliser la fonction de recherche qui cherche dans catégories, marques, modèles, etc
      const { data, error } = await supabase.rpc('search_listings', searchParams);

      console.log('[applyFilters] Search result:', {
        count: data?.length,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null,
        hasData: !!data,
        firstItems: data?.slice(0, 3).map(d => d.title)
      });

      if (error) {
        console.error('[applyFilters] ❌ Search error:', error);
        console.error('[applyFilters] Error message:', error.message);
        console.error('[applyFilters] Error details:', error.details);
        console.error('[applyFilters] Error hint:', error.hint);
        onFiltersApply([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('[applyFilters] ⚠️ No data returned from search_listings');
        console.warn('[applyFilters] This might mean:');
        console.warn('  1. The migration has not been applied');
        console.warn('  2. No listings exist in the subcategories');
        console.warn('  3. The category_filter UUID is invalid');
      }

      // Appliquer les filtres additionnels côté client (pour les champs JSON complexes)
      let filteredData = data || [];

      // Filtres Véhicules
      if (filters.brand_id) {
        const selectedBrand = brands.find(b => b.id === filters.brand_id);
        if (selectedBrand) {
          console.log('[applyFilters] Filtering by brand_name:', selectedBrand.name);
          filteredData = filteredData.filter(item =>
            item.attributes?.brand_name?.toLowerCase() === selectedBrand.name.toLowerCase()
          );
        }
      }

      if (filters.model_id) {
        const selectedModel = models.find(m => m.id === filters.model_id);
        if (selectedModel) {
          console.log('[applyFilters] Filtering by model_name:', selectedModel.name);
          filteredData = filteredData.filter(item =>
            item.attributes?.model_name?.toLowerCase() === selectedModel.name.toLowerCase()
          );
        }
      }

      if (filters.yearMin) {
        const yearMin = parseInt(filters.yearMin);
        console.log('[applyFilters] Filtering by yearMin:', yearMin);
        filteredData = filteredData.filter(item => {
          const year = parseInt(item.attributes?.year || '0');
          return year >= yearMin;
        });
      }

      if (filters.yearMax) {
        const yearMax = parseInt(filters.yearMax);
        console.log('[applyFilters] Filtering by yearMax:', yearMax);
        filteredData = filteredData.filter(item => {
          const year = parseInt(item.attributes?.year || '9999');
          return year <= yearMax;
        });
      }

      if (filters.fuel) {
        console.log('[applyFilters] Filtering by fuel:', filters.fuel);
        filteredData = filteredData.filter(item =>
          item.attributes?.fuel?.toLowerCase() === filters.fuel.toLowerCase()
        );
      }

      if (filters.transmission) {
        console.log('[applyFilters] Filtering by transmission:', filters.transmission);
        filteredData = filteredData.filter(item =>
          item.attributes?.transmission?.toLowerCase() === filters.transmission.toLowerCase()
        );
      }

      if (filters.mileageMin) {
        const mileageMin = parseInt(filters.mileageMin);
        console.log('[applyFilters] Filtering by mileageMin:', mileageMin);
        filteredData = filteredData.filter(item => {
          const mileage = parseInt(item.attributes?.mileage || '0');
          return mileage >= mileageMin;
        });
      }

      if (filters.mileageMax) {
        const mileageMax = parseInt(filters.mileageMax);
        console.log('[applyFilters] Filtering by mileageMax:', mileageMax);
        filteredData = filteredData.filter(item => {
          const mileage = parseInt(item.attributes?.mileage || '999999999');
          return mileage <= mileageMax;
        });
      }

      if (filters.color) {
        console.log('[applyFilters] Filtering by color:', filters.color);
        filteredData = filteredData.filter(item =>
          item.attributes?.color?.toLowerCase().includes(filters.color.toLowerCase())
        );
      }

      // Filtres Immobilier
      if (filters.propertyType) {
        console.log('[applyFilters] Filtering by propertyType:', filters.propertyType);
        filteredData = filteredData.filter(item =>
          item.attributes?.property_type === filters.propertyType
        );
      }

      if (filters.surfaceMin) {
        const surfaceMin = parseFloat(filters.surfaceMin);
        console.log('[applyFilters] Filtering by surfaceMin:', surfaceMin);
        filteredData = filteredData.filter(item => {
          const surface = parseFloat(item.attributes?.surface_area || '0');
          return surface >= surfaceMin;
        });
      }

      if (filters.surfaceMax) {
        const surfaceMax = parseFloat(filters.surfaceMax);
        console.log('[applyFilters] Filtering by surfaceMax:', surfaceMax);
        filteredData = filteredData.filter(item => {
          const surface = parseFloat(item.attributes?.surface_area || '999999');
          return surface <= surfaceMax;
        });
      }

      if (filters.rooms) {
        console.log('[applyFilters] Filtering by rooms:', filters.rooms);
        const roomsVal = filters.rooms === '5+' ? 5 : parseInt(filters.rooms);
        filteredData = filteredData.filter(item => {
          const itemRooms = parseInt(item.attributes?.rooms || '0');
          return filters.rooms === '5+' ? itemRooms >= roomsVal : itemRooms === roomsVal;
        });
      }

      if (filters.bedrooms) {
        console.log('[applyFilters] Filtering by bedrooms:', filters.bedrooms);
        const bedroomsVal = filters.bedrooms === '5+' ? 5 : parseInt(filters.bedrooms);
        filteredData = filteredData.filter(item => {
          const itemBedrooms = parseInt(item.attributes?.bedrooms || '0');
          return filters.bedrooms === '5+' ? itemBedrooms >= bedroomsVal : itemBedrooms === bedroomsVal;
        });
      }

      if (filters.bathrooms) {
        console.log('[applyFilters] Filtering by bathrooms:', filters.bathrooms);
        const bathroomsVal = filters.bathrooms === '3+' ? 3 : parseInt(filters.bathrooms);
        filteredData = filteredData.filter(item => {
          const itemBathrooms = parseInt(item.attributes?.bathrooms || '0');
          return filters.bathrooms === '3+' ? itemBathrooms >= bathroomsVal : itemBathrooms === bathroomsVal;
        });
      }

      // Amenities Immobilier
      if (filters.hasElevator) {
        filteredData = filteredData.filter(item => item.attributes?.has_elevator === true);
      }
      if (filters.hasParking) {
        filteredData = filteredData.filter(item => item.attributes?.has_parking === true);
      }
      if (filters.hasBalcony) {
        filteredData = filteredData.filter(item => item.attributes?.has_balcony === true);
      }
      if (filters.hasGarden) {
        filteredData = filteredData.filter(item => item.attributes?.has_garden === true);
      }
      if (filters.hasPool) {
        filteredData = filteredData.filter(item => item.attributes?.has_pool === true);
      }
      if (filters.hasAirConditioning) {
        filteredData = filteredData.filter(item => item.attributes?.has_air_conditioning === true);
      }
      if (filters.hasHeating) {
        filteredData = filteredData.filter(item => item.attributes?.has_heating === true);
      }

      // Filtres Électronique
      if (filters.deviceType) {
        console.log('[applyFilters] Filtering by deviceType:', filters.deviceType);
        filteredData = filteredData.filter(item =>
          item.attributes?.device_type === filters.deviceType
        );
      }

      if (filters.condition) {
        console.log('[applyFilters] Filtering by condition:', filters.condition);
        filteredData = filteredData.filter(item =>
          item.condition === filters.condition
        );
      }

      if (filters.storage) {
        console.log('[applyFilters] Filtering by storage:', filters.storage);
        filteredData = filteredData.filter(item =>
          item.attributes?.storage === filters.storage
        );
      }

      if (filters.hasWarranty) {
        filteredData = filteredData.filter(item => item.attributes?.has_warranty === true);
      }
      if (filters.hasBox) {
        filteredData = filteredData.filter(item => item.attributes?.has_box === true);
      }
      if (filters.hasAccessories) {
        filteredData = filteredData.filter(item => item.attributes?.has_accessories === true);
      }

      // Filtres Animaux
      const matchesText = (source?: string, needle?: string) =>
        !!needle && !!source && source.toLowerCase().includes(needle.toLowerCase());

      if (filters.age) {
        console.log('[applyFilters] Filtering by age:', filters.age);
        filteredData = filteredData.filter(item =>
          matchesText(item.attributes?.age, filters.age)
        );
      }

      if (filters.breed) {
        console.log('[applyFilters] Filtering by breed:', filters.breed);
        filteredData = filteredData.filter(item =>
          matchesText(item.attributes?.breed, filters.breed)
        );
      }

      if (filters.gender) {
        console.log('[applyFilters] Filtering by gender:', filters.gender);
        filteredData = filteredData.filter(item =>
          item.attributes?.gender?.toLowerCase() === filters.gender.toLowerCase()
        );
      }

      const animalBooleanMap = {
        vaccinated: 'is_vaccinated',
        sterilized: 'is_sterilized',
        pedigree: 'has_pedigree',
        microchipped: 'is_microchipped',
      } as const;

      Object.entries(animalBooleanMap).forEach(([stateKey, attrKey]) => {
        if (filters[stateKey as keyof FilterState]) {
          console.log(`[applyFilters] Filtering by ${stateKey}:`, filters[stateKey as keyof FilterState]);
          filteredData = filteredData.filter(item =>
            item.attributes?.[attrKey] === true
          );
        }
      });

      if (filters.healthStatus) {
        console.log('[applyFilters] Filtering by healthStatus:', filters.healthStatus);
        filteredData = filteredData.filter(item =>
          matchesText(item.attributes?.health_status, filters.healthStatus)
        );
      }

      // Filtres Location Immobilière
      if (filters.furnished) {
        console.log('[applyFilters] Filtering by furnished:', filters.furnished);
        filteredData = filteredData.filter(item =>
          item.attributes?.furnished === filters.furnished
        );
      }

      if (filters.monthlyRentMin) {
        const rentMin = parseFloat(filters.monthlyRentMin);
        console.log('[applyFilters] Filtering by monthlyRentMin:', rentMin);
        filteredData = filteredData.filter(item => {
          const rent = parseFloat(item.attributes?.monthly_rent || '0');
          return rent >= rentMin;
        });
      }

      if (filters.monthlyRentMax) {
        const rentMax = parseFloat(filters.monthlyRentMax);
        console.log('[applyFilters] Filtering by monthlyRentMax:', rentMax);
        filteredData = filteredData.filter(item => {
          const rent = parseFloat(item.attributes?.monthly_rent || '999999999');
          return rent <= rentMax;
        });
      }

      // Amenities Location
      if (filters.hasWifi) {
        filteredData = filteredData.filter(item => item.attributes?.has_wifi === true);
      }
      if (filters.hasTV) {
        filteredData = filteredData.filter(item => item.attributes?.has_tv === true);
      }
      if (filters.hasKitchen) {
        filteredData = filteredData.filter(item => item.attributes?.has_kitchen === true);
      }
      if (filters.hasWashingMachine) {
        filteredData = filteredData.filter(item => item.attributes?.has_washing_machine === true);
      }

      // Filtres Emploi
      if (filters.contractType) {
        console.log('[applyFilters] Filtering by contractType:', filters.contractType);
        filteredData = filteredData.filter(item =>
          item.attributes?.contract_type === filters.contractType
        );
      }

      if (filters.experience) {
        console.log('[applyFilters] Filtering by experience:', filters.experience);
        filteredData = filteredData.filter(item =>
          item.attributes?.experience === filters.experience
        );
      }

      if (filters.sector) {
        console.log('[applyFilters] Filtering by sector:', filters.sector);
        filteredData = filteredData.filter(item =>
          item.attributes?.sector?.toLowerCase().includes(filters.sector.toLowerCase())
        );
      }

      console.log('[applyFilters] Final filtered count:', filteredData.length);
      console.log('[applyFilters] ========================================');

      onFiltersApply(filteredData);

      // Enregistrer dans l'historique de recherche si l'utilisateur est connecté et qu'il y a une recherche
      if (user && globalSearchQuery.trim()) {
        saveSearchHistory({
          userId: user.id,
          searchQuery: globalSearchQuery.trim(),
          categoryId: selectedCategory,
          filters,
          resultsCount: filteredData.length,
        });
      }
    } catch (error) {
      console.error('Filter exception:', error);
      onFiltersApply([]);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    console.log('[resetFilters] Resetting all filters');
    setFilters({});
    setModels([]);
    setBrands([]);
    setSelectedCategory(undefined);
    setExpandedCategory(null);
    setShowBrandDropdown(false);
    setShowModelDropdown(false);
    setShowWilayaDropdown(false);
    loadAllListings();
  }

  function updateFilter(key: keyof FilterState, value: string) {
    console.log('[updateFilter] Key:', key, 'Value:', value);
    console.log('[updateFilter] Previous filters:', filters);
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      console.log('[updateFilter] New filters:', newFilters);
      return newFilters;
    });

    // Fermer la sidebar sur mobile après modification d'un filtre
    if (!isWeb && !isPinned) {
      setTimeout(() => {
        setIsSidebarOpen(false);
      }, 300);
    }
  }

  function handleCategoryToggle(categoryId: string) {
    // Vérifier si c'est la catégorie "Stores PRO"
    const category = categories.find(c => c.id === categoryId);
    if (category && category.slug === 'stores-pro') {
      // Rediriger vers la page des boutiques PRO
      router.push('/(tabs)/stores');
      return;
    }

    // Fermer les dropdowns
    setShowBrandDropdown(false);
    setShowModelDropdown(false);

    if (expandedCategory === categoryId) {
      // Si déjà ouverte, on la ferme
      setExpandedCategory(null);
      setSelectedCategory(undefined);
      setFilters({});
      setModels([]);
      setBrands([]);
      loadAllListings();
      // Notifier le parent que la catégorie a été désélectionnée
      if (onCategorySelect) {
        onCategorySelect('');
      }
    } else {
      // Ouvrir cette catégorie et fermer les autres
      setExpandedCategory(categoryId);
      setSelectedCategory(categoryId);
      // Réinitialiser complètement les filtres pour cette nouvelle catégorie
      setFilters({});
      setModels([]);
      if (onCategorySelect) {
        onCategorySelect(categoryId);
      }
      // Le useEffect se chargera de charger les annonces
    }
  }

  const getCategoryName = (cat: any) => {
    if (language === 'ar') return cat.name_ar || cat.name;
    if (language === 'en') return cat.name_en || cat.name;
    return cat.name;
  };

  const getWilayaName = (code: string) => {
    const wilaya = wilayas.find(w => w.code === code);
    if (!wilaya) return code;
    const name = language === 'ar' ? wilaya.name_ar || wilaya.name_fr : language === 'en' ? wilaya.name_en || wilaya.name_fr : wilaya.name_fr;
    return `${wilaya.code} - ${name}`;
  };

  const getCommuneName = (communeName: string) => {
    const commune = communes.find(c => c.name_fr === communeName);
    if (!commune) return communeName;
    if (language === 'ar') return commune.name_ar || commune.name_fr;
    if (language === 'en') return commune.name_en || commune.name_fr;
    return commune.name_fr;
  };

  const getCategoryIcon = (slug: string) => {
    if (slug?.includes('vehicule') || slug?.includes('auto')) {
      return <Car size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
    }
    if (slug?.includes('immobilier') || slug?.includes('location')) {
      return <Home size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
    }
    if (slug?.includes('electronique') || slug?.includes('telephone')) {
      return <Smartphone size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
    }
    return <Briefcase size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
  };

  const getCategoryType = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return 'generic';

    // Normaliser le slug
    const slug = cat.slug?.toLowerCase() || '';

    // 1. Essayer d'abord le mapping exact du slug enfant
    if (SLUG_TO_CATEGORY_TYPE[slug]) {
      return SLUG_TO_CATEGORY_TYPE[slug];
    }

    // 2. Si c'est une sous-catégorie, essayer le slug parent
    let parentSlug = '';
    if (cat.parent_id) {
      const parent = categories.find(c => c.id === cat.parent_id);
      parentSlug = parent?.slug?.toLowerCase() || '';
      
      if (SLUG_TO_CATEGORY_TYPE[parentSlug]) {
        return SLUG_TO_CATEGORY_TYPE[parentSlug];
      }
    }

    // 3. Fallback: chercher par mots-clés pour compatibilité rétrograde
    // Combiner parent + enfant pour les sous-catégories non mappées
    const combinedSlug = parentSlug ? `${parentSlug} ${slug}` : slug;
    
    if (combinedSlug.includes('vehicule') || combinedSlug.includes('auto') || combinedSlug.includes('moto') || combinedSlug.includes('voiture')) return 'vehicle';
    if (combinedSlug.includes('location-immobiliere') || combinedSlug.includes('location-vacances')) return 'rental';
    if (combinedSlug.includes('immobilier') || combinedSlug.includes('appartement') || combinedSlug.includes('maison') || combinedSlug.includes('terrain') || combinedSlug.includes('bureau')) return 'realestate';
    if (combinedSlug.includes('electronique') || combinedSlug.includes('telephone') || combinedSlug.includes('ordinateur') || combinedSlug.includes('tablette')) return 'electronics';
    if (combinedSlug.includes('animaux') || combinedSlug.includes('chien') || combinedSlug.includes('chat')) return 'animals';
    if (combinedSlug.includes('mode') || combinedSlug.includes('beaute') || combinedSlug.includes('vetement') || combinedSlug.includes('chaussure')) return 'fashion';
    if (combinedSlug.includes('maison-jardin') || combinedSlug.includes('meuble') || combinedSlug.includes('decoration')) return 'home';
    if (combinedSlug.includes('emploi') || combinedSlug.includes('demandes-emploi') || combinedSlug.includes('offres-emploi')) return 'employment';
    if (combinedSlug.includes('service') || combinedSlug.includes('plomberie') || combinedSlug.includes('electricite') || combinedSlug.includes('nettoyage')) return 'service';
    if (combinedSlug.includes('location-equipement')) return 'equipment_rental';

    // Par défaut: filtres génériques
    return 'generic';
  };

  const getCategoryTypeForBrands = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return null;

    // Normaliser le slug
    const slug = cat.slug?.toLowerCase() || '';

    // 1. Essayer d'abord le mapping exact du slug enfant
    if (SLUG_TO_BRAND_CATEGORY_TYPE[slug]) {
      return SLUG_TO_BRAND_CATEGORY_TYPE[slug];
    }

    // 2. Si c'est une sous-catégorie, essayer le slug parent
    let parentSlug = '';
    if (cat.parent_id) {
      const parent = categories.find(c => c.id === cat.parent_id);
      parentSlug = parent?.slug?.toLowerCase() || '';
      
      if (SLUG_TO_BRAND_CATEGORY_TYPE[parentSlug]) {
        return SLUG_TO_BRAND_CATEGORY_TYPE[parentSlug];
      }
    }

    // 3. Fallback: chercher par mots-clés pour compatibilité rétrograde
    // Combiner parent + enfant pour les sous-catégories non mappées
    const combinedSlug = parentSlug ? `${parentSlug} ${slug}` : slug;
    
    if (combinedSlug.includes('vehicule') || combinedSlug.includes('auto') || combinedSlug.includes('moto') || combinedSlug.includes('voiture')) return 'vehicles';
    if (combinedSlug.includes('electronique') || combinedSlug.includes('telephone') || combinedSlug.includes('informatique') || combinedSlug.includes('ordinateur')) return 'electronics';
    if (combinedSlug.includes('mode') || combinedSlug.includes('fashion') || combinedSlug.includes('vetement') || combinedSlug.includes('beaute')) return 'fashion';
    if (combinedSlug.includes('maison') || combinedSlug.includes('jardin') || combinedSlug.includes('decoration')) return 'home_garden';
    if (combinedSlug.includes('sport') || combinedSlug.includes('loisir')) return 'sports_leisure';
    if (combinedSlug.includes('emploi') || combinedSlug.includes('service')) return 'services';

    return null; // Pas de marques pour cette catégorie
  };

  const renderSubcategoryFilter = () => {
    if (subcategories.length === 0) return null;

    return (
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الفئة الفرعية' : language === 'en' ? 'Subcategory' : 'Sous-catégorie'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.subcategory_id && styles.dropdownPlaceholder]}>
            {filters.subcategory_id ? getCategoryName(subcategories.find(s => s.id === filters.subcategory_id) || {}) : (language === 'ar' ? 'اختر الفئة الفرعية' : language === 'en' ? 'Select subcategory' : 'Toutes')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showSubcategoryDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('subcategory_id', '');
                setShowSubcategoryDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
              </Text>
            </TouchableOpacity>
            {subcategories.map((subcat) => (
              <TouchableOpacity
                key={subcat.id}
                style={[styles.dropdownItem, filters.subcategory_id === subcat.id && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('subcategory_id', subcat.id);
                  setShowSubcategoryDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.subcategory_id === subcat.id && styles.dropdownItemTextActive]}>
                  {getCategoryName(subcat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderListingTypeFilter = () => {
    // Détecter si la catégorie sélectionnée est de type location
    const currentCategory = categories.find(cat => cat.id === selectedCategory);
    const isRentalCategory = currentCategory?.slug?.includes('location') || false;

    if (isRentalCategory) {
      // Pour les catégories de location : afficher uniquement "À louer" qui filtre par 'rent'
      return (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'نوع الإعلان' : language === 'en' ? 'Listing Type' : 'Type d\'annonce'}
          </Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.chip, filters.listing_type === 'rent' && styles.chipActive]}
              onPress={() => updateFilter('listing_type', filters.listing_type === 'rent' ? '' : 'rent')}
            >
              <Text style={[styles.chipText, filters.listing_type === 'rent' && styles.chipTextActive]}>
                {language === 'ar' ? 'للإيجار' : language === 'en' ? 'For Rent' : 'À louer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Pour les catégories classiques : afficher "Offres" et "Demandes"
    return (
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'نوع الإعلان' : language === 'en' ? 'Listing Type' : 'Type d\'annonce'}
        </Text>
        <View style={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, filters.listing_type === 'offre' && styles.chipActive]}
            onPress={() => {
              console.log('[OFFRES CLICK] Current listing_type:', filters.listing_type);
              const newValue = filters.listing_type === 'offre' ? '' : 'offre';
              console.log('[OFFRES CLICK] Setting new value:', newValue);
              updateFilter('listing_type', newValue);
            }}
          >
            <Text style={[styles.chipText, filters.listing_type === 'offre' && styles.chipTextActive]}>
              {language === 'ar' ? 'عروض' : language === 'en' ? 'Offers' : 'Offres'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filters.listing_type === 'je_cherche' && styles.chipActive]}
            onPress={() => {
              console.log('[DEMANDES CLICK] Current listing_type:', filters.listing_type);
              const newValue = filters.listing_type === 'je_cherche' ? '' : 'je_cherche';
              console.log('[DEMANDES CLICK] Setting new value:', newValue);
              updateFilter('listing_type', newValue);
            }}
          >
            <Text style={[styles.chipText, filters.listing_type === 'je_cherche' && styles.chipTextActive]}>
              {language === 'ar' ? 'طلبات' : language === 'en' ? 'Requests' : 'Demandes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLocationFilters = () => (
    <>
      {/* Wilaya */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الولاية' : language === 'en' ? 'Wilaya' : 'Wilaya'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowWilayaDropdown(!showWilayaDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.wilaya && styles.dropdownPlaceholder]}>
            {filters.wilaya ? getWilayaName(filters.wilaya) : (language === 'ar' ? 'اختر الولاية' : language === 'en' ? 'Select wilaya' : 'Sélectionner une wilaya')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showWilayaDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('wilaya', '');
                updateFilter('commune', '');
                setShowWilayaDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
              </Text>
            </TouchableOpacity>
            {wilayas.map((wilaya) => (
              <TouchableOpacity
                key={wilaya.code}
                style={[styles.dropdownItem, filters.wilaya === wilaya.code && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('wilaya', wilaya.code);
                  updateFilter('commune', '');
                  setShowWilayaDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.wilaya === wilaya.code && styles.dropdownItemTextActive]}>
                  {getWilayaName(wilaya.code)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Commune */}
      {filters.wilaya && communes.length > 0 && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'البلدية' : language === 'en' ? 'Commune' : 'Commune'}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCommuneDropdown(!showCommuneDropdown)}
          >
            <Text style={[styles.dropdownText, !filters.commune && styles.dropdownPlaceholder]}>
              {filters.commune ? getCommuneName(filters.commune) : (language === 'ar' ? 'اختر البلدية' : language === 'en' ? 'Select commune' : 'Toutes les communes')}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showCommuneDropdown && (
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  updateFilter('commune', '');
                  setShowCommuneDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
                </Text>
              </TouchableOpacity>
              {communes.map((commune) => (
                <TouchableOpacity
                  key={commune.id}
                  style={[styles.dropdownItem, filters.commune === commune.name_fr && styles.dropdownItemActive]}
                  onPress={() => {
                    updateFilter('commune', commune.name_fr);
                    setShowCommuneDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, filters.commune === commune.name_fr && styles.dropdownItemTextActive]}>
                    {getCommuneName(commune.name_fr)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </>
  );

  const renderVehicleFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Marque */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'العلامة التجارية' : language === 'en' ? 'Brand' : 'Marque'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowBrandDropdown(!showBrandDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.brand_id && styles.dropdownPlaceholder]}>
            {brands.find(b => b.id === filters.brand_id)?.name ||
             (language === 'ar' ? 'اختر العلامة' : language === 'en' ? 'Select brand' : 'Sélectionner une marque')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showBrandDropdown && brands.length > 0 && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('brand_id', '');
                updateFilter('model_id', '');
                setModels([]);
                setShowBrandDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
              </Text>
            </TouchableOpacity>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={[styles.dropdownItem, filters.brand_id === brand.id && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('brand_id', brand.id);
                  updateFilter('model_id', '');
                  setShowBrandDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.brand_id === brand.id && styles.dropdownItemTextActive]}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modèle */}
      {filters.brand_id && models.length > 0 && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'الطراز' : language === 'en' ? 'Model' : 'Modèle'}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowModelDropdown(!showModelDropdown)}
          >
            <Text style={[styles.dropdownText, !filters.model_id && styles.dropdownPlaceholder]}>
              {models.find(m => m.id === filters.model_id)?.name ||
               (language === 'ar' ? 'اختر الطراز' : language === 'en' ? 'Select model' : 'Sélectionner un modèle')}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showModelDropdown && (
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  updateFilter('model_id', '');
                  setShowModelDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
                </Text>
              </TouchableOpacity>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.dropdownItem, filters.model_id === model.id && styles.dropdownItemActive]}
                  onPress={() => {
                    updateFilter('model_id', model.id);
                    setShowModelDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, filters.model_id === model.id && styles.dropdownItemTextActive]}>
                    {model.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Année */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السنة' : language === 'en' ? 'Year' : 'Année'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.yearMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('yearMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.yearMin || ''}
            onChangeText={(val) => updateFilter('yearMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.yearMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('yearMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.yearMax || ''}
            onChangeText={(val) => updateFilter('yearMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Carburant */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الوقود' : language === 'en' ? 'Fuel' : 'Carburant'}
        </Text>
        <View style={styles.chipContainer}>
          {['Essence', 'Diesel', 'Électrique', 'Hybride'].map((fuel) => (
            <TouchableOpacity
              key={fuel}
              style={[styles.chip, filters.fuel === fuel && styles.chipActive]}
              onPress={() => updateFilter('fuel', filters.fuel === fuel ? '' : fuel)}
            >
              <Text style={[styles.chipText, filters.fuel === fuel && styles.chipTextActive]}>
                {fuel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transmission */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'ناقل الحركة' : language === 'en' ? 'Transmission' : 'Transmission'}
        </Text>
        <View style={styles.chipContainer}>
          {['Manuelle', 'Automatique'].map((trans) => (
            <TouchableOpacity
              key={trans}
              style={[styles.chip, filters.transmission === trans && styles.chipActive]}
              onPress={() => updateFilter('transmission', filters.transmission === trans ? '' : trans)}
            >
              <Text style={[styles.chipText, filters.transmission === trans && styles.chipTextActive]}>
                {trans}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kilométrage */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'المسافة المقطوعة' : language === 'en' ? 'Mileage (km)' : 'Kilométrage (km)'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.mileageMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('mileageMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.mileageMin || ''}
            onChangeText={(val) => updateFilter('mileageMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.mileageMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('mileageMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.mileageMax || ''}
            onChangeText={(val) => updateFilter('mileageMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Couleur */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'اللون' : language === 'en' ? 'Color' : 'Couleur'}
        </Text>
        <TextInput
          style={[styles.input, !filters.color && styles.inputEmpty]}
          placeholder={getResponsivePlaceholder('color', language as 'fr' | 'en' | 'ar')}
          placeholderTextColor="#9CA3AF"
          value={filters.color || ''}
          onChangeText={(val) => updateFilter('color', val)}
        />
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderRealEstateFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Type de bien */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'نوع العقار' : language === 'en' ? 'Property Type' : 'Type de bien'}
        </Text>
        <View style={styles.chipContainer}>
          {['Appartement', 'Maison', 'Studio', 'Villa', 'Terrain'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, filters.propertyType === type && styles.chipActive]}
              onPress={() => updateFilter('propertyType', filters.propertyType === type ? '' : type)}
            >
              <Text style={[styles.chipText, filters.propertyType === type && styles.chipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Surface */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'المساحة (م²)' : language === 'en' ? 'Surface (m²)' : 'Surface (m²)'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.surfaceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('surfaceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.surfaceMin || ''}
            onChangeText={(val) => updateFilter('surfaceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.surfaceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('surfaceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.surfaceMax || ''}
            onChangeText={(val) => updateFilter('surfaceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Pièces */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'عدد الغرف' : language === 'en' ? 'Rooms' : 'Nombre de pièces'}
        </Text>
        <View style={styles.chipContainer}>
          {['1', '2', '3', '4', '5+'].map((room) => (
            <TouchableOpacity
              key={room}
              style={[styles.chip, filters.rooms === room && styles.chipActive]}
              onPress={() => updateFilter('rooms', filters.rooms === room ? '' : room)}
            >
              <Text style={[styles.chipText, filters.rooms === room && styles.chipTextActive]}>
                {room}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chambres */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'غرف النوم' : language === 'en' ? 'Bedrooms' : 'Chambres'}
        </Text>
        <View style={styles.chipContainer}>
          {['1', '2', '3', '4', '5+'].map((bedroom) => (
            <TouchableOpacity
              key={bedroom}
              style={[styles.chip, filters.bedrooms === bedroom && styles.chipActive]}
              onPress={() => updateFilter('bedrooms', filters.bedrooms === bedroom ? '' : bedroom)}
            >
              <Text style={[styles.chipText, filters.bedrooms === bedroom && styles.chipTextActive]}>
                {bedroom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Salles de bain */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الحمامات' : language === 'en' ? 'Bathrooms' : 'Salles de bain'}
        </Text>
        <View style={styles.chipContainer}>
          {['1', '2', '3+'].map((bathroom) => (
            <TouchableOpacity
              key={bathroom}
              style={[styles.chip, filters.bathrooms === bathroom && styles.chipActive]}
              onPress={() => updateFilter('bathrooms', filters.bathrooms === bathroom ? '' : bathroom)}
            >
              <Text style={[styles.chipText, filters.bathrooms === bathroom && styles.chipTextActive]}>
                {bathroom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Équipements */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'المرافق' : language === 'en' ? 'Amenities' : 'Équipements'}
        </Text>
        <View style={styles.chipContainer}>
          {[
            { key: 'hasElevator', label: language === 'ar' ? 'مصعد' : language === 'en' ? 'Elevator' : 'Ascenseur' },
            { key: 'hasParking', label: language === 'ar' ? 'موقف سيارات' : language === 'en' ? 'Parking' : 'Parking' },
            { key: 'hasBalcony', label: language === 'ar' ? 'شرفة' : language === 'en' ? 'Balcony' : 'Balcon' },
            { key: 'hasGarden', label: language === 'ar' ? 'حديقة' : language === 'en' ? 'Garden' : 'Jardin' },
            { key: 'hasPool', label: language === 'ar' ? 'مسبح' : language === 'en' ? 'Pool' : 'Piscine' },
            { key: 'hasAirConditioning', label: language === 'ar' ? 'تكييف' : language === 'en' ? 'A/C' : 'Climatisation' }
          ].map((amenity) => (
            <TouchableOpacity
              key={amenity.key}
              style={[styles.chip, filters[amenity.key] && styles.chipActive]}
              onPress={() => updateFilter(amenity.key, !filters[amenity.key])}
            >
              <Text style={[styles.chipText, filters[amenity.key] && styles.chipTextActive]}>
                {amenity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderElectronicsFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Marque */}
      {brands.length > 0 && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'العلامة التجارية' : language === 'en' ? 'Brand' : 'Marque'}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowBrandDropdown(!showBrandDropdown)}
          >
            <Text style={[styles.dropdownText, !filters.brand_id && styles.dropdownPlaceholder]}>
              {brands.find(b => b.id === filters.brand_id)?.name ||
               (language === 'ar' ? 'اختر العلامة' : language === 'en' ? 'Select brand' : 'Sélectionner une marque')}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showBrandDropdown && (
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  updateFilter('brand_id', '');
                  updateFilter('model_id', '');
                  setModels([]);
                  setShowBrandDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
                </Text>
              </TouchableOpacity>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[styles.dropdownItem, filters.brand_id === brand.id && styles.dropdownItemActive]}
                  onPress={() => {
                    updateFilter('brand_id', brand.id);
                    updateFilter('model_id', '');
                    setShowBrandDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, filters.brand_id === brand.id && styles.dropdownItemTextActive]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Modèle */}
      {filters.brand_id && models.length > 0 && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'الطراز' : language === 'en' ? 'Model' : 'Modèle'}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowModelDropdown(!showModelDropdown)}
          >
            <Text style={[styles.dropdownText, !filters.model_id && styles.dropdownPlaceholder]}>
              {models.find(m => m.id === filters.model_id)?.name ||
               (language === 'ar' ? 'اختر الطراز' : language === 'en' ? 'Select model' : 'Sélectionner un modèle')}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showModelDropdown && (
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  updateFilter('model_id', '');
                  setShowModelDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
                </Text>
              </TouchableOpacity>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.dropdownItem, filters.model_id === model.id && styles.dropdownItemActive]}
                  onPress={() => {
                    updateFilter('model_id', model.id);
                    setShowModelDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, filters.model_id === model.id && styles.dropdownItemTextActive]}>
                    {model.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* État */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الحالة' : language === 'en' ? 'Condition' : 'État'}
        </Text>
        <View style={styles.chipContainer}>
          {['Neuf', 'Comme neuf', 'Bon état', 'Satisfaisant'].map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[styles.chip, filters.condition === cond && styles.chipActive]}
              onPress={() => updateFilter('condition', filters.condition === cond ? '' : cond)}
            >
              <Text style={[styles.chipText, filters.condition === cond && styles.chipTextActive]}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stockage */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'التخزين' : language === 'en' ? 'Storage' : 'Stockage'}
        </Text>
        <View style={styles.chipContainer}>
          {['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'].map((storage) => (
            <TouchableOpacity
              key={storage}
              style={[styles.chip, filters.storage === storage && styles.chipActive]}
              onPress={() => updateFilter('storage', filters.storage === storage ? '' : storage)}
            >
              <Text style={[styles.chipText, filters.storage === storage && styles.chipTextActive]}>
                {storage}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Garantie et Accessoires */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'ميزات إضافية' : language === 'en' ? 'Additional Features' : 'Options'}
        </Text>
        <View style={styles.chipContainer}>
          {[
            { key: 'hasWarranty', label: language === 'ar' ? 'ضمان' : language === 'en' ? 'Warranty' : 'Garantie' },
            { key: 'hasBox', label: language === 'ar' ? 'الصندوق الأصلي' : language === 'en' ? 'Original Box' : 'Boîte d\'origine' },
            { key: 'hasAccessories', label: language === 'ar' ? 'إكسسوارات' : language === 'en' ? 'Accessories' : 'Accessoires' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, filters[option.key] && styles.chipActive]}
              onPress={() => updateFilter(option.key, !filters[option.key])}
            >
              <Text style={[styles.chipText, filters[option.key] && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'من' : language === 'en' ? 'Min' : 'Min'}
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'إلى' : language === 'en' ? 'Max' : 'Max'}
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderRentalFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Type de bien */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'نوع العقار' : language === 'en' ? 'Property Type' : 'Type de bien'}
        </Text>
        <View style={styles.chipContainer}>
          {['Appartement', 'Maison', 'Villa', 'Studio', 'Chambre', 'Colocation'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, filters.propertyType === type && styles.chipActive]}
              onPress={() => updateFilter('propertyType', filters.propertyType === type ? '' : type)}
            >
              <Text style={[styles.chipText, filters.propertyType === type && styles.chipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Meublé */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الأثاث' : language === 'en' ? 'Furnished' : 'Meublé'}
        </Text>
        <View style={styles.chipContainer}>
          {[
            { key: 'meuble', label: language === 'ar' ? 'مفروش' : language === 'en' ? 'Furnished' : 'Meublé' },
            { key: 'non_meuble', label: language === 'ar' ? 'غير مفروش' : language === 'en' ? 'Unfurnished' : 'Non meublé' },
            { key: 'semi_meuble', label: language === 'ar' ? 'شبه مفروش' : language === 'en' ? 'Semi-furnished' : 'Semi-meublé' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, filters.furnished === option.key && styles.chipActive]}
              onPress={() => updateFilter('furnished', filters.furnished === option.key ? '' : option.key)}
            >
              <Text style={[styles.chipText, filters.furnished === option.key && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loyer mensuel */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الإيجار الشهري (دج)' : language === 'en' ? 'Monthly Rent (DZD)' : 'Loyer mensuel (DA)'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.monthlyRentMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('monthlyRentMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.monthlyRentMin || ''}
            onChangeText={(val) => updateFilter('monthlyRentMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.monthlyRentMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('monthlyRentMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.monthlyRentMax || ''}
            onChangeText={(val) => updateFilter('monthlyRentMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Surface */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'المساحة (م²)' : language === 'en' ? 'Surface (m²)' : 'Surface (m²)'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.surfaceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('surfaceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.surfaceMin || ''}
            onChangeText={(val) => updateFilter('surfaceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.surfaceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('surfaceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.surfaceMax || ''}
            onChangeText={(val) => updateFilter('surfaceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Pièces */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'عدد الغرف' : language === 'en' ? 'Rooms' : 'Nombre de pièces'}
        </Text>
        <View style={styles.chipContainer}>
          {['1', '2', '3', '4', '5+'].map((room) => (
            <TouchableOpacity
              key={room}
              style={[styles.chip, filters.rooms === room && styles.chipActive]}
              onPress={() => updateFilter('rooms', filters.rooms === room ? '' : room)}
            >
              <Text style={[styles.chipText, filters.rooms === room && styles.chipTextActive]}>
                {room}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chambres */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'غرف النوم' : language === 'en' ? 'Bedrooms' : 'Chambres'}
        </Text>
        <View style={styles.chipContainer}>
          {['1', '2', '3', '4', '5+'].map((bedroom) => (
            <TouchableOpacity
              key={bedroom}
              style={[styles.chip, filters.bedrooms === bedroom && styles.chipActive]}
              onPress={() => updateFilter('bedrooms', filters.bedrooms === bedroom ? '' : bedroom)}
            >
              <Text style={[styles.chipText, filters.bedrooms === bedroom && styles.chipTextActive]}>
                {bedroom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Équipements */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'المرافق' : language === 'en' ? 'Amenities' : 'Équipements'}
        </Text>
        <View style={styles.chipContainer}>
          {[
            { key: 'hasWifi', label: language === 'ar' ? 'واي فاي' : language === 'en' ? 'WiFi' : 'WiFi' },
            { key: 'hasTV', label: language === 'ar' ? 'تلفاز' : language === 'en' ? 'TV' : 'TV' },
            { key: 'hasAirConditioning', label: language === 'ar' ? 'تكييف' : language === 'en' ? 'A/C' : 'Climatisation' },
            { key: 'hasHeating', label: language === 'ar' ? 'تدفئة' : language === 'en' ? 'Heating' : 'Chauffage' },
            { key: 'hasKitchen', label: language === 'ar' ? 'مطبخ' : language === 'en' ? 'Kitchen' : 'Cuisine' },
            { key: 'hasWashingMachine', label: language === 'ar' ? 'غسالة' : language === 'en' ? 'Washing Machine' : 'Lave-linge' },
            { key: 'hasElevator', label: language === 'ar' ? 'مصعد' : language === 'en' ? 'Elevator' : 'Ascenseur' },
            { key: 'hasParking', label: language === 'ar' ? 'موقف سيارات' : language === 'en' ? 'Parking' : 'Parking' }
          ].map((amenity) => (
            <TouchableOpacity
              key={amenity.key}
              style={[styles.chip, filters[amenity.key] && styles.chipActive]}
              onPress={() => updateFilter(amenity.key, !filters[amenity.key])}
            >
              <Text style={[styles.chipText, filters[amenity.key] && styles.chipTextActive]}>
                {amenity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderServiceFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Tarif */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'التعريفة' : language === 'en' ? 'Rate' : 'Tarif horaire'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderEmploymentFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Type de contrat */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'نوع العقد' : language === 'en' ? 'Contract Type' : 'Type de contrat'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowContractTypeDropdown(!showContractTypeDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.contractType && styles.dropdownPlaceholder]}>
            {filters.contractType || (language === 'ar' ? 'اختر النوع' : language === 'en' ? 'Select type' : 'Sélectionner')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showContractTypeDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('contractType', '');
                setShowContractTypeDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
              </Text>
            </TouchableOpacity>
            {['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel', 'Temps plein'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.dropdownItem, filters.contractType === type && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('contractType', type);
                  setShowContractTypeDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.contractType === type && styles.dropdownItemTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Salaire */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الراتب' : language === 'en' ? 'Salary' : 'Salaire (DA/mois)'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Expérience requise */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الخبرة المطلوبة' : language === 'en' ? 'Experience Required' : 'Expérience requise'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowExperienceDropdown(!showExperienceDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.experience && styles.dropdownPlaceholder]}>
            {filters.experience || (language === 'ar' ? 'اختر المستوى' : language === 'en' ? 'Select level' : 'Sélectionner')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showExperienceDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('experience', '');
                setShowExperienceDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
              </Text>
            </TouchableOpacity>
            {['Débutant', '1-2 ans', '3-5 ans', '5-10 ans', '+10 ans'].map((exp) => (
              <TouchableOpacity
                key={exp}
                style={[styles.dropdownItem, filters.experience === exp && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('experience', exp);
                  setShowExperienceDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.experience === exp && styles.dropdownItemTextActive]}>
                  {exp}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Secteur d'activité */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'قطاع النشاط' : language === 'en' ? 'Sector' : "Secteur d'activité"}
        </Text>
        <TextInput
          style={[styles.input, !filters.sector && styles.inputEmpty]}
          placeholder={getResponsivePlaceholder('sector', language as 'fr' | 'en' | 'ar')}
          placeholderTextColor="#9CA3AF"
          value={filters.sector || ''}
          onChangeText={(val) => updateFilter('sector', val)}
        />
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderAnimalFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Âge */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'العمر' : language === 'en' ? 'Age' : 'Âge'}
        </Text>
        <TextInput
          style={[styles.input, !filters.age && styles.inputEmpty]}
          placeholder={language === 'ar' ? 'مثال: سنتان، 6 أشهر' : language === 'en' ? 'e.g. 2 years, 6 months' : 'Ex: 2 ans, 6 mois'}
          placeholderTextColor="#9CA3AF"
          value={filters.age || ''}
          onChangeText={(val) => updateFilter('age', val)}
        />
      </View>

      {/* Race */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السلالة' : language === 'en' ? 'Breed' : 'Race'}
        </Text>
        <TextInput
          style={[styles.input, !filters.breed && styles.inputEmpty]}
          placeholder={language === 'ar' ? 'مثال: الراعي الألماني، الفارسي' : language === 'en' ? 'e.g. German Shepherd, Persian' : 'Ex: Berger Allemand, Persan'}
          placeholderTextColor="#9CA3AF"
          value={filters.breed || ''}
          onChangeText={(val) => updateFilter('breed', val)}
        />
      </View>

      {/* Sexe */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الجنس' : language === 'en' ? 'Gender' : 'Sexe'}
        </Text>
        <View style={styles.chipsContainer}>
          {['male', 'female'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.chip, filters.gender === gender && styles.chipActive]}
              onPress={() => updateFilter('gender', filters.gender === gender ? '' : gender)}
            >
              <Text style={[styles.chipText, filters.gender === gender && styles.chipTextActive]}>
                {gender === 'male' 
                  ? (language === 'ar' ? 'ذكر' : language === 'en' ? 'Male' : 'Mâle')
                  : (language === 'ar' ? 'أنثى' : language === 'en' ? 'Female' : 'Femelle')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Santé & Soins */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الصحة والرعاية' : language === 'en' ? 'Health & Care' : 'Santé & Soins'}
        </Text>
        {[
          { key: 'vaccinated', label: language === 'ar' ? 'ملقح' : language === 'en' ? 'Vaccinated' : 'Vacciné' },
          { key: 'sterilized', label: language === 'ar' ? 'معقم' : language === 'en' ? 'Sterilized' : 'Stérilisé' },
          { key: 'pedigree', label: language === 'ar' ? 'نسب' : language === 'en' ? 'Pedigree' : 'Pedigree' },
          { key: 'microchipped', label: language === 'ar' ? 'شريحة إلكترونية' : language === 'en' ? 'Microchipped' : 'Pucé' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.amenityItem, filters[item.key as keyof FilterState] && styles.amenityItemActive]}
            onPress={() => {
              const currentValue = filters[item.key as keyof FilterState];
              updateFilter(item.key, currentValue ? undefined : true);
            }}
          >
            <View style={[styles.checkbox, filters[item.key as keyof FilterState] && styles.checkboxActive]}>
              {filters[item.key as keyof FilterState] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.amenityText, filters[item.key as keyof FilterState] && styles.amenityTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* État de santé */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الحالة الصحية' : language === 'en' ? 'Health Status' : 'État de santé'}
        </Text>
        <TextInput
          style={[styles.input, !filters.healthStatus && styles.inputEmpty]}
          placeholder={language === 'ar' ? 'مثال: صحة جيدة، متابعة بيطرية' : language === 'en' ? 'e.g. Good health, regular vet care' : 'Ex: Bonne santé, suivi vétérinaire'}
          placeholderTextColor="#9CA3AF"
          value={filters.healthStatus || ''}
          onChangeText={(val) => updateFilter('healthStatus', val)}
          multiline
        />
      </View>

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderGenericFilters = () => (
    <View style={[styles.filtersContainer, getResponsiveContainerStyle()]}>
      {/* Type d'annonce */}
      {renderListingTypeFilter()}

      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={[styles.rangeInputs, getResponsiveRangeStyle()]}>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMin && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMin', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, !filters.priceMax && styles.inputEmpty]}
            placeholder={getResponsivePlaceholder('priceMax', language as 'fr' | 'en' | 'ar')}
            placeholderTextColor="#9CA3AF"
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* État */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الحالة' : language === 'en' ? 'Condition' : 'État'}
        </Text>
        <View style={styles.chipContainer}>
          {['Neuf', 'Très bon état', 'Bon état', 'Acceptable'].map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[styles.chip, filters.condition === cond && styles.chipActive]}
              onPress={() => updateFilter('condition', filters.condition === cond ? '' : cond)}
            >
              <Text style={[styles.chipText, filters.condition === cond && styles.chipTextActive]}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderFiltersForCategory = (categoryId: string) => {
    const categoryType = getCategoryType(categoryId);

    switch (categoryType) {
      case 'vehicle':
        return renderVehicleFilters();
      case 'realestate':
        return renderRealEstateFilters();
      case 'rental':
        return renderRentalFilters();
      case 'electronics':
        return renderElectronicsFilters();
      case 'employment':
        return renderEmploymentFilters();
      case 'service':
        return renderServiceFilters();
      case 'animals':
        return renderAnimalFilters();
      case 'fashion':
      case 'home':
      case 'equipment_rental':
      case 'generic':
        return renderGenericFilters();
      default:
        return renderGenericFilters();
    }
  };

  const getResponsivePlaceholder = (field: any, lang: 'fr' | 'en' | 'ar' = 'fr'): string => {
    if (sidebarWidth < 280) {
      const shortPlaceholders: any = {
        fr: {
          priceMin: 'Min DA?',
          priceMax: 'Max DA?',
          yearMin: 'Min?',
          yearMax: 'Max?',
          mileageMin: 'Min km?',
          mileageMax: 'Max km?',
          surfaceMin: 'Min m²?',
          surfaceMax: 'Max m²?',
          monthlyRentMin: 'Min/mois?',
          monthlyRentMax: 'Max/mois?',
        },
        en: {
          priceMin: 'Min DA?',
          priceMax: 'Max DA?',
          yearMin: 'Min?',
          yearMax: 'Max?',
          mileageMin: 'Min km?',
          mileageMax: 'Max km?',
          surfaceMin: 'Min m²?',
          surfaceMax: 'Max m²?',
          monthlyRentMin: 'Min/mo?',
          monthlyRentMax: 'Max/mo?',
        },
        ar: {
          priceMin: 'أدنى؟',
          priceMax: 'أقصى؟',
          yearMin: 'أدنى؟',
          yearMax: 'أقصى؟',
          mileageMin: 'أدنى كم؟',
          mileageMax: 'أقصى كم؟',
          surfaceMin: 'أدنى م²؟',
          surfaceMax: 'أقصى م²؟',
          monthlyRentMin: 'أدنى/شهر؟',
          monthlyRentMax: 'أقصى/شهر؟',
        },
      };
      return shortPlaceholders[lang]?.[field] || getPlaceholder(field, lang);
    } else if (sidebarWidth < 340) {
      const mediumPlaceholders: any = {
        fr: {
          priceMin: 'Prix min ?',
          priceMax: 'Prix max ?',
          yearMin: 'Année min ?',
          yearMax: 'Année max ?',
          mileageMin: 'Km min ?',
          mileageMax: 'Km max ?',
          surfaceMin: 'Surface min ?',
          surfaceMax: 'Surface max ?',
          monthlyRentMin: 'Loyer min ?',
          monthlyRentMax: 'Loyer max ?',
        },
        en: {
          priceMin: 'Min price?',
          priceMax: 'Max price?',
          yearMin: 'Min year?',
          yearMax: 'Max year?',
          mileageMin: 'Min km?',
          mileageMax: 'Max km?',
          surfaceMin: 'Min area?',
          surfaceMax: 'Max area?',
          monthlyRentMin: 'Min rent?',
          monthlyRentMax: 'Max rent?',
        },
        ar: {
          priceMin: 'السعر الأدنى؟',
          priceMax: 'السعر الأقصى؟',
          yearMin: 'السنة الدنيا؟',
          yearMax: 'السنة القصوى؟',
          mileageMin: 'المسافة الدنيا؟',
          mileageMax: 'المسافة القصوى؟',
          surfaceMin: 'المساحة الدنيا؟',
          surfaceMax: 'المساحة القصوى؟',
          monthlyRentMin: 'الإيجار الأدنى؟',
          monthlyRentMax: 'الإيجار الأقصى؟',
        },
      };
      return mediumPlaceholders[lang]?.[field] || getPlaceholder(field, lang);
    } else {
      return getPlaceholder(field, lang);
    }
  };

  const getResponsiveContainerStyle = () => {
    if (sidebarWidth < 320) {
      return { gap: 12, paddingTop: 10 };
    } else if (sidebarWidth >= 320 && sidebarWidth < 400) {
      return { gap: 14, paddingTop: 11 };
    } else {
      return { gap: 16, paddingTop: 12 };
    }
  };

  const getResponsiveRangeStyle = () => {
    if (sidebarWidth < 360) {
      return { flexDirection: 'column' as const, alignItems: 'stretch' as const, gap: 8 };
    } else {
      return { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 };
    }
  };

  const getResponsiveFilterGroupStyle = () => {
    if (sidebarWidth < 400) {
      return { gap: 6 };
    } else {
      return { gap: 8 };
    }
  };

  return (
    <>
      {/* Backdrop (Mobile) */}
      {!isWeb && isSidebarOpen && !isPinned && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <Animated.View
        style={[
          styles.sidebar,
          !isSidebarOpen && styles.sidebarClosed,
          isPinned && styles.sidebarPinned,
        ]}
      >
        {/* Header Sticky - Avec bouton toggle intégré */}
        <View style={styles.stickyHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTitle}>
              <SlidersHorizontal size={22} color="#2563EB" />
              <Text style={styles.headerText}>
                {language === 'ar' ? '🔍 الفلاتر' : language === 'en' ? '🔍 Filters' : '🔍 Filtres'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {/* Pin/Unpin Button */}
              {isSidebarOpen && isWeb && (
                <TouchableOpacity
                  onPress={() => setIsPinned(!isPinned)}
                  style={styles.iconButton}
                >
                  {isPinned ? (
                    <Pin size={18} color="#2563EB" />
                  ) : (
                    <PinOff size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Zone de contenu scrollable avec animation */}
        {isSidebarOpen && (
          <>
            {/* Categories List - Scrollable */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
        <View style={styles.categoriesContainer}>
          {categories
            .filter(category => !category.parent_id) // Afficher uniquement les catégories principales
            .map((category) => {
            const isExpanded = expandedCategory === category.id;
            const isAutoDetected = autoDetectedCategory === category.id;

            return (
              <View key={category.id} style={styles.categoryWrapper}>
                {/* Category Header */}
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    isExpanded && styles.categoryItemActive,
                    isAutoDetected && styles.categoryItemAutoDetected,
                  ]}
                  onPress={() => handleCategoryToggle(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    {getCategoryIcon(category.slug)}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.categoryText,
                          isExpanded && styles.categoryTextActive,
                        ]}
                      >
                        {getCategoryName(category)}
                      </Text>
                      {isAutoDetected && !isExpanded && (
                        <Text style={styles.autoDetectBadge}>
                          🔍 {language === 'ar' ? 'مكتشفة' : language === 'en' ? 'Detected' : 'Détectée'}
                        </Text>
                      )}
                    </View>
                  </View>
                  {isExpanded ? (
                    <ChevronDown size={20} color="#2563EB" />
                  ) : (
                    <ChevronRight size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>

                {/* Filters Section (Collapsible) */}
                {isExpanded && (
                  <View style={styles.filtersSection}>
                    {/* Filtres */}
                    {renderFiltersForCategory(category.id)}
                  </View>
                )}
              </View>
            );
          })}
            </View>
            </ScrollView>

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>
                  {language === 'ar' ? 'جاري التحميل...' : language === 'en' ? 'Loading...' : 'Chargement...'}
                </Text>
              </View>
            )}
          </>
        )}
      </Animated.View>

      {/* CTA Flottant - TOUJOURS visible sur mobile, conditionnel sur desktop */}
      {!isWeb || (!isPinned || !isSidebarOpen) ? (
        <TouchableOpacity
          style={[
            styles.floatingButton,
            isSidebarOpen ? styles.floatingButtonOpen : styles.floatingButtonClosed,
          ]}
          onPress={() => setIsSidebarOpen(!isSidebarOpen)}
          activeOpacity={0.85}
        >
          {isSidebarOpen ? (
            <>
              <X size={20} color="#FFFFFF" />
              <Text style={styles.floatingButtonText}>
                {language === 'ar' ? 'إخفاء ✕' : language === 'en' ? 'Hide ✕' : 'Masquer ✕'}
              </Text>
            </>
          ) : (
            <>
              <Filter size={24} color="#FFFFFF" />
              <Text style={styles.floatingButtonText}>
                {language === 'ar' ? 'الفلاتر' : language === 'en' ? 'Filters' : 'Filtres'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 39,
  },
  sidebar: {
    width: isWeb ? 380 : '90%',
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRightWidth: isWeb ? 1 : 0,
    borderRightColor: '#E2E8F0',
    height: '100%',
    maxHeight: isWeb ? '100vh' : '100%',
    position: isWeb ? 'relative' : 'absolute',
    left: 0,
    top: 0,
    zIndex: 40,
    ...(isWeb ? {
      boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
  },
  sidebarClosed: {
    transform: [{ translateX: -400 }],
  },
  sidebarPinned: {
    position: isWeb ? 'relative' : 'absolute',
  },
  stickyHeader: {
    position: isWeb ? ('sticky' as any) : 'relative',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    ...(isWeb ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#B91C1C',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb ? {
      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    } as any : {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    }),
  },
  toggleButtonClosed: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
    ...(isWeb ? {
      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
    } as any : {
      shadowColor: '#16A34A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    }),
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
    maxHeight: isWeb ? 'calc(100vh - 180px)' as any : '80%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoriesContainer: {
    padding: 12,
  },
  categoryWrapper: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  categoryItemActive: {
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  categoryItemAutoDetected: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    ...(isWeb ? {
      boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)',
    } as any : {
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  categoryTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  autoDetectBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 2,
  },
  filtersSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  subcategoriesContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  subcategoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subcategoryItemActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subcategoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  subcategoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filtersContainer: {
    gap: 16,
    paddingTop: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    width: '100%',
    ...(isWeb ? {
      boxSizing: 'border-box',
    } as any : {}),
  },
  inputEmpty: {
    fontStyle: 'italic',
    color: '#9CA3AF',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInput: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  rangeSeparator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  dropdownText: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
  },
  dropdownMenu: {
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 4,
    ...(isWeb ? {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    }),
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#475569',
  },
  dropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  ctaContainer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  ctaButton: {
    backgroundColor: '#0062FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb ? {
      boxShadow: '0 4px 16px rgba(0, 98, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.2s',
    } as any : {
      shadowColor: '#0062FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaButtonSubtext: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  floatingButton: {
    position: 'absolute',
    bottom: isWeb ? 32 : 90,
    left: isWeb ? 24 : 20,
    right: isWeb ? undefined : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: '#0062FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 999999,
    minWidth: isWeb ? 160 : undefined,
    alignSelf: isWeb ? 'flex-start' : 'stretch',
    ...(isWeb ? {
      boxShadow: '0 8px 30px rgba(0, 98, 255, 0.5), 0 0 20px rgba(0, 98, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
    } as any : {
      shadowColor: '#0062FF',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 30,
      elevation: 35,
    }),
  },
  floatingButtonClosed: {
    opacity: 1,
    ...(isWeb ? {
      transform: 'scale(1.05)',
    } as any : {}),
  },
  floatingButtonOpen: {
    opacity: 0.95,
    backgroundColor: '#1E40AF',
    ...(isWeb ? {
      transform: 'scale(0.98)',
    } as any : {}),
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
