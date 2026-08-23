import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const { setRole } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mock Sign In</Text>
      <Text style={styles.subtitle}>
        Select a role below to simulate logging in. This will be replaced by the real auth flow.
      </Text>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => setRole('user')}>
          <Text style={styles.buttonText}>Login as Client User</Text>
        </Pressable>
        
        <Pressable style={[styles.button, styles.adminButton]} onPress={() => setRole('admin')}>
          <Text style={[styles.buttonText, styles.adminText]}>Login as Admin</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.guestButton]} onPress={() => setRole('guest')}>
          <Text style={styles.buttonText}>Stay Logged Out (Guest)</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#333',
  },
  guestButton: {
    backgroundColor: '#e5e5e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  adminText: {
    color: '#fff',
  }
});
