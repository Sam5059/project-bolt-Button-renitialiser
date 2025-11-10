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
  Modal,
  Pressable,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { Edit, Trash2, Eye, EyeOff, CheckCircle, MoreVertical } from 'lucide-react-native';

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
  const [menuVisible, setMenuVisible] = useState(false);
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

        {/* Actions Menu Button */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              setMenuVisible(true);
            }}
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Dropdown Menu */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuDropdown}>
              {/* Modifier */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onEdit();
                }}
                activeOpacity={0.7}
              >
                <Edit size={18} color="#2563EB" strokeWidth={2.5} />
                <Text style={[styles.menuItemText, styles.editText]}>
                  {t('myListings.edit')}
                </Text>
              </TouchableOpacity>

              {/* Désactiver/Réactiver */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onToggleStatus();
                }}
                activeOpacity={0.7}
              >
                {listing.status === 'active' ? (
                  <>
                    <EyeOff size={18} color="#F59E0B" strokeWidth={2.5} />
                    <Text style={[styles.menuItemText, styles.deactivateText]}>
                      {t('myListings.deactivate')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Eye size={18} color="#10B981" strokeWidth={2.5} />
                    <Text style={[styles.menuItemText, styles.activateText]}>
                      {t('myListings.activate')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Marquer comme vendu (si pas déjà vendu) */}
              {listing.status !== 'sold' && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onMarkAsSold();
                  }}
                  activeOpacity={0.7}
                >
                  <CheckCircle size={18} color="#8B5CF6" strokeWidth={2.5} />
                  <Text style={[styles.menuItemText, styles.soldText]}>
                    {t('myListings.markAsSold')}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Supprimer */}
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => {
                  setMenuVisible(false);
                  onDelete();
                }}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <>
                    <Trash2 size={18} color="#EF4444" strokeWidth={2.5} />
                    <Text style={[styles.menuItemText, styles.deleteText]}>
                      {t('myListings.delete')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
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
