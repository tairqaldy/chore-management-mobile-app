import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { isValidEmail, isValidPassword, isValidUsername } from '@/utils/helpers';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    role?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (!isValidUsername(username)) {
      newErrors.username = 'Username must be at least 3 characters (letters, numbers, underscores only)';
    }

    if (!role) {
      newErrors.role = 'Please choose your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate() || !role) return;

    setLoading(true);
    try {
      await signUp(email, password, username, role);
      // After signup, redirect to welcome screen
      router.replace('/welcome');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={26} color="#6BCF8E" />
      </TouchableOpacity>
      
      <Text style={styles.title}>CHORES</Text>
      <Text style={styles.subtitle}>SIGN UP</Text>

      <View style={styles.form}>
        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          autoCapitalize="none"
          error={errors.username}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
          error={errors.password}
        />

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Choose your role:</Text>
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'tenant' && styles.roleButtonSelected,
              ]}
              onPress={() => setRole('tenant')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'tenant' && styles.roleButtonTextSelected,
                ]}
              >
                Tenant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'host' && styles.roleButtonSelected,
              ]}
              onPress={() => setRole('host')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'host' && styles.roleButtonTextSelected,
                ]}
              >
                Host
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="CONTINUE"
          onPress={handleSignup}
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
    top: 60,
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
  form: {
    width: '100%',
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: Colors.button,
    borderColor: Colors.button,
  },
  roleButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  roleButtonTextSelected: {
    color: Colors.text,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    marginTop: 8,
  },
});

