import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  slug: string;
  name_fr?: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
  icon?: string;
}

interface CategoryBarProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'stores-pro': '#FEF3C7',
  'vehicules': '#FED7AA',
  'electronique': '#E0E7FF',
  'location-immobiliere': '#FCE7F3',
  'location-vacances': '#FDE68A',
  'location-vehicules': '#DBEAFE',
  'location-equipements': '#D1FAE5',
  'mode-beaute': '#FBCFE8',
  'maison-jardin': '#BBF7D0',
  'emploi': '#DDD6FE',
  'services': '#FED7AA',
  'loisirs-hobbies': '#FECACA',
  'materiel-professionnel': '#D1D5DB',
  'entreprises-vendre': '#C7D2FE',
  'bebe-enfants': '#FAE8FF',
  'animaux': '#FEF3C7',
  'immobilier': '#E0E7FF',
};

const CATEGORY_ICONS: Record<string, string> = {
  'stores-pro': '🏪',
  'vehicules': '🚗',
  'electronique': '💻',
  'location-immobiliere': '🏢',
  'location-vacances': '🏖️',
  'location-vehicules': '🚙',
  'location-equipements': '📦',
  'mode-beaute': '👗',
  'maison-jardin': '🏡',
  'emploi': '💼',
  'services': '🔧',
  'loisirs-hobbies': '🎮',
  'materiel-professionnel': '🏭',
  'entreprises-vendre': '🏪',
  'bebe-enfants': '👶',
  'animaux': '🐾',
  'immobilier': '🏠',
};

export default function CategoryBar({ categories, onCategoryPress }: CategoryBarProps) {
  const { language } = useLanguage();

  const getCategoryName = (category: Category) => {
    if (language === 'ar') return category.name_ar || category.name || category.name_fr || '';
    if (language === 'en') return category.name_en || category.name || category.name_fr || '';
    return category.name_fr || category.name || '';
  };

  const getCategoryIcon = (category: Category) => {
    // Utiliser uniquement notre mapping local d'icônes emoji, ignorer la DB
    return CATEGORY_ICONS[category.slug] || '📦';
  };

  const getCategoryColor = (slug: string) => {
    return CATEGORY_COLORS[slug] || '#F3F4F6';
  };

  const handlePress = (category: Category) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else {
      // Fallback : navigation par défaut avec category_id
      if (category.slug === 'stores-pro') {
        router.push('/(tabs)/stores');
      } else {
        router.push(`/(tabs)/searchnew?category_id=${category.id}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: getCategoryColor(category.slug) }]}
            onPress={() => handlePress(category)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getCategoryIcon(category)}</Text>
            </View>
            <Text style={styles.categoryName} numberOfLines={2}>
              {getCategoryName(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
  categoryCard: {
    width: 90,
    height: 90,
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 6,
  },
  icon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 12,
  },
});
