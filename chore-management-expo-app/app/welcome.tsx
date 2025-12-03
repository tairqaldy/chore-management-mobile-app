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
  const { user, loading: authLoading, emailVerified } = useAuth();
  const { currentHouse, loading: appLoading } = useApp();

  useEffect(() => {
    // Wait for both auth and app context to finish loading
    if (!authLoading && !appLoading) {
      if (user) {
        // Check if email is verified first
        if (!emailVerified) {
          router.replace('/verify-email');
          return;
        }
        
        // User is logged in and email is verified - check if they have a house
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
  }, [user, authLoading, appLoading, currentHouse, emailVerified]);

  if (authLoading || appLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>CHORES</Text>
      </View>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CHORES</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
});

