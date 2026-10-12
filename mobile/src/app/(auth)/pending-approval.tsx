/**
 * (auth)/pending-approval.tsx
 *
 * KindLink Volunteer Pending Approval Screen
 * Displayed when a registered volunteer has completed verification but is waiting
 * for administrator approval before being granted access to the system.
 *
 * Rules:
 *  - Uses standard StyleSheet.create (no NativeWind/tailwind)
 *  - Safe Area handling via useSafeAreaInsets() and paddingTop: insets.top on root view
 *  - Follows KindLink 60-30-10 design system and typography
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { Palette, FunctionalColors } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function HourglassPendingIllustration({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="38" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="2.5" />
      <Path
        d="M28 26H52M28 54H52M32 26V33C32 37.4183 35.5817 40 40 40C44.4183 40 48 37.4183 48 33V26M32 54V47C32 42.5817 35.5817 40 40 40C44.4183 40 48 42.5817 48 47V54"
        stroke="#D97706"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="40" cy="47" r="2.5" fill="#D97706" />
      <Circle cx="40" cy="51" r="1.8" fill="#D97706" />
    </Svg>
  );
}

function CheckShieldIcon({ size = 20, color = FunctionalColors.success }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill="#ECFDF5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RefreshIcon({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 4v6h-6M1 20v-6h6"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogOutIcon({ size = 18, color = Palette.secondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17l5-5-5-5M21 12H9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function PendingApprovalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser, logout } = useAuthContext();

  const [isChecking, setIsChecking] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'danger'>('info');

  const handleCheckStatus = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    setFeedbackMessage(null);

    try {
      await refreshUser();
      // Inspect updated user directly after refresh
      if (user?.approvalStatus === 'approved') {
        setFeedbackType('success');
        setFeedbackMessage('Congratulations! Your volunteer application has been approved.');
        setTimeout(() => {
          router.replace('/(client)' as any);
        }, 1200);
      } else if (user?.approvalStatus === 'rejected') {
        setFeedbackType('danger');
        setFeedbackMessage(
          'Your volunteer application was reviewed and not approved at this time. Please contact support for more information.'
        );
      } else {
        setFeedbackType('info');
        setFeedbackMessage(
          'Your application is still under review by our administrator team. Please check back again shortly.'
        );
      }
    } catch {
      setFeedbackType('info');
      setFeedbackMessage('Could not check status right now. Please verify your internet connection.');
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, refreshUser, user?.approvalStatus, router]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (err) {
      Alert.alert('Sign Out', 'Could not sign out. Please try again.');
    }
  }, [logout, router]);

  const isRejected = user?.approvalStatus === 'rejected';

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* ─── Top Bar ─── */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>KindLink</Text>
          <View style={styles.volunteerPill}>
            <Text style={styles.volunteerPillText}>Volunteer</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.btnPressed]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sign out of account">
          <LogOutIcon size={16} color={Palette.secondary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ─── Hero Illustration & Title ─── */}
        <View style={styles.heroSection}>
          <View style={styles.illustrationWrap}>
            <HourglassPendingIllustration size={84} />
          </View>

          <Text style={styles.title}>
            {isRejected ? 'Application Declined' : 'Request Pending Approval'}
          </Text>

          <Text style={styles.subtitle}>
            {isRejected
              ? 'Your volunteer application was reviewed by our administrative team and could not be approved at this time.'
              : 'Thank you for registering to help our community! To protect our elderly members, all volunteer registrations must be reviewed and approved by an administrator before access is granted.'}
          </Text>
        </View>

        {/* ─── Feedback Banner ─── */}
        {!!feedbackMessage && (
          <View
            style={[
              styles.feedbackBanner,
              feedbackType === 'success' && styles.feedbackSuccess,
              feedbackType === 'danger' && styles.feedbackDanger,
              feedbackType === 'info' && styles.feedbackInfo,
            ]}
            accessibilityRole="alert">
            <Text
              style={[
                styles.feedbackText,
                feedbackType === 'success' && styles.feedbackSuccessText,
                feedbackType === 'danger' && styles.feedbackDangerText,
                feedbackType === 'info' && styles.feedbackInfoText,
              ]}>
              {feedbackMessage}
            </Text>
          </View>
        )}

        {/* ─── Application Summary Card ─── */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Application Summary</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Applicant</Text>
            <Text style={styles.fieldValue}>{user?.name || 'Volunteer'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue} numberOfLines={1}>
              {user?.email || 'N/A'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>NIC Document</Text>
            <View style={styles.statusPillSuccess}>
              <CheckShieldIcon size={14} color={FunctionalColors.success} />
              <Text style={styles.statusPillSuccessText}>Uploaded for Review</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Review Status</Text>
            <View
              style={[
                styles.statusPillPending,
                isRejected && styles.statusPillRejected,
              ]}>
              <Text
                style={[
                  styles.statusPillPendingText,
                  isRejected && styles.statusPillRejectedText,
                ]}>
                {isRejected ? 'Declined' : 'Pending Administrator Approval'}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── 3-Step Verification Timeline ─── */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardHeader}>Verification Progress</Text>

          {/* Step 1 */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotDone]}>
              <Text style={styles.timelineCheckText}>✓</Text>
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineTitleDone}>Step 1: Email Verified</Text>
              <Text style={styles.timelineSubDone}>Your identity was confirmed via OTP code.</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          {/* Step 2 */}
          <View style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                isRejected ? styles.timelineDotRejected : styles.timelineDotActive,
              ]}>
              <Text style={styles.timelineActiveDotText}>{isRejected ? '✕' : '2'}</Text>
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineTitleActive}>
                {isRejected ? 'Step 2: Review Completed' : 'Step 2: Admin Document Verification'}
              </Text>
              <Text style={styles.timelineSubActive}>
                {isRejected
                  ? 'Application reviewed by administration.'
                  : 'An administrator is verifying your credentials and NIC card.'}
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          {/* Step 3 */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotPending]}>
              <Text style={styles.timelinePendingDotText}>3</Text>
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineTitlePending}>Step 3: Platform Access Granted</Text>
              <Text style={styles.timelineSubPending}>
                You will be able to view elderly requests and coordinate assistance.
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Actions ─── */}
        <View style={styles.actionsContainer}>
          {!isRejected && (
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && !isChecking && styles.primaryBtnPressed,
                isChecking && styles.primaryBtnLoading,
              ]}
              onPress={handleCheckStatus}
              disabled={isChecking}
              accessibilityRole="button"
              accessibilityLabel="Check application approval status">
              {isChecking ? (
                <ActivityIndicator color={Palette.primary} size="small" />
              ) : (
                <View style={styles.btnContentRow}>
                  <RefreshIcon size={18} color={Palette.primary} />
                  <Text style={styles.primaryBtnText}>Check Approval Status</Text>
                </View>
              )}
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign out and return to login">
            <Text style={styles.secondaryBtnText}>Sign In with Another Account</Text>
          </Pressable>
        </View>

        {/* ─── Support Footer ─── */}
        <View style={styles.supportBox}>
          <Text style={styles.supportText}>
            Questions about your application? Contact our team at{' '}
            <Text style={styles.supportEmail}>support@kindlink.org</Text>
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    backgroundColor: Palette.primary,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.secondary,
    letterSpacing: -0.3,
  },
  volunteerPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  volunteerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.secondary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Palette.blueTint,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.secondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  illustrationWrap: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14.5,
    color: FunctionalColors.textSecondary,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  feedbackBanner: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
  },
  feedbackInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  feedbackSuccess: {
    backgroundColor: FunctionalColors.successBg,
    borderColor: '#A7F3D0',
  },
  feedbackDanger: {
    backgroundColor: FunctionalColors.dangerBg,
    borderColor: '#FECACA',
  },
  feedbackText: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '600',
  },
  feedbackInfoText: {
    color: Palette.secondary,
  },
  feedbackSuccessText: {
    color: FunctionalColors.successText,
  },
  feedbackDangerText: {
    color: FunctionalColors.dangerText,
  },
  card: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: Palette.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.ink,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: FunctionalColors.textSecondary,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 6,
  },
  statusPillSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: FunctionalColors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: FunctionalColors.successText,
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillPendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  statusPillRejected: {
    backgroundColor: FunctionalColors.dangerBg,
  },
  statusPillRejectedText: {
    color: FunctionalColors.dangerText,
  },
  timelineCard: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: Palette.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: {
    backgroundColor: FunctionalColors.success,
  },
  timelineCheckText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  timelineDotActive: {
    backgroundColor: '#D97706',
  },
  timelineActiveDotText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  timelineDotRejected: {
    backgroundColor: FunctionalColors.danger,
  },
  timelineDotPending: {
    backgroundColor: '#E5E7EB',
  },
  timelinePendingDotText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineCopy: {
    flex: 1,
  },
  timelineTitleDone: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
  },
  timelineSubDone: {
    fontSize: 12.5,
    color: FunctionalColors.textSecondary,
    marginTop: 2,
  },
  timelineTitleActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  timelineSubActive: {
    fontSize: 12.5,
    color: FunctionalColors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  timelineTitlePending: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timelineSubPending: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 13,
    marginVertical: 3,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: Palette.secondary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  primaryBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  primaryBtnLoading: {
    opacity: 0.7,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primary,
    borderWidth: 1.5,
    borderColor: Palette.border,
  },
  secondaryBtnText: {
    color: FunctionalColors.textSecondary,
    fontSize: 14.5,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.75,
  },
  supportBox: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  supportText: {
    fontSize: 12.5,
    color: FunctionalColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  supportEmail: {
    color: Palette.secondary,
    fontWeight: '700',
  },
});
