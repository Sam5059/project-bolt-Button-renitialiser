import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface ListingCtaPayload {
  id: string;
  offer_type?: string;
  listing_type: string;
}

export function useListingCtaHandler() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const handleListingAction = async (listing: ListingCtaPayload) => {
    if (!user) {
      const loginMessage = language === 'ar' 
        ? 'يجب تسجيل الدخول لإجراء هذا الإجراء'
        : language === 'en'
        ? 'You must be logged in to perform this action'
        : 'Vous devez être connecté pour effectuer cette action';
      
      Alert.alert(
        t('common.error'),
        loginMessage,
        [{ text: 'OK' }]
      );
      return;
    }

    const offerType = listing.offer_type || listing.listing_type;

    try {
      if (offerType === 'rent' || listing.listing_type === 'rent') {
        router.push(`/listing/${listing.id}?booking=open`);
      } else if (offerType === 'free') {
        router.push(`/listing/${listing.id}?free=open`);
      } else if (offerType === 'exchange') {
        router.push(`/listing/${listing.id}?exchange=open`);
      } else {
        await addToCart(listing.id, 1);
        
        const successMessage = language === 'ar'
          ? 'تمت إضافة المقال إلى السلة'
          : language === 'en'
          ? 'Item added to cart'
          : 'Article ajouté au panier';
        
        const continueBtn = language === 'ar'
          ? 'متابعة التسوق'
          : language === 'en'
          ? 'Continue shopping'
          : 'Continuer mes achats';
        
        const viewCartBtn = language === 'ar'
          ? 'عرض السلة'
          : language === 'en'
          ? 'View cart'
          : 'Voir le panier';
        
        Alert.alert(
          t('common.success'),
          successMessage,
          [
            { text: continueBtn, style: 'cancel' },
            { text: viewCartBtn, onPress: () => router.push('/cart') }
          ]
        );
      }
    } catch (error: any) {
      console.error('[CTA Handler] Error:', error);
      console.error('[CTA Handler] Error code:', error?.code);
      console.error('[CTA Handler] Error details:', error?.details);
      
      let errorMessage = language === 'ar'
        ? 'حدث خطأ ما'
        : language === 'en'
        ? 'An error occurred'
        : 'Une erreur est survenue';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.code === 'PGRST116' || error?.code === '42501') {
        errorMessage = language === 'ar'
          ? 'ليس لديك الأذونات اللازمة. الرجاء إعادة تسجيل الدخول.'
          : language === 'en'
          ? 'You do not have the necessary permissions. Please log in again.'
          : 'Vous n\'avez pas les permissions nécessaires. Veuillez vous reconnecter.';
      }
      
      Alert.alert(t('common.error'), errorMessage, [{ text: 'OK' }]);
    }
  };

  return { handleListingAction };
}
