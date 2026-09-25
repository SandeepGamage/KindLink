/**
 * (auth)/verify-reset-code.tsx
 *
 * KindLink Verify Reset Code Screen
 * Step 2: User inputs the 6-digit code sent to their email.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { Palette, FunctionalColors } from '@/constants/theme';
import { authService, AuthError } from '@/services/auth.service';

function BackArrowIcon({ size = 20, color = Palette.secondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function VerifyResetCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [serverError, setServerError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<TextInput>(null);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setServerError('Please enter the full 6-digit code');
      return;
    }
    
    if (!email) {
      setServerError('Missing email address. Please go back and try again.');
      return;
    }

    setServerError(undefined);
    setIsLoading(true);

    try {
      await authService.verifyPasswordResetCode(email, code);
      // Success, navigate to reset password
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, code },
      } as any);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [code, email, router]);

  // Code input boxes logic
  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCode(cleaned.substring(0, 6));
    if (serverError) setServerError(undefined);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* Decorative background circles */}
      <View style={[styles.circle, styles.circleTopRight]} pointerEvents="none" />
      <View style={[styles.circle, styles.circleSmallRight]} pointerEvents="none" />
      <View style={[styles.circle, styles.circleBottomLeft]} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>

          <View style={styles.topHeader}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 14, bottom: 14, left: 16, right: 16 }}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <BackArrowIcon size={20} color={Palette.secondary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Enter Reset Code</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to{'\n'}
                <Text style={styles.boldEmail}>{email}</Text>
              </Text>
            </View>

            <View style={styles.form}>
              {!!serverError && (
                <View style={styles.serverErrorBanner} accessibilityRole="alert">
                  <Text style={styles.serverErrorText}>{serverError}</Text>
                </View>
              )}

              {/* Hidden input for keyboard handling */}
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleCodeChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={6}
                style={styles.hiddenInput}
                autoFocus
              />

              <Pressable 
                style={styles.codeContainer} 
                onPress={() => inputRef.current?.focus()}
              >
                {[...Array(6)].map((_, i) => {
                  const digit = code[i] || '';
                  const isActive = code.length === i || (code.length === 6 && i === 5);
                  return (
                    <View 
                      key={i} 
                      style={[
                        styles.codeBox,
                        isActive && styles.codeBoxActive,
                        !!digit && styles.codeBoxFilled,
                        !!serverError && styles.codeBoxError
                      ]}
                    >
                      <Text style={styles.codeText}>{digit}</Text>
                    </View>
                  );
                })}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading && styles.primaryButtonPressed,
                  isLoading && styles.primaryButtonLoading,
                ]}
                onPress={handleVerify}
                disabled={isLoading || code.length !== 6}
                accessibilityRole="button"
                accessibilityLabel="Verify code"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}>
                {isLoading ? (
                  <ActivityIndicator color={Palette.primary} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify Code</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 4,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backText: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.secondary,
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 32,
    marginTop: -40,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: Palette.blueTint,
  },
  circleTopRight: {
    width: 240,
    height: 240,
    top: -70,
    right: -70,
    opacity: 0.55,
  },
  circleSmallRight: {
    width: 140,
    height: 140,
    top: 130,
    right: -40,
    opacity: 0.35,
  },
  circleBottomLeft: {
    width: 200,
    height: 200,
    bottom: 40,
    left: -70,
    opacity: 0.4,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Palette.ink,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  boldEmail: {
    fontWeight: '700',
    color: Palette.ink,
  },
  form: {
    gap: 24,
  },
  serverErrorBanner: {
    backgroundColor: FunctionalColors.dangerBg,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: FunctionalColors.danger,
  },
  serverErrorText: {
    color: FunctionalColors.dangerText,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  codeBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  codeBoxActive: {
    borderColor: Palette.secondary,
    borderWidth: 2,
  },
  codeBoxFilled: {
    borderColor: Palette.blueTint,
    backgroundColor: Palette.blueTint,
  },
  codeBoxError: {
    borderColor: FunctionalColors.danger,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.ink,
  },
  primaryButton: {
    height: 56,
    backgroundColor: Palette.secondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: FunctionalColors.secondaryDark,
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  primaryButtonLoading: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: Palette.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
