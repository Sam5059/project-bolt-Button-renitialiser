import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { X, Phone, MessageCircle, Copy } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/locales/translations';

interface ContactOption {
  type: 'phone' | 'whatsapp' | 'messenger' | 'copy';
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface ContactOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  sellerName: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  messengerUsername?: string;
}

export default function ContactOptionsModal({
  visible,
  onClose,
  sellerName,
  phoneNumber,
  whatsappNumber,
  messengerUsername,
}: ContactOptionsModalProps) {
  const { language } = useLanguage();

  const translations: Record<Language, {
    title: string;
    call: string;
    whatsapp: string;
    messenger: string;
    copy: string;
    copied: string;
    noPhone: string;
    close: string;
  }> = {
    fr: {
      title: 'Contacter le vendeur',
      call: 'Appeler',
      whatsapp: 'WhatsApp',
      messenger: 'Messenger',
      copy: 'Copier le numéro',
      copied: 'Numéro copié !',
      noPhone: 'Aucun numéro disponible',
      close: 'Fermer',
    },
    en: {
      title: 'Contact seller',
      call: 'Call',
      whatsapp: 'WhatsApp',
      messenger: 'Messenger',
      copy: 'Copy number',
      copied: 'Number copied!',
      noPhone: 'No number available',
      close: 'Close',
    },
    ar: {
      title: 'اتصل بالبائع',
      call: 'اتصال',
      whatsapp: 'واتساب',
      messenger: 'ماسنجر',
      copy: 'نسخ الرقم',
      copied: 'تم نسخ الرقم!',
      noPhone: 'لا يوجد رقم متاح',
      close: 'إغلاق',
    },
  };

  const t = translations[language];

  // Format phone number for WhatsApp (remove spaces, dashes, etc.)
  const formatWhatsAppNumber = (number: string): string => {
    // Remove all non-digit characters except +
    const cleaned = number.replace(/[^\d+]/g, '');
    // Ensure it starts with +
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  const handleCall = (number: string) => {
    const telUrl = `tel:${number}`;
    Linking.canOpenURL(telUrl).then((supported) => {
      if (supported) {
        Linking.openURL(telUrl);
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : language === 'en' ? 'Error' : 'Erreur',
          language === 'ar'
            ? 'لا يمكن فتح تطبيق الهاتف'
            : language === 'en'
            ? 'Cannot open phone app'
            : 'Impossible d\'ouvrir l\'application téléphone'
        );
      }
    });
    onClose();
  };

  const handleWhatsApp = (number: string) => {
    const formatted = formatWhatsAppNumber(number);
    const message = language === 'ar' 
      ? 'مرحبا، أنا مهتم بإعلانك'
      : language === 'en'
      ? 'Hello, I\'m interested in your listing'
      : 'Bonjour, je suis intéressé par votre annonce';
    
    const whatsappUrl = `https://wa.me/${formatted.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : language === 'en' ? 'Error' : 'Erreur',
          language === 'ar'
            ? 'لا يمكن فتح واتساب'
            : language === 'en'
            ? 'Cannot open WhatsApp'
            : 'Impossible d\'ouvrir WhatsApp'
        );
      }
    });
    onClose();
  };

  const handleMessenger = (username: string) => {
    const messengerUrl = `https://m.me/${username}`;
    
    Linking.canOpenURL(messengerUrl).then((supported) => {
      if (supported) {
        Linking.openURL(messengerUrl);
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : language === 'en' ? 'Error' : 'Erreur',
          language === 'ar'
            ? 'لا يمكن فتح ماسنجر'
            : language === 'en'
            ? 'Cannot open Messenger'
            : 'Impossible d\'ouvrir Messenger'
        );
      }
    });
    onClose();
  };

  const handleCopy = async (number: string) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(number);
      } else {
        // For React Native/Expo, use expo-clipboard
        const { setStringAsync } = await import('expo-clipboard');
        await setStringAsync(number);
      }
      Alert.alert(t.copied);
    } catch (err) {
      console.error('Failed to copy:', err);
      Alert.alert(
        language === 'ar' ? 'خطأ' : language === 'en' ? 'Error' : 'Erreur',
        language === 'ar'
          ? 'فشل نسخ الرقم'
          : language === 'en'
          ? 'Failed to copy number'
          : 'Impossible de copier le numéro'
      );
    }
    onClose();
  };

  // Build available options based on provided data
  const options: ContactOption[] = [];

  // Phone call option (primary phone number)
  if (phoneNumber) {
    options.push({
      type: 'phone',
      label: t.call,
      value: phoneNumber,
      icon: <Phone size={24} color="#FFFFFF" strokeWidth={2} />,
      color: '#10B981',
      action: () => handleCall(phoneNumber),
    });
  }

  // WhatsApp option (use whatsappNumber if available, otherwise fall back to phoneNumber)
  const whatsappTarget = whatsappNumber || phoneNumber;
  if (whatsappTarget) {
    options.push({
      type: 'whatsapp',
      label: t.whatsapp,
      value: whatsappTarget,
      icon: <MessageCircle size={24} color="#FFFFFF" strokeWidth={2} />,
      color: '#25D366',
      action: () => handleWhatsApp(whatsappTarget),
    });
  }

  // Messenger option (only if username is provided)
  if (messengerUsername) {
    options.push({
      type: 'messenger',
      label: t.messenger,
      value: messengerUsername,
      icon: <MessageCircle size={24} color="#FFFFFF" strokeWidth={2} />,
      color: '#0084FF',
      action: () => handleMessenger(messengerUsername),
    });
  }

  // Copy number option (primary phone number)
  if (phoneNumber) {
    options.push({
      type: 'copy',
      label: t.copy,
      value: phoneNumber,
      icon: <Copy size={24} color="#FFFFFF" strokeWidth={2} />,
      color: '#6B7280',
      action: () => handleCopy(phoneNumber),
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={[styles.modalContent, language === 'ar' && styles.modalContentRTL]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.sellerName}>{sellerName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          {options.length > 0 ? (
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionButton,
                    { backgroundColor: option.color },
                    index === options.length - 1 && styles.lastOptionButton,
                  ]}
                  onPress={option.action}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionIconContainer}>{option.icon}</View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {option.type !== 'messenger' && (
                      <Text style={styles.optionValue} numberOfLines={1}>
                        {option.value}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noPhoneContainer}>
              <Text style={styles.noPhoneText}>{t.noPhone}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContentRTL: {
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lastOptionButton: {
    marginBottom: 0,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  noPhoneContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noPhoneText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
