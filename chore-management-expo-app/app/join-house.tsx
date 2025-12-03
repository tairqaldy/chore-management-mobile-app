import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { getAvailableHouses, joinHouse } from '@/services/houses';
import { HouseWithDetails } from '@/types';

export default function JoinHouseScreen() {
  const router = useRouter();
  const { user, emailVerified } = useAuth();
  const { currentHouse, loading: appLoading, refreshHouse } = useApp();
  const [houses, setHouses] = useState<HouseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    // Check email verification first
    if (user && !emailVerified) {
      router.replace('/verify-email');
      return;
    }

    if (user?.role !== 'tenant') {
      router.replace('/welcome');
      return;
    }

    // Wait for app context to finish loading before checking house
    if (!appLoading) {
      // If tenant already has a house, redirect to dashboard
      if (currentHouse) {
        router.replace('/(dashboard)');
        return;
      }

      loadHouses();
    }
  }, [user, emailVerified, currentHouse, appLoading]);

  const loadHouses = async () => {
    try {
      const availableHouses = await getAvailableHouses();
      setHouses(availableHouses);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHouse = async (houseId: string) => {
    setJoining(houseId);
    try {
      await joinHouse(houseId);
      await refreshHouse();
      router.replace('/(dashboard)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join house');
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.text} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>CHORES</Text>
      <Text style={styles.subtitle}>JOIN HOUSE</Text>

      {houses.length === 0 ? (
        <Text style={styles.emptyText}>No houses available</Text>
      ) : (
        <View style={styles.housesList}>
          {houses.map((house) => (
            <TouchableOpacity
              key={house.id}
              onPress={() => handleJoinHouse(house.id)}
              disabled={joining === house.id}
            >
              <Card style={styles.houseCard}>
                <Text style={styles.houseName}>{house.name}</Text>
                {house.description && (
                  <Text style={styles.houseDescription}>{house.description}</Text>
                )}
                <Text style={styles.houseInfo}>
                  {house.current_tenant_count || 0} / {house.max_tenants} tenants
                </Text>
                {house.host_username && (
                  <Text style={styles.houseInfo}>Host: {house.host_username}</Text>
                )}
                {joining === house.id && (
                  <ActivityIndicator size="small" color={Colors.text} style={styles.loading} />
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button
        title="SUBMIT"
        onPress={() => {
          if (houses.length > 0) {
            Alert.alert('Select a house', 'Please tap on a house to join');
          }
        }}
        style={styles.button}
        disabled={houses.length === 0}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  housesList: {
    marginBottom: 20,
  },
  houseCard: {
    marginBottom: 12,
  },
  houseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  houseDescription: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 8,
  },
  houseInfo: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  loading: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginVertical: 40,
  },
  button: {
    marginTop: 20,
  },
});

