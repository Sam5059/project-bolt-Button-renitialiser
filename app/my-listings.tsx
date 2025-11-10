import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Listing, Category } from '@/types/database';
import { Plus, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react-native';
import TopBar from '@/components/TopBar';
import ListingsQuotaCard from '@/components/ListingsQuotaCard';
import Footer from '@/components/Footer';
import MyListingsSidebar from '@/components/MyListingsSidebar';
import MyListingCard from '@/components/MyListingCard';
import SidebarResizeHandle from '@/components/SidebarResizeHandle';

const isWeb = Platform.OS === 'web';
const SIDEBAR_DEFAULT_WIDTH = 280;
const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 400;

type FilterType = 'all' | 'active' | 'suspended' | 'sold';

export default function MyListingsScreen() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [listingsQuota, setListingsQuota] = useState<any>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (isWeb && !isMobile) {
      const savedWidth = localStorage.getItem('myListingsSidebarWidth');
      const savedCollapsed = localStorage.getItem('myListingsSidebarCollapsed');

      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        if (parsedWidth >= SIDEBAR_MIN_WIDTH && parsedWidth <= SIDEBAR_MAX_WIDTH) {
          setSidebarWidth(parsedWidth);
        }
      }

      if (savedCollapsed === 'true') {
        setSidebarCollapsed(true);
      }
    }
  }, [isMobile]);

  useEffect(() => {
    loadListings();
    loadListingsQuota();
    loadCategories();
  }, []);

  const loadListings = async () => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setListings(data);
    setLoading(false);
  };

  const loadListingsQuota = async () => {
    if (!user) return;

    try {
      setQuotaLoading(true);
      const { data, error } = await supabase.rpc('get_user_listings_quota', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[QUOTA] Error loading quota:', error);
        return;
      }

      setListingsQuota(data);
    } catch (error) {
      console.error('[QUOTA] Exception:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (data) setCategories(data);
  };

  const handleSidebarResize = useCallback((newWidth: number) => {
    setSidebarWidth(newWidth);
    if (isWeb) {
      localStorage.setItem('myListingsSidebarWidth', newWidth.toString());
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    if (isWeb) {
      localStorage.setItem('myListingsSidebarCollapsed', newCollapsed.toString());
    }
  }, [sidebarCollapsed]);

  const filteredListings = useMemo(() => {
    let filtered = listings;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((listing) => listing.status === selectedFilter);
    }

    if (selectedCategory) {
      filtered = filtered.filter((listing) => listing.category_id === selectedCategory);
    }

    return filtered;
  }, [listings, selectedFilter, selectedCategory]);

  const counts = useMemo(() => {
    return {
      all: listings.length,
      active: listings.filter((l) => l.status === 'active').length,
      inactive: listings.filter((l) => l.status === 'suspended').length,
      sold: listings.filter((l) => l.status === 'sold').length,
    };
  }, [listings]);

  const confirmDelete = (listing: Listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;

    setDeletingId(listingToDelete.id);

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingToDelete.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      setListings(listings.filter((l) => l.id !== listingToDelete.id));
      setShowDeleteModal(false);
      setListingToDelete(null);
      loadListingsQuota();

      Alert.alert(t('common.success'), t('myListings.deleteSuccess'), [
        { text: t('common.ok') },
      ]);
    } catch (error) {
      console.error('[DELETE] Error deleting listing:', error);
      Alert.alert(
        t('common.error'),
        `${t('myListings.deleteError')}\n${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        [{ text: t('common.ok') }]
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'suspended' : 'active';

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listing.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      loadListingsQuota();

      setListings(
        listings.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l))
      );

      Alert.alert(
        t('common.success'),
        newStatus === 'active'
          ? t('myListings.activateSuccess')
          : t('myListings.deactivateSuccess'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(t('common.error'), t('myListings.statusError'), [
        { text: t('common.ok') },
      ]);
    }
  };

  const handleMarkAsSold = async (listing: Listing) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: 'sold',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listing.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      setListings(
        listings.map((l) => (l.id === listing.id ? { ...l, status: 'sold' } : l))
      );

      Alert.alert(t('common.success'), t('myListings.soldSuccess'), [
        { text: t('common.ok') },
      ]);
    } catch (error) {
      console.error('Error marking as sold:', error);
      Alert.alert(t('common.error'), t('myListings.statusError'), [
        { text: t('common.ok') },
      ]);
    }
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price);
    return formatted.replace('DZD', 'DA');
  };

  const cardWidth = useMemo(() => {
    if (isMobile) return width - 32;
    const availableWidth = width - (sidebarCollapsed ? 0 : sidebarWidth) - 64;
    const columns = Math.floor(availableWidth / 300);
    return Math.max(280, Math.floor(availableWidth / Math.max(1, columns)) - 16);
  }, [width, sidebarWidth, sidebarCollapsed, isMobile]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stickyHeader}>
        <TopBar />
      </View>

      <View style={styles.mainContainer}>
        {isWeb && !isMobile && (
          <TouchableOpacity
            onPress={toggleSidebar}
            style={[
              styles.toggleSidebarButton,
              sidebarCollapsed && styles.toggleSidebarButtonCollapsed,
            ]}
            activeOpacity={0.7}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} color="#64748B" />
            ) : (
              <ChevronLeft size={20} color="#64748B" />
            )}
          </TouchableOpacity>
        )}

        {isWeb && !isMobile && !sidebarCollapsed && (
          <View style={[styles.sidebarContainer, { width: sidebarWidth }]}>
            <MyListingsSidebar
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              counts={counts}
            />
          </View>
        )}

        {isWeb && !isMobile && !sidebarCollapsed && (
          <SidebarResizeHandle
            onResize={handleSidebarResize}
            minWidth={SIDEBAR_MIN_WIDTH}
            maxWidth={SIDEBAR_MAX_WIDTH}
          />
        )}

        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrapper}>
            <View style={styles.pageHeader}>
              <Text style={[styles.pageTitle, isRTL && styles.textRTL]}>
                {t('myListings.title')}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/publish')}
              >
                <Plus size={20} color="#2563EB" />
                <Text style={[styles.addButtonText, isRTL && styles.textRTL]}>
                  {t('myListings.add')}
                </Text>
              </TouchableOpacity>
            </View>

            {listingsQuota && !quotaLoading && (
              <View style={styles.quotaContainer}>
                <ListingsQuotaCard quota={listingsQuota} showUpgradeButton={true} />
              </View>
            )}

            {filteredListings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>
                  {selectedFilter === 'all'
                    ? t('myListings.emptyTitle')
                    : t('myListings.emptyFilterTitle')}
                </Text>
                <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                  {selectedFilter === 'all'
                    ? t('myListings.emptyText')
                    : t('myListings.emptyFilterText')}
                </Text>
                {selectedFilter === 'all' && (
                  <TouchableOpacity
                    style={styles.publishButton}
                    onPress={() => router.push('/(tabs)/publish')}
                  >
                    <Text style={[styles.publishButtonText, isRTL && styles.textRTL]}>
                      {t('myListings.publishListing')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.listingsGrid}>
                {filteredListings.map((listing) => (
                  <MyListingCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                    onEdit={() => router.push(`/(tabs)/publish?editId=${listing.id}`)}
                    onToggleStatus={() => handleToggleStatus(listing)}
                    onMarkAsSold={() => handleMarkAsSold(listing)}
                    onDelete={() => confirmDelete(listing)}
                    isWeb={isWeb}
                    width={cardWidth}
                    isDeleting={deletingId === listing.id}
                  />
                ))}
              </View>
            )}

            <Footer />
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Trash2 size={32} color="#EF4444" />
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                {t('myListings.confirmDelete')}
              </Text>
            </View>

            {listingToDelete && (
              <View style={styles.listingPreview}>
                <Image
                  source={{
                    uri:
                      listingToDelete.images[0] ||
                      'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=200',
                  }}
                  style={styles.previewImage}
                />
                <View style={styles.previewContent}>
                  <Text
                    style={[styles.previewTitle, isRTL && styles.textRTL]}
                    numberOfLines={2}
                  >
                    {listingToDelete.title}
                  </Text>
                  <Text style={styles.previewPrice}>
                    {formatPrice(parseFloat(String(listingToDelete.price)))}
                  </Text>
                </View>
              </View>
            )}

            <Text style={[styles.modalMessage, isRTL && styles.textRTL]}>
              {t('myListings.deleteWarning')}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setListingToDelete(null);
                }}
                disabled={deletingId !== null}
              >
                <Text style={[styles.cancelButtonText, isRTL && styles.textRTL]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deletingId !== null}
              >
                {deletingId ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.deleteButtonText, isRTL && styles.textRTL]}>
                    {t('myListings.delete')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  stickyHeader: {
    ...(isWeb && {
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }),
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  toggleSidebarButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 12,
    paddingLeft: 6,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 101,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'left 0.3s',
    }),
  },
  toggleSidebarButtonCollapsed: {
    left: 0,
  },
  sidebarContainer: {
    height: '100%',
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quotaContainer: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  publishButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    textAlign: 'center',
  },
  listingPreview: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
