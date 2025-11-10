import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListingActions } from '@/hooks/useListingActions';
import { useCart } from '@/contexts/CartContext';
import TopBar from '@/components/TopBar';
import CategoryBar from '@/components/CategoryBar';
import ListingCard from '@/components/ListingCard';
import ContactOptionsModal from '@/components/ContactOptionsModal';
import ReservationModal from '@/components/ReservationModal';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [categoriesWithListings, setCategoriesWithListings] = useState([]);
  const [reservationListing, setReservationListing] = useState<any>(null);
  
  const { language } = useLanguage();
  const { onCallSeller, onSendMessage, contactOptionsData, dismissContactOptions } = useListingActions();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchCategoriesWithListings();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order', { ascending: true });
    setCategories(data || []);
  }

  async function fetchCategoriesWithListings() {
    console.log('[HomePage] Starting fetchCategoriesWithListings...');
    
    // Charger TOUTES les catégories une seule fois pour mapping
    const { data: allCategories } = await supabase
      .from('categories')
      .select('*');

    console.log('[HomePage] All categories loaded:', allCategories?.length);

    // Créer un map pour lookup rapide
    const categoryMap = new Map();
    allCategories?.forEach(cat => {
      categoryMap.set(cat.id, cat);
    });

    // Récupérer toutes les catégories parentes principales
    const { data: parentCategories } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .neq('slug', 'stores-pro')
      .order('display_order', { ascending: true });

    console.log('[HomePage] Parent categories:', parentCategories?.length);

    if (!parentCategories) {
      console.log('[HomePage] No parent categories found!');
      return;
    }

    // Pour chaque catégorie, récupérer ses annonces via ses sous-catégories
    const categoriesData = await Promise.all(
      parentCategories.map(async (category) => {
        // Récupérer les sous-catégories
        const { data: subcats } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', category.id);

        const subcategoryIds = subcats ? subcats.map(s => s.id) : [];

        console.log(`[HomePage] Category ${category.name}: ${subcategoryIds.length} subcategories found`);

        // Charger les listings de la catégorie parente ET de ses sous-catégories
        const allCategoryIds = [category.id, ...subcategoryIds];
        
        console.log(`[HomePage] Searching in ${allCategoryIds.length} categories (parent + subs)`);

        // Récupérer les annonces de la catégorie ET ses sous-catégories
        const { data: listings } = await supabase
          .from('listings')
          .select('*, profiles(phone_number, whatsapp_number, messenger_username, full_name)')
          .eq('status', 'active')
          .in('category_id', allCategoryIds)
          .order('created_at', { ascending: false })
          .limit(20);

        console.log(`[HomePage] Category ${category.name}: ${listings?.length || 0} listings loaded`);

        let filteredListings = listings || [];
        
        // Filtrer véhicules mal catégorisés
        if (category.slug === 'location-immobiliere' || category.slug === 'immobilier-location') {
          filteredListings = filteredListings.filter(listing => {
            const title = listing.title?.toLowerCase() || '';
            return !(title.includes('bmw') || title.includes('mercedes') || 
                    title.includes('voiture') || title.includes('moto'));
          });
        }

        // Enrichir avec slugs en utilisant le map (PAS de requêtes supplémentaires !)
        const enrichedListings = filteredListings.map(listing => {
          const cat = categoryMap.get(listing.category_id);
          const parentCat = cat?.parent_id ? categoryMap.get(cat.parent_id) : null;
          
          return {
            ...listing,
            category_slug: cat?.slug || null,
            parent_category_slug: parentCat?.slug || null,
          };
        });

        return {
          category,
          listings: enrichedListings,
        };
      })
    );

    const withListings = categoriesData.filter(c => c.listings.length > 0);
    console.log('[HomePage] Categories with listings:', withListings.length);
    console.log('[HomePage] First enriched listing:', withListings[0]?.listings[0]?.category_slug, withListings[0]?.listings[0]?.parent_category_slug);
    setCategoriesWithListings(withListings);
  }

  const handleCategoryPress = (category) => {
    // Si c'est la catégorie Stores PRO, rediriger vers l'onglet Boutiques
    if (category.slug === 'stores-pro') {
      router.push('/(tabs)/stores');
    } else {
      console.log('[HomePage] Category clicked:', {
        id: category.id,
        name: category.name,
        slug: category.slug
      });
      router.push(`/(tabs)/searchnew?category_id=${category.id}`);
    }
  };

  const handleAddToCart = async (listing: any) => {
    try {
      await addToCart(listing.id);
      Alert.alert(
        language === 'ar' ? 'تم' : language === 'en' ? 'Success' : 'Succès',
        language === 'ar'
          ? 'تمت الإضافة إلى السلة'
          : language === 'en'
          ? 'Added to cart'
          : 'Ajouté au panier'
      );
    } catch (error) {
      console.error('[HomePage] Add to cart error:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : language === 'en' ? 'Error' : 'Erreur',
        language === 'ar' ? 'فشل في إضافة إلى السلة' : language === 'en' ? 'Failed to add to cart' : 'Échec de l\'ajout au panier'
      );
    }
  };

  const handleReserve = (listing: any) => {
    setReservationListing(listing);
  };

  const getCategoryName = (cat) => {
    if (language === 'ar') return cat.name_ar || cat.name;
    if (language === 'en') return cat.name_en || cat.name;
    return cat.name;
  };

  const getCategoryIcon = (slug) => {
    const icons = {
      'vehicules': '🚗',
      'immobilier': '🏠',
      'electronique': '💻',
      'location-immobilier': '🏢',
      'location-vacances': '🏖️',
      'location-vehicules': '🚙',
      'location-equipements': '📦',
      'mode-beaute': '👗',
      'maison-jardin': '🏡',
      'emploi': '💼',
      'services': '🔧',
      'emploi-services': '💼',
      'loisirs-hobbies': '🎮',
      'materiel-professionnel': '🏭',
      'entreprises-vendre': '🏢',
      'bebe-enfants': '👶',
      'animaux': '🐾',
    };
    return icons[slug] || '📦';
  };

  const getCategoryColor = (index) => {
    const colors = [
      { bg: '#E0F2FE', icon: '#0284C7' },
      { bg: '#D1FAE5', icon: '#059669' },
      { bg: '#FEF3C7', icon: '#D97706' },
      { bg: '#FCE7F3', icon: '#DB2777' },
      { bg: '#DDD6FE', icon: '#7C3AED' },
      { bg: '#FED7AA', icon: '#EA580C' },
      { bg: '#DBEAFE', icon: '#2563EB' },
      { bg: '#D1FAE5', icon: '#10B981' },
      { bg: '#FEF9C3', icon: '#CA8A04' },
      { bg: '#FFE4E6', icon: '#E11D48' },
      { bg: '#E0E7FF', icon: '#4F46E5' },
      { bg: '#FED7AA', icon: '#F97316' },
    ];
    return colors[index % colors.length];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price).replace('DZD', 'DA');
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push(`/(tabs)/searchnew?q=${encodeURIComponent(searchText)}`);
    } else {
      router.push('/(tabs)/searchnew');
    }
  };

  return (
    <View style={styles.container}>
      <TopBar
        searchQuery={searchText}
        onSearchChange={setSearchText}
        onSearch={handleSearch}
      />
      <CategoryBar 
        categories={categories} 
        onCategoryPress={handleCategoryPress}
      />

      <ScrollView style={styles.content}>

        {categoriesWithListings.map(({ category, listings }) => (
          <View key={category.id}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIconBadge}>
                  <Text style={styles.sectionIconText}>{getCategoryIcon(category.slug)}</Text>
                </View>
                <Text style={styles.sectionTitle}>
                  {getCategoryName(category).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={styles.viewAllText}>
                  {language === 'ar' ? 'عرض الكل' : language === 'en' ? 'VIEW ALL' : 'VOIR TOUT'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsHorizontalScroll}
            >
              {listings.map((listing) => (
                <View key={listing.id} style={styles.listingCardWrapper}>
                  <ListingCard
                    listing={listing}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                    onCallSeller={() => onCallSeller(listing)}
                    onSendMessage={() => onSendMessage(listing)}
                    onAddToCart={() => handleAddToCart(listing)}
                    onReserve={() => handleReserve(listing)}
                    isWeb={false}
                    width={280}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* Contact Options Modal */}
      {contactOptionsData && (
        <ContactOptionsModal
          visible={!!contactOptionsData}
          onClose={dismissContactOptions}
          sellerName={contactOptionsData.sellerName}
          phoneNumber={contactOptionsData.phoneNumber}
          whatsappNumber={contactOptionsData.whatsappNumber}
          messengerUsername={contactOptionsData.messengerUsername}
        />
      )}

      {/* Reservation Modal */}
      {reservationListing && (
        <ReservationModal
          visible={!!reservationListing}
          onClose={() => setReservationListing(null)}
          listing={reservationListing}
          onSuccess={() => {
            setReservationListing(null);
            Alert.alert(
              language === 'ar' ? 'تم' : language === 'en' ? 'Success' : 'Succès',
              language === 'ar'
                ? 'تم إرسال طلب الحجز'
                : language === 'en'
                ? 'Reservation request sent'
                : 'Demande de réservation envoyée'
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 24,
    paddingHorizontal: 16,
    color: '#1E293B',
  },
  categoriesScroll: {
    marginBottom: 20,
    marginTop: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 90,
    height: 95,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 8,
  },
  saleBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  categoryBadgeIcon: {
    fontSize: 14,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listingsHorizontalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listingCardWrapper: {
    width: 280,
    marginRight: 12,
  },
  listingCardHorizontal: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 12,
  },
  listingImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  listingInfo: {
    padding: 12,
    gap: 6,
    minHeight: 110,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  listingPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2563EB',
    marginTop: 2,
  },
  listingLocation: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
});
