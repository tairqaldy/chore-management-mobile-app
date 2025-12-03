import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { getAvailableHouses, joinHouse } from '@/services/houses';
import { HouseWithDetails } from '@/types';

export default function JoinHouseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentHouse, loading: appLoading, refreshHouse } = useApp();

  const [houses, setHouses] = useState<HouseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
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
  }, [user, currentHouse, appLoading]);

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
      
      {/*<TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/welcome')}
      >
        <Ionicons name="arrow-back" size={26} color="#6BCF8E" />
      </TouchableOpacity>
      Commented out as we cant go back to welcome screen from join house screen (Tair)
      */}

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
                  <Text style={styles.houseDescription}>
                    {house.description}
                  </Text>
                )}

                <Text style={styles.houseInfo}>
                  {house.current_tenant_count || 0} / {house.max_tenants} tenants
                </Text>

                {house.host_username && (
                  <Text style={styles.houseInfo}>
                    Host: {house.host_username}
                  </Text>
                )}

                {joining === house.id && (
                  <ActivityIndicator
                    size="small"
                    color={Colors.text}
                    style={styles.loading}
                  />
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/*<Button
        title="SUBMIT"
        onPress={() => {
          if (houses.length > 0) {
            Alert.alert('Select a house', 'Please tap on a house to join');
          }
        }}
        style={styles.button}
        disabled={houses.length === 0}
      />    
      
      Commented out for now as we have on touch house join functionality (Tair)
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    top: 50,    
    left: 20,
    zIndex: 10,
    padding: 8,
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

  housesList: {
    marginBottom: 20,
  },

  houseCard: {
    marginBottom: 12,
    backgroundColor: '#1A1A1D',
    borderRadius: 18,
    padding: 16,

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,

    borderWidth: 1,
    borderColor: '#2A2A2E',
  },

  houseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  houseDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },

  houseInfo: {
    fontSize: 12,
    color: '#AFAFAF',
    marginTop: 4,
  },

  loading: {
    marginTop: 8,
  },

  emptyText: {
    fontSize: 16,
    color: '#AFAFAF',
    textAlign: 'center',
    marginVertical: 40,
  },

  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#1E7D1E',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
});
