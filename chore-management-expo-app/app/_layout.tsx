import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { Colors } from '@/constants/theme';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppProvider>
          <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              gestureEnabled: false, // Disable swipe back gesture
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="verify-email" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="join-house" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="create-house" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="archive" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
          <StatusBar style="light" />
        </View>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
