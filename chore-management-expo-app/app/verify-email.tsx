import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { user, session, emailVerified, checkEmailVerification, resendVerificationEmail, signOut } = auth;
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Redirect if email is verified
  useEffect(() => {
    if (emailVerified && user) {
      router.replace('/welcome');
    }
  }, [emailVerified, user]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await resendVerificationEmail();
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        Alert.alert('Email Verified!', 'Your email has been confirmed. You can now use the app.');
        // The AuthContext will automatically update and redirect
      } else {
        Alert.alert('Not Verified', 'Your email is not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check verification status');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/welcome');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  // If no user, show loading or redirect to welcome
  useEffect(() => {
    if (!auth.loading && !user) {
      router.replace('/welcome');
    }
  }, [auth.loading, user]);

  if (auth.loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name="mail-outline" size={80} color={Colors.text} />
      </View>

      <Text style={styles.title}>CHORES</Text>
      <Text style={styles.subtitle}>VERIFY YOUR EMAIL</Text>

      <View style={styles.messageContainer}>
        <Text style={styles.message}>
          We've sent a verification email to:
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.instructions}>
          Please check your inbox and click the verification link to confirm your email address.
        </Text>
        <Text style={styles.instructions}>
          You won't be able to use the app until your email is verified.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="CHECK VERIFICATION"
          onPress={handleCheckVerification}
          loading={checking}
          style={styles.button}
        />
        <Button
          title="RESEND EMAIL"
          onPress={handleResendEmail}
          loading={loading}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title="SIGN OUT"
          onPress={handleSignOut}
          variant="secondary"
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
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
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
  messageContainer: {
    width: '100%',
    marginBottom: 40,
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
});

