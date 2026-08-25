import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, FunctionalColors } from '@/constants/theme';

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
          <Text style={[styles.buttonText, { color: Palette.ink }]}>Stay Logged Out (Guest)</Text>
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
    backgroundColor: Palette.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Palette.ink,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: FunctionalColors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: Palette.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: Palette.ink,
  },
  guestButton: {
    backgroundColor: Palette.blueTint,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  buttonText: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  adminText: {
    color: Palette.primary,
  }
});

