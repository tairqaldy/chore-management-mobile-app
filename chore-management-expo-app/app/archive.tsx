import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ChoreList } from '@/components/ChoreList';

export default function ArchiveScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
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
  },
});
