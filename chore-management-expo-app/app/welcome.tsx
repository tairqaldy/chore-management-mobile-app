import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { isFirstTimeUser } from '@/utils/helpers';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentHouse, loading: appLoading } = useApp();

  useEffect(() => {
    // Wait for both auth and app context to finish loading
    if (!authLoading && !appLoading) {
      if (user) {
        // User is logged in - check if they have a house
        if (!currentHouse) {
          // No house - redirect to setup
          if (user.role === 'tenant') {
            router.replace('/join-house');
          } else {
            router.replace('/create-house');
          }
        } else {
          // Has house - go to dashboard
          router.replace('/(dashboard)');
        }
      }
      // If no user, stay on welcome screen
    }
  }, [user, authLoading, appLoading, currentHouse]);

  if (authLoading || appLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>CHORES</Text>
        </View>
      </View>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>WELCOME TO THE CHORES!!</Text>

        <Text style={styles.tagline}>
          Fair, clear, and effortless chore management for households who want better collaboration.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="LOGIN"
            onPress={() => router.push('/login')}
            style={styles.button}
          />

          <Button
            title="SIGN UP"
            onPress={() => router.push('/signup')}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '90%',
    backgroundColor: '#1A1A1D',
    borderRadius: 24,
    paddingVertical: 42,
    paddingHorizontal: 26,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,

    borderWidth: 1,
    borderColor: '#2A2A2E',
  },


  title: {
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
    color: '#6BCF8E', 
    marginBottom: 24,
    letterSpacing: 3,
  },

  tagline: {
    fontSize: 18,
    color: '#AFAFAF',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 18,
    fontWeight: 'bold',
  },

  buttonContainer: {
    width: '100%',
    gap: 16,
  },

  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#1E7D1E',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
});
