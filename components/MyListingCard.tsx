import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { Edit, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react-native';

interface MyListingCardProps {
  listing: any;
  onPress: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onMarkAsSold: () => void;
  onDelete: () => void;
  isWeb?: boolean;
  width?: number;
  isDeleting?: boolean;
}

export default function MyListingCard({
  listing,
  onPress,
  onEdit,
  onToggleStatus,
  onMarkAsSold,
  onDelete,
  isWeb = false,
  width,
  isDeleting = false,
}: MyListingCardProps) {
  const { language, t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = width || (isWeb ? 280 : screenWidth - 32);

  const images = listing.images || [];
  const hasMultipleImages = images.length > 1;

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price);
    return formatted.replace('DZD', 'DA');
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / cardWidth);
    setCurrentImageIndex(index);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isWeb && styles.cardWeb,
        { width: cardWidth },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {hasMultipleImages ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.imageScroll}
            >
              {images.map((image: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={[styles.image, { width: cardWidth }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <View style={styles.paginationDots}>
              {images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <Image
            source={{
              uri: images[0] || 'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=400',
            }}
            style={[styles.image, { width: cardWidth }]}
            resizeMode="cover"
          />
        )}

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            listing.status === 'active' && styles.statusActive,
            listing.status === 'suspended' && styles.statusInactive,
            listing.status === 'sold' && styles.statusSold,
          ]}
        >
          <Text style={styles.statusText}>
            {listing.status === 'active'
              ? t('myListings.active')
              : listing.status === 'suspended'
              ? t('myListings.inactive')
              : t('myListings.sold')}
          </Text>
        </View>

        {/* Views Count */}
        <View style={styles.viewsBadge}>
          <Eye size={12} color="#FFFFFF" />
          <Text style={styles.viewsText}>{listing.views_count || 0}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.price}>
          {formatPrice(parseFloat(listing.price))}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Modifier */}
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            activeOpacity={0.7}
          >
            <Edit size={16} color="#2563EB" strokeWidth={2.5} />
            <Text style={[styles.actionText, styles.editText]}>
              {t('myListings.edit')}
            </Text>
          </TouchableOpacity>

          {/* Désactiver/Réactiver */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              listing.status === 'active' ? styles.deactivateButton : styles.activateButton,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
            activeOpacity={0.7}
          >
            {listing.status === 'active' ? (
              <>
                <EyeOff size={16} color="#F59E0B" strokeWidth={2.5} />
                <Text style={[styles.actionText, styles.deactivateText]}>
                  {t('myListings.deactivate')}
                </Text>
              </>
            ) : (
              <>
                <Eye size={16} color="#10B981" strokeWidth={2.5} />
                <Text style={[styles.actionText, styles.activateText]}>
                  {t('myListings.activate')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Marquer comme vendu (si pas déjà vendu) */}
          {listing.status !== 'sold' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.soldButton]}
              onPress={(e) => {
                e.stopPropagation();
                onMarkAsSold();
              }}
              activeOpacity={0.7}
            >
              <CheckCircle size={16} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={[styles.actionText, styles.soldText]}>
                {t('myListings.markAsSold')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Supprimer */}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.7}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Trash2 size={16} color="#EF4444" strokeWidth={2.5} />
                <Text style={[styles.actionText, styles.deleteText]}>
                  {t('myListings.delete')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardWeb: {
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  imageScroll: {
    width: '100%',
    height: '100%',
  },
  image: {
    height: 200,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusInactive: {
    backgroundColor: '#F59E0B',
  },
  statusSold: {
    backgroundColor: '#8B5CF6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
  },
  editButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  deactivateButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  activateButton: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  soldButton: {
    backgroundColor: '#F3E8FF',
    borderColor: '#E9D5FF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editText: {
    color: '#2563EB',
  },
  deactivateText: {
    color: '#F59E0B',
  },
  activateText: {
    color: '#10B981',
  },
  soldText: {
    color: '#8B5CF6',
  },
  deleteText: {
    color: '#EF4444',
  },
});
