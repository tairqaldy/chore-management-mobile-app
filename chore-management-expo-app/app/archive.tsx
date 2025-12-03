import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ChoreList } from '@/components/ChoreList';
import { deleteChore } from '@/services/chores';
import { RoleIndicator } from '@/components/ui/RoleIndicator';

export default function ArchiveScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { archivedChores, refreshArchivedChores, refreshChores } = useApp();
  const { archivedChores, refreshArchivedChores } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load archived chores when screen mounts
    refreshArchivedChores();
  }, [refreshArchivedChores]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshArchivedChores();
    } catch (error) {
      console.error('Error refreshing archive:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshArchivedChores]);

  const handleDelete = useCallback(async (choreId: string) => {
    Alert.alert(
      'Delete Chore',
      'Are you sure you want to permanently delete this chore? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChore(choreId);
              await refreshArchivedChores();
              await refreshChores();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete chore');
            }
          },
        },
      ]
    );
  }, [refreshArchivedChores, refreshChores]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.text}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Ionicons name="archive" size={32} color={Colors.text} style={styles.titleIcon} />
            <Text style={styles.title}>ARCHIVE</Text>
          </View>
        </View>

        {user && (
          <RoleIndicator role={user.role} style={styles.roleIndicator} />
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.subtitle}>Completed and Archived Chores</Text>
          {archivedChores.length > 0 && (
            <Text style={styles.countText}>
              {archivedChores.length} {archivedChores.length === 1 ? 'chore' : 'chores'}
            </Text>
          )}
        </View>

        {archivedChores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={64} color={Colors.text} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No archived chores yet</Text>
            <Text style={styles.emptySubtext}>
              Complete chores and archive them to see them here
          <Text style={styles.title}>ARCHIVE</Text>
        </View>

        <Text style={styles.subtitle}>Completed and Archived Chores</Text>

        {archivedChores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No archived chores yet</Text>
            <Text style={styles.emptySubtext}>
              Swipe left on completed chores to archive them
            </Text>
          </View>
        ) : (
          <ChoreList
            chores={archivedChores}
            isHost={user?.role === 'host'}
            currentUserId={user?.id}
            onRefresh={refreshArchivedChores}
            onDelete={handleDelete}
            isArchiveView={true}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
  },
  roleIndicator: {
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  infoContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  countText: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    opacity: 0.4,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: Colors.text,
    opacity: 0.7,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text,
    opacity: 0.6,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 20,
  },
});

