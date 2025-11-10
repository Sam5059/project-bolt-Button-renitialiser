import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Eye, EyeOff, CheckCircle, LayoutGrid } from 'lucide-react-native';

interface MyListingsSidebarProps {
  selectedFilter: 'all' | 'active' | 'suspended' | 'sold';
  onFilterChange: (filter: 'all' | 'active' | 'suspended' | 'sold') => void;
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
  counts,
}: MyListingsSidebarProps) {
  const { t, isRTL } = useLanguage();

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
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 'auto',
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
