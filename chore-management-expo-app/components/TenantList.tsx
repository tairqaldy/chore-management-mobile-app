import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, House } from '@/types';
import { Card } from './ui/Card';
import { Colors } from '@/constants/theme';

interface TenantListProps {
  tenants: User[];
  currentHouse: House | null;
  currentUserId?: string;
  onRefresh: () => void;
  onRemove?: (tenantId: string) => void;
  completedTasksCount?: Record<string, number>; // userId -> completed tasks count
}

export function TenantList({ tenants, currentHouse, currentUserId, onRefresh, onRemove, completedTasksCount = {} }: TenantListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (tenants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No members yet</Text>
      </View>
    );
  }

  const isHost = (userId: string) => {
    return currentHouse?.host_id === userId;
  };

  const getCompletedTasks = (userId: string) => {
    return completedTasksCount[userId] || 0;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>
          MEMBERS ({tenants.length})
        </Text>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6BCF8E" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.listContainer}>
          {tenants.map((item) => {
            const itemIsHost = isHost(item.id);
            return (
              <View key={item.id} style={styles.tenantCard}>
                <View style={styles.tenantInfo}>
                  <View style={styles.tenantNameRow}>
                    <Text style={styles.tenantName}>{item.username}</Text>
                    {itemIsHost && (
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>HOST</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tenantEmail}>{item.email}</Text>
                </View>
                <View style={styles.rightSection}>
                  <View style={styles.completedTasksBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#6BCF8E" />
                    <Text style={styles.completedTasksText}>
                      {getCompletedTasks(item.id)} completed
                    </Text>
                  </View>
                  {onRemove && !itemIsHost && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemove(item.id)}
                    >
                      <Text style={styles.removeText}>REMOVE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2E',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6BCF8E',
  },
  listContainer: {
    gap: 8,
  },
  tenantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hostBadge: {
    backgroundColor: '#6BCF8E',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0E0E10',
    letterSpacing: 0.5,
  },
  tenantEmail: {
    fontSize: 12,
    color: '#AFAFAF',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedTasksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0A1A0A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6BCF8E',
  },
  completedTasksText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6BCF8E',
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#AFAFAF',
    opacity: 0.6,
    fontSize: 16,
  },
});

