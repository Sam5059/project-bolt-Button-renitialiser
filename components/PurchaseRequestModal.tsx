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
import { X, ShoppingBag, MapPin, CreditCard, Package } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import CommuneAutocomplete from './CommuneAutocomplete';
import { useLanguage } from '@/contexts/LanguageContext';

interface PurchaseRequestModalProps {
  visible: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    price: number;
    user_id: string;
  };
  onSuccess: () => void;
}

export default function PurchaseRequestModal({
  visible,
  onClose,
  listing,
  onSuccess,
}: PurchaseRequestModalProps) {
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState('1');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedWilayaName, setSelectedWilayaName] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
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

    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      setError(language === 'ar' ? 'الكمية غير صالحة' : language === 'en' ? 'Invalid quantity' : 'Quantité invalide');
      return;
    }

    if (!selectedWilaya || !selectedCommune) {
      setError(language === 'ar' ? 'يرجى اختيار الولاية والبلدية' : language === 'en' ? 'Please select wilaya and commune' : 'Veuillez sélectionner une wilaya et une commune');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال عنوان التسليم' : language === 'en' ? 'Please enter delivery address' : 'Veuillez entrer l\'adresse de livraison');
      return;
    }

    if (!paymentMethod) {
      setError(language === 'ar' ? 'يرجى اختيار طريقة الدفع' : language === 'en' ? 'Please select payment method' : 'Veuillez sélectionner un mode de paiement');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(language === 'ar' ? 'يجب تسجيل الدخول' : language === 'en' ? 'Must be logged in' : 'Vous devez être connecté');
        return;
      }

      const locationString = [deliveryAddress, selectedCommune, selectedWilayaName].filter(Boolean).join(', ');
      const totalAmount = listing.price * qty;

      const { error: insertError } = await supabase.from('purchase_requests').insert({
        user_id: user.id,
        listing_id: listing.id,
        quantity: qty,
        unit_price: listing.price,
        total_amount: totalAmount,
        delivery_address: locationString,
        wilaya: selectedWilayaName,
        commune: selectedCommune,
        payment_method: paymentMethod,
        notes: notes || null,
        status: 'pending',
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(language === 'ar' ? 'خطأ في إنشاء الطلب' : language === 'en' ? 'Error creating request' : 'Erreur lors de la création de la demande');
        return;
      }

      if (Platform.OS === 'web') {
        alert(language === 'ar' ? 'تم إنشاء الطلب بنجاح!' : language === 'en' ? 'Request created successfully!' : 'Demande créée avec succès !');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Purchase request error:', err);
      setError(language === 'ar' ? 'حدث خطأ' : language === 'en' ? 'An error occurred' : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuantity('1');
    setSelectedWilaya('');
    setSelectedCommune('');
    setDeliveryAddress('');
    setPaymentMethod('');
    setNotes('');
    setError('');
  };

  const totalAmount = parseInt(quantity) * listing.price || 0;

  const translations = {
    title: {
      fr: 'Demande d\'achat',
      en: 'Purchase Request',
      ar: 'طلب شراء',
    },
    quantity: {
      fr: 'Quantité',
      en: 'Quantity',
      ar: 'الكمية',
    },
    deliveryInfo: {
      fr: 'Informations de livraison',
      en: 'Delivery Information',
      ar: 'معلومات التسليم',
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
    address: {
      fr: 'Adresse de livraison',
      en: 'Delivery Address',
      ar: 'عنوان التسليم',
    },
    payment: {
      fr: 'Mode de paiement',
      en: 'Payment Method',
      ar: 'طريقة الدفع',
    },
    notes: {
      fr: 'Notes (optionnel)',
      en: 'Notes (optional)',
      ar: 'ملاحظات (اختياري)',
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
    total: {
      fr: 'Total',
      en: 'Total',
      ar: 'المجموع',
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
              <Text style={styles.priceText}>{listing.price.toLocaleString()} DA</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Package size={16} color="#2563EB" /> {t('quantity')}
              </Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MapPin size={16} color="#2563EB" /> {t('deliveryInfo')}
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('address')} *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholder="Rue, numéro, etc..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <CreditCard size={16} color="#2563EB" /> {t('payment')}
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={setPaymentMethod}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionnez un mode de paiement" value="" />
                  <Picker.Item label="CCP (Compte Chèque Postal)" value="ccp" />
                  <Picker.Item label="BaridiMob" value="baridimob" />
                  <Picker.Item label="Virement bancaire" value="bank_transfer" />
                  <Picker.Item label="Espèces à la livraison" value="cash_on_delivery" />
                </Picker>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('notes')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Informations complémentaires..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>

            {parseInt(quantity) > 0 && (
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Prix unitaire:</Text>
                  <Text style={styles.totalValue}>{listing.price.toLocaleString()} DA</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Quantité:</Text>
                  <Text style={styles.totalValue}>{quantity}</Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowFinal]}>
                  <Text style={styles.totalLabelFinal}>{t('total')}:</Text>
                  <Text style={styles.totalValueFinal}>{totalAmount.toLocaleString()} DA</Text>
                </View>
              </View>
            )}

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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 18,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  totalSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalRowFinal: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
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
    backgroundColor: '#2563EB',
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
