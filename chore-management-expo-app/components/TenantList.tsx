import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { User } from '@/types';
import { Card } from './ui/Card';
import { Colors } from '@/constants/theme';

interface TenantListProps {
  tenants: User[];
  onRefresh: () => void;
  onRemove?: (tenantId: string) => void;
}

export function TenantList({ tenants, onRefresh, onRemove }: TenantListProps) {
  if (tenants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tenants yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tenants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.tenantCard}>
          <View style={styles.tenantInfo}>
            <Text style={styles.tenantName}>{item.username}</Text>
            <Text style={styles.tenantEmail}>{item.email}</Text>
          </View>
          {onRemove && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(item.id)}
            >
              <Text style={styles.removeText}>REMOVE</Text>
            </TouchableOpacity>
          )}
        </Card>
      )}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
          tintColor={Colors.text}
        />
      }
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text,
    opacity: 0.6,
    fontSize: 16,
  },
  tenantCard: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tenantEmail: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.statusRemove,
    borderRadius: 4,
  },
  removeText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

