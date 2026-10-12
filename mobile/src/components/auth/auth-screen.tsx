import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { OrbitHero, type OrbitHeroProps } from '@/components/ui/orbit-hero';
import { Palette, FunctionalColors } from '@/constants/theme';

interface AuthScreenProps {
  children: React.ReactNode;
  /** Shows a round back button in the top-left corner */
  onBack?: () => void;
}

/**
 * Page shell for form-based auth screens: white canvas, safe-area padding,
 * keyboard avoidance and a vertically centred, scrollable column.
 */
export function AuthScreen({ children, onBack }: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.primary} />

      {onBack && (
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ChevronLeft size={22} color={Palette.ink} strokeWidth={2.4} />
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: onBack ? 8 : 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface AuthHeaderProps {
  hero: Pick<OrbitHeroProps, 'CenterIcon' | 'centerFilled' | 'badges'>;
  title: string;
  subtitle: string;
}

/** Compact brand hero with a title and subtitle, centred above an auth form */
export function AuthHeader({ hero, title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <OrbitHero {...hero} size={168} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

/** Red banner for server-level errors above a form */
export function AuthErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorBanner} accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

interface AuthFooterLinkProps {
  prompt: string;
  action: string;
  onPress: () => void;
}

/** Centred "Question? Action" text link, e.g. "New to KindLink? Create an account" */
export function AuthFooterLink({ prompt, action, onPress }: AuthFooterLinkProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.footerLink, pressed && styles.footerLinkPressed]}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`${prompt} ${action}`}>
      <Text style={styles.footerText}>
        {prompt} <Text style={styles.footerAction}>{action}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.primary,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: Palette.surface,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.ink,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: FunctionalColors.dangerBg,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: FunctionalColors.danger,
  },
  errorText: {
    color: FunctionalColors.dangerText,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  footerLinkPressed: {
    opacity: 0.7,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
  },
  footerAction: {
    fontWeight: '700',
    color: Palette.secondary,
  },
});
