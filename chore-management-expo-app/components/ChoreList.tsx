import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Chore } from '@/types';
import { ChoreItem } from './ChoreItem';
import { Colors } from '@/constants/theme';

interface ChoreListProps {
  chores: Chore[];
  isHost: boolean;
  currentUserId?: string;
  onRefresh: () => void;
  onComplete?: (choreId: string) => void;
  onAssign?: (choreId: string) => void;
  onArchive?: (choreId: string) => void;
<<<<<<< HEAD
  onDelete?: (choreId: string) => void;
  isArchiveView?: boolean;
}

export function ChoreList({ chores, isHost, currentUserId, onRefresh, onComplete, onAssign, onArchive, onDelete, isArchiveView }: ChoreListProps) {
=======
}

export function ChoreList({ chores, isHost, currentUserId, onRefresh, onComplete, onAssign, onArchive }: ChoreListProps) {
>>>>>>> origin
  if (chores.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chores yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ChoreItem
          chore={item}
          isHost={isHost}
          currentUserId={currentUserId}
          onComplete={onComplete}
          onAssign={onAssign}
          onArchive={onArchive}
<<<<<<< HEAD
          onDelete={onDelete}
          isArchiveView={isArchiveView}
=======
>>>>>>> origin
        />
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
});

