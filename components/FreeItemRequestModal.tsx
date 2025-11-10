import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X, Gift, MapPin, Calendar } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import CommuneAutocomplete from './CommuneAutocomplete';
import { useLanguage } from '@/contexts/LanguageContext';

interface FreeItemRequestModalProps {
  visible: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    user_id: string;
  };
  onSuccess: () => void;
}

export default function FreeItemRequestModal({
  visible,
  onClose,
  listing,
  onSuccess,
}: FreeItemRequestModalProps) {
  const { language } = useLanguage();
  const [pickupDate, setPickupDate] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedWilayaName, setSelectedWilayaName] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [notes, setNotes] = useState('');
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWilayas();
  }, []);

  const loadWilayas = async () => {
    try {
      const { data, error } = await supabase
        .from('wilayas')
        .select('code, name')
        .order('code');

      if (error) throw error;
      setWilayas(data || []);
    } catch (error) {
      console.error('Error loading wilayas:', error);
    }
  };

  const handleWilayaChange = (code: string) => {
    setSelectedWilaya(code);
    const wilaya = wilayas.find(w => w.code === parseInt(code));
    setSelectedWilayaName(wilaya?.name || '');
    setSelectedCommune('');
  };

  const handleSubmit = async () => {
    setError('');

    if (!pickupDate) {
      setError(language === 'ar' ? 'يرجى اختيار تاريخ الاستلام' : language === 'en' ? 'Please select pickup date' : 'Veuillez sélectionner une date de récupération');
      return;
    }

    if (!selectedWilaya || !selectedCommune) {
      setError(language === 'ar' ? 'يرجى اختيار الولاية والبلدية' : language === 'en' ? 'Please select wilaya and commune' : 'Veuillez sélectionner une wilaya et une commune');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(language === 'ar' ? 'يجب تسجيل الدخول' : language === 'en' ? 'Must be logged in' : 'Vous devez être connecté');
        return;
      }

      const locationString = [selectedCommune, selectedWilayaName].filter(Boolean).join(', ');

      const { error: insertError } = await supabase.from('free_item_requests').insert({
        user_id: user.id,
        listing_id: listing.id,
        pickup_date: pickupDate,
        pickup_location: locationString,
        wilaya: selectedWilayaName,
        commune: selectedCommune,
        notes: notes || null,
        status: 'pending',
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(language === 'ar' ? 'خطأ في إنشاء الطلب' : language === 'en' ? 'Error creating request' : 'Erreur lors de la création de la demande');
        return;
      }

      if (Platform.OS === 'web') {
        alert(language === 'ar' ? 'تم إرسال الطلب بنجاح!' : language === 'en' ? 'Request sent successfully!' : 'Demande envoyée avec succès !');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Free item request error:', err);
      setError(language === 'ar' ? 'حدث خطأ' : language === 'en' ? 'An error occurred' : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPickupDate('');
    setSelectedWilaya('');
    setSelectedCommune('');
    setNotes('');
    setError('');
  };

  const translations = {
    title: {
      fr: 'Demande d\'article gratuit',
      en: 'Free Item Request',
      ar: 'طلب عنصر مجاني',
    },
    pickupDate: {
      fr: 'Date de récupération',
      en: 'Pickup Date',
      ar: 'تاريخ الاستلام',
    },
    pickupLocation: {
      fr: 'Lieu de récupération',
      en: 'Pickup Location',
      ar: 'مكان الاستلام',
    },
    wilaya: {
      fr: 'Wilaya',
      en: 'Wilaya',
      ar: 'الولاية',
    },
    commune: {
      fr: 'Commune',
      en: 'Commune',
      ar: 'البلدية',
    },
    notes: {
      fr: 'Message au donateur (optionnel)',
      en: 'Message to donor (optional)',
      ar: 'رسالة للمانح (اختياري)',
    },
    cancel: {
      fr: 'Annuler',
      en: 'Cancel',
      ar: 'إلغاء',
    },
    submit: {
      fr: 'Envoyer la demande',
      en: 'Submit Request',
      ar: 'إرسال الطلب',
    },
  };

  const t = (key: keyof typeof translations) => translations[key][language] || translations[key].fr;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <Text style={styles.freeTag}>🎁 GRATUIT</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Calendar size={16} color="#10B981" /> {t('pickupDate')}
              </Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e: any) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  value={pickupDate}
                  onChangeText={setPickupDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MapPin size={16} color="#10B981" /> {t('pickupLocation')}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('wilaya')} *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedWilaya}
                    onValueChange={handleWilayaChange}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionnez une wilaya" value="" />
                    {wilayas.map((wilaya) => (
                      <Picker.Item
                        key={wilaya.code}
                        label={`${wilaya.code} - ${wilaya.name}`}
                        value={wilaya.code.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <CommuneAutocomplete
                  label={`${t('commune')} *`}
                  placeholder="Rechercher..."
                  value={selectedCommune}
                  wilayaId={selectedWilaya}
                  wilayaName={selectedWilayaName}
                  onSelect={setSelectedCommune}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('notes')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Pourquoi souhaitez-vous cet article..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>{t('submit')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
  content: {
    padding: 20,
  },
  listingInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  freeTag: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
