import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { UserRole } from '@/types';

interface RoleIndicatorProps {
  role: UserRole;
  style?: ViewStyle;
}

export function RoleIndicator({ role, style }: RoleIndicatorProps) {
  const isHost = role === 'host';

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.badge, isHost ? styles.hostBadge : styles.tenantBadge]}>
        <Text style={styles.badgeText}>{isHost ? 'HOST' : 'TENANT'}</Text>
      </View>
      <Text style={styles.caption}>
        {isHost ? 'You manage this house' : 'You are a tenant in this house'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.cardBackground,
  },
  hostBadge: {
    backgroundColor: Colors.button,
    borderColor: Colors.text,
  },
  tenantBadge: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.inputBorder,
  },
  badgeText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  caption: {
    color: Colors.text,
    opacity: 0.7,
    fontSize: 12,
  },
});
