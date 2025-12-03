import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { createHouse } from '@/services/houses';

export default function CreateHouseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentHouse, loading: appLoading, refreshHouse } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxTenants, setMaxTenants] = useState('10');
  const [loading, setLoading] = useState(false);
  const [houseCreated, setHouseCreated] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    maxTenants?: string;
  }>({});

  useEffect(() => {
    if (user?.role !== 'host') {
      router.replace('/welcome');
      return;
    }

    if (!appLoading) {
      if (currentHouse) {
        router.replace('/(dashboard)');
      }
    }
  }, [user, currentHouse, appLoading]);

  useEffect(() => {
    if (houseCreated && currentHouse) {
      setLoading(false);
      router.replace('/(dashboard)');
    } else if (houseCreated && !currentHouse) {
      const retryRefresh = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await refreshHouse();
      };
      retryRefresh();
    }
  }, [houseCreated, currentHouse, refreshHouse]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'House name is required';
    }

    const maxTenantsNum = parseInt(maxTenants, 10);
    if (!maxTenants || isNaN(maxTenantsNum) || maxTenantsNum < 1) {
      newErrors.maxTenants = 'Please enter a valid number (minimum 1)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateHouse = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await createHouse({
        name: name.trim(),
        description: description.trim() || undefined,
        max_tenants: parseInt(maxTenants, 10),
      });

      setHouseCreated(true);
      await refreshHouse();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create house');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#6BCF8E" />
      </TouchableOpacity>

      <Text style={styles.title}>CHORES</Text>
      <Text style={styles.subtitle}>CREATE HOUSE</Text>

      <View style={styles.form}>
        <Input
          label="Name:"
          value={name}
          onChangeText={setName}
          placeholder="Enter house name"
          error={errors.name}
        />

        <Input
          label="Description:"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter house description (optional)"
          multiline
          numberOfLines={4}
        />

        <Input
          label="Number of Tenants:"
          value={maxTenants}
          onChangeText={setMaxTenants}
          placeholder="Enter maximum number of tenants"
          keyboardType="numeric"
          error={errors.maxTenants}
        />

        <Button
          title="CREATE"
          onPress={handleCreateHouse}
          loading={loading}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },

  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
    justifyContent: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 30,
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
    marginBottom: 36,
  },

  form: {
    width: '100%',
    backgroundColor: '#1A1A1D',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 22,

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,

    borderWidth: 1,
    borderColor: '#2A2A2E',
  },

  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#1E7D1E',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
});
