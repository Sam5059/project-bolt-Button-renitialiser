import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

type DeliveryMethod = 'hand_delivery' | 'shipping' | 'pickup' | 'other';

interface DeliveryMethodSelectorProps {
  availableMethods: DeliveryMethod[];
  selectedMethod: DeliveryMethod | null;
  onSelect: (method: DeliveryMethod) => void;
  shippingPrice?: number | null;
  otherDeliveryInfo?: string | null;
}

export default function DeliveryMethodSelector({
  availableMethods,
  selectedMethod,
  onSelect,
  shippingPrice,
  otherDeliveryInfo
}: DeliveryMethodSelectorProps) {
  const { t, language } = useLanguage();

  const getMethodLabel = (method: DeliveryMethod): string => {
    switch (method) {
      case 'hand_delivery':
        return t('publish.delivery.handDelivery');
      case 'shipping':
        return t('publish.delivery.shipping');
      case 'pickup':
        return t('publish.delivery.pickup');
      case 'other':
        return t('publish.delivery.other');
      default:
        return method;
    }
  };

  const getMethodPrice = (method: DeliveryMethod): string | null => {
    if (method === 'shipping' && shippingPrice !== null && shippingPrice !== undefined) {
      return shippingPrice === 0 
        ? t('publish.delivery.freeShipping')
        : `${shippingPrice} ${t('common.currency')}`;
    }
    if (method === 'hand_delivery' || method === 'pickup') {
      return t('common.free');
    }
    return null;
  };

  if (availableMethods.length === 0) {
    return null;
  }

  if (availableMethods.length === 1) {
    const singleMethod = availableMethods[0];
    const price = getMethodPrice(singleMethod);
    
    return (
      <View style={styles.singleMethodContainer}>
        <Text style={styles.singleMethodLabel}>
          {t('cart.deliveryMethod')}:
        </Text>
        <Text style={styles.singleMethodText}>
          {getMethodLabel(singleMethod)}
          {price && <Text style={styles.priceText}> ({price})</Text>}
        </Text>
        {singleMethod === 'other' && otherDeliveryInfo && (
          <Text style={styles.otherInfoText}>{otherDeliveryInfo}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('cart.selectDeliveryMethod')}:</Text>
      {availableMethods.map((method) => {
        const isSelected = method === selectedMethod;
        const price = getMethodPrice(method);

        return (
          <TouchableOpacity
            key={method}
            style={[
              styles.methodButton,
              isSelected && styles.methodButtonSelected
            ]}
            onPress={() => onSelect(method)}
          >
            <View style={styles.methodContent}>
              <View style={styles.radioOuter}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <View style={styles.methodTextContainer}>
                <Text style={[
                  styles.methodText,
                  isSelected && styles.methodTextSelected
                ]}>
                  {getMethodLabel(method)}
                </Text>
                {price && (
                  <Text style={[
                    styles.methodPrice,
                    isSelected && styles.methodPriceSelected
                  ]}>
                    {price}
                  </Text>
                )}
                {method === 'other' && otherDeliveryInfo && isSelected && (
                  <Text style={styles.otherInfoSmall}>{otherDeliveryInfo}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  methodButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  methodButtonSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F7FF',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
  },
  methodTextContainer: {
    flex: 1,
  },
  methodText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  methodTextSelected: {
    color: '#0066CC',
    fontWeight: '600',
  },
  methodPrice: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  methodPriceSelected: {
    color: '#0066CC',
  },
  otherInfoSmall: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  singleMethodContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  singleMethodLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  singleMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  priceText: {
    fontWeight: '500',
    color: '#0066CC',
  },
  otherInfoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
