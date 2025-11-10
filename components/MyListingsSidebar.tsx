import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Eye, EyeOff, CheckCircle, LayoutGrid, Folder, X } from 'lucide-react-native';
import { Category } from '@/types/database';

interface MyListingsSidebarProps {
  selectedFilter: 'all' | 'active' | 'suspended' | 'sold';
  onFilterChange: (filter: 'all' | 'active' | 'suspended' | 'sold') => void;
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  categories: Category[];
  counts: {
    all: number;
    active: number;
    inactive: number;
    sold: number;
  };
}

export default function MyListingsSidebar({
  selectedFilter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  categories,
  counts,
}: MyListingsSidebarProps) {
  const { t, language, isRTL } = useLanguage();

  const getCategoryName = (category: Category) => {
    if (language === 'ar' && category.name_ar) return category.name_ar;
    if (language === 'en' && category.name) return category.name;
    if (language === 'fr' && category.name) return category.name;
    return category.name || category.name_ar;
  };

  const filters = [
    {
      id: 'all' as const,
      label: t('myListings.filters.all'),
      icon: LayoutGrid,
      color: '#64748B',
      count: counts.all,
    },
    {
      id: 'active' as const,
      label: t('myListings.filters.active'),
      icon: Eye,
      color: '#10B981',
      count: counts.active,
    },
    {
      id: 'suspended' as const,
      label: t('myListings.filters.inactive'),
      icon: EyeOff,
      color: '#F59E0B',
      count: counts.inactive,
    },
    {
      id: 'sold' as const,
      label: t('myListings.filters.sold'),
      icon: CheckCircle,
      color: '#8B5CF6',
      count: counts.sold,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('myListings.filters.title')}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.filtersList}>
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            const Icon = filter.icon;

            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterItem,
                  isSelected && styles.filterItemSelected,
                ]}
                onPress={() => onFilterChange(filter.id)}
                activeOpacity={0.7}
              >
                <View style={styles.filterContent}>
                  <Icon
                    size={20}
                    color={isSelected ? filter.color : '#94A3B8'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.filterLabel,
                      isSelected && styles.filterLabelSelected,
                      isRTL && styles.textRTL,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </View>
                <View
                  style={[
                    styles.countBadge,
                    isSelected && { backgroundColor: filter.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isSelected && styles.countTextSelected,
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Folder size={16} color="#64748B" />
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {t('myListings.filters.categories')}
              </Text>
            </View>

            {selectedCategory && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => onCategoryChange(null)}
                activeOpacity={0.7}
              >
                <X size={14} color="#64748B" />
                <Text style={[styles.clearButtonText, isRTL && styles.textRTL]}>
                  {t('common.all')}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.categoriesList}>
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      isSelected && styles.categoryItemSelected,
                    ]}
                    onPress={() => onCategoryChange(isSelected ? null : category.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.categoryLabelSelected,
                        isRTL && styles.textRTL,
                      ]}
                      numberOfLines={1}
                    >
                      {getCategoryName(category)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.infoSection}>
        <Package size={16} color="#94A3B8" />
        <Text style={[styles.infoText, isRTL && styles.textRTL]}>
          {t('myListings.filters.info')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    height: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContent: {
    flex: 1,
  },
  filtersList: {
    paddingVertical: 8,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
  },
  filterItemSelected: {
    backgroundColor: '#F1F5F9',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterLabelSelected: {
    color: '#1E293B',
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
  categoriesSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  clearButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  categoriesList: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 2,
    borderRadius: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
  },
  categoryItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryLabelSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 16,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
