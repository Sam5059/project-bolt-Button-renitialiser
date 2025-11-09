import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, MapPin, Grid, ShoppingBag } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/database';

const wilayas = [
  '01-Adrar', '02-Chlef', '03-Laghouat', '04-Oum El Bouaghi', '05-Batna',
  '06-Béjaïa', '07-Biskra', '08-Béchar', '09-Blida', '10-Bouira',
  '11-Tamanrasset', '12-Tébessa', '13-Tlemcen', '14-Tiaret', '15-Tizi Ouzou',
  '16-Alger', '17-Djelfa', '18-Jijel', '19-Sétif', '20-Saïda',
  '21-Skikda', '22-Sidi Bel Abbès', '23-Annaba', '24-Guelma', '25-Constantine',
  '26-Médéa', '27-Mostaganem', '28-M\'Sila', '29-Mascara', '30-Ouargla',
  '31-Oran', '32-El Bayadh', '33-Illizi', '34-Bordj Bou Arreridj', '35-Boumerdès',
  '36-El Tarf', '37-Tindouf', '38-Tissemsilt', '39-El Oued', '40-Khenchela',
  '41-Souk Ahras', '42-Tipaza', '43-Mila', '44-Aïn Defla', '45-Naâma',
  '46-Aïn Témouchent', '47-Ghardaïa', '48-Relizane', '49-Timimoun',
  '50-Bordj Badji Mokhtar', '51-Ouled Djellal', '52-Béni Abbès',
  '53-In Salah', '54-In Guezzam', '55-Touggourt', '56-Djanet',
  '57-El M\'Ghair', '58-El Meniaa',
];

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  selectedListingType: 'all' | 'sale' | 'purchase' | 'rent';
  onListingTypeChange: (type: 'all' | 'sale' | 'purchase' | 'rent') => void;
  onApply: () => void;
  onReset: () => void;
}

export default function FiltersModal({
  visible,
  onClose,
  selectedCategoryId,
  onCategoryChange,
  selectedListingType,
  onListingTypeChange,
  onApply,
  onReset,
}: FiltersModalProps) {
  const { language, t } = useLanguage();
  const { currentLocation, setCurrentLocation } = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // États locaux temporaires pour les sélections
  const [tempCategoryId, setTempCategoryId] = useState<string | null>(null);
  const [tempLocation, setTempLocation] = useState<string>('16-Alger');
  const [tempListingType, setTempListingType] = useState<'all' | 'sale' | 'purchase' | 'rent'>('all');

  // Initialiser les états temporaires quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      loadCategories();
      setTempCategoryId(selectedCategoryId);
      setTempLocation(currentLocation);
      setTempListingType(selectedListingType);
    }
  }, [visible, selectedCategoryId, currentLocation, selectedListingType]);

  const loadCategories = async () => {
    const { data: mainCategories } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order', { ascending: true, nullsFirst: false });

    if (mainCategories) {
      const uniqueCategories = mainCategories.filter((cat, index, self) =>
        index === self.findIndex((c) => c.id === cat.id)
      );
      setCategories(uniqueCategories);
    }
  };

  const getCategoryName = (category: Category) => {
    if (language === 'ar') return category.name_ar;
    if (language === 'en') return category.name_en;
    return category.name_fr;
  };

  const handleReset = () => {
    setTempCategoryId(null);
    setTempLocation('16-Alger');
    setTempListingType('all');
  };

  const handleApply = () => {
    // Appliquer les changements temporaires
    onCategoryChange(tempCategoryId);
    setCurrentLocation(tempLocation);
    onListingTypeChange(tempListingType);
    onApply();
    onClose();
  };

  const handleCancel = () => {
    // Annuler les changements - réinitialiser aux valeurs originales
    setTempCategoryId(selectedCategoryId);
    setTempLocation(currentLocation);
    setTempListingType(selectedListingType);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtres de recherche</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Section Catégories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Grid size={20} color="#2563EB" />
                <Text style={styles.sectionTitle}>Catégorie</Text>
              </View>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    !tempCategoryId && styles.optionButtonActive,
                  ]}
                  onPress={() => setTempCategoryId(null)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !tempCategoryId && styles.optionTextActive,
                    ]}
                  >
                    {language === 'ar' ? 'جميع الفئات' : language === 'en' ? 'All Categories' : 'Toutes Catégories'}
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.optionButton,
                      tempCategoryId === category.id && styles.optionButtonActive,
                    ]}
                    onPress={() => setTempCategoryId(category.id)}
                  >
                    <Text style={styles.optionEmoji}>{category.emoji}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        tempCategoryId === category.id && styles.optionTextActive,
                      ]}
                    >
                      {getCategoryName(category)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section Localisation */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color="#2563EB" />
                <Text style={styles.sectionTitle}>Localisation</Text>
              </View>
              <View style={styles.optionsGrid}>
                {wilayas.map((wilaya) => (
                  <TouchableOpacity
                    key={wilaya}
                    style={[
                      styles.optionButton,
                      tempLocation === wilaya && styles.optionButtonActive,
                    ]}
                    onPress={() => setTempLocation(wilaya)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tempLocation === wilaya && styles.optionTextActive,
                      ]}
                    >
                      {wilaya.split('-')[1]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section Type d'annonces */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ShoppingBag size={20} color="#2563EB" />
                <Text style={styles.sectionTitle}>Type d'annonces</Text>
              </View>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tempListingType === 'all' && styles.typeButtonActive,
                  ]}
                  onPress={() => setTempListingType('all')}
                >
                  <Text
                    style={[
                      styles.typeText,
                      tempListingType === 'all' && styles.typeTextActive,
                    ]}
                  >
                    Toutes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    styles.typeButtonGreen,
                    tempListingType === 'sale' && styles.typeButtonActiveGreen,
                  ]}
                  onPress={() => setTempListingType('sale')}
                >
                  <Text
                    style={[
                      styles.typeText,
                      tempListingType === 'sale' && styles.typeTextActive,
                    ]}
                  >
                    Offres
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    styles.typeButtonOrange,
                    tempListingType === 'purchase' && styles.typeButtonActiveOrange,
                  ]}
                  onPress={() => setTempListingType('purchase')}
                >
                  <Text
                    style={[
                      styles.typeText,
                      tempListingType === 'purchase' && styles.typeTextActive,
                    ]}
                  >
                    Demandes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  optionEmoji: {
    fontSize: 16,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  optionTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typeButtonGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  typeButtonOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  typeButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  typeButtonActiveGreen: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  typeButtonActiveOrange: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
