import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface BadgeProps {
  count: number;
  max?: number;
  size?: 'small' | 'medium';
  color?: string;
}

export default function Badge({ count, max = 99, size = 'small', color = '#EF4444' }: BadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSmall : styles.badgeMedium,
        { backgroundColor: color },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isSmall ? styles.badgeTextSmall : styles.badgeTextMedium,
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }),
  },
  badgeSmall: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    top: -6,
    right: -6,
  },
  badgeMedium: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    top: -8,
    right: -8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
  badgeTextMedium: {
    fontSize: 12,
  },
});
