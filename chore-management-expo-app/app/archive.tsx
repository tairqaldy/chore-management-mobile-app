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
            tintColor="#6BCF8E"
          />
        }
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={26} color="#6BCF8E" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>CHORES</Text>
          <Text style={styles.subtitle}>ARCHIVE</Text>
        </View>

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
    backgroundColor: '#0E0E10',
  },
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#6BCF8E',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 20,
    color: '#AFAFAF',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#AFAFAF',
    opacity: 0.6,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AFAFAF',
    opacity: 0.5,
    textAlign: 'center',
  },
});
