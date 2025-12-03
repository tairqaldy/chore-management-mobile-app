import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
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
  const { user, emailVerified } = useAuth();
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
    // Check email verification first
    if (user && !emailVerified) {
      router.replace('/verify-email');
      return;
    }

    if (user?.role !== 'host') {
      router.replace('/welcome');
      return;
    }
    
    // Wait for app context to finish loading before checking house
    if (!appLoading) {
      // If host already has a house, redirect to dashboard
      if (currentHouse) {
        router.replace('/(dashboard)');
      }
    }
  }, [user, emailVerified, currentHouse, appLoading]);

  // Watch for house to be set after creation
  useEffect(() => {
    if (houseCreated && currentHouse) {
      setLoading(false);
      router.replace('/(dashboard)');
    } else if (houseCreated && !currentHouse) {
      // If house was created but not loaded yet, try refreshing again
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
      // Mark that house was created
      setHouseCreated(true);
      // Refresh house in context - this will trigger the useEffect to redirect
      await refreshHouse();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create house');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
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
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
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
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
});

