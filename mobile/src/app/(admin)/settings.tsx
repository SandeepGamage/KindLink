import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { MaxContentWidth } from '@/constants/theme';

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, logout } = useAuthContext();

  const [requireIdVerification, setRequireIdVerification] = React.useState(true);
  const [autoMatchAlgorithm, setAutoMatchAlgorithm] = React.useState(true);
  const [sosInstantBroadcast, setSosInstantBroadcast] = React.useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#090D16' : '#F0F6FE',
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text
            style={[
              styles.pageTitle,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}>
            Platform Settings
          </Text>
          <Text
            style={[
              styles.pageSubtitle,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            Configure safety thresholds, security, and KindLink system controls
          </Text>
        </View>

        {/* Admin Profile Box */}
        <View
          style={[
            styles.adminCard,
            {
              backgroundColor: isDark ? '#131D31' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>A</Text>
          </View>
          <View style={styles.adminInfo}>
            <Text
              style={[
                styles.adminName,
                { color: isDark ? '#FFFFFF' : '#0F172A' },
              ]}>
              {user?.name || 'KindLink System Administrator'}
            </Text>
            <Text
              style={[
                styles.adminEmail,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              {user?.email || 'admin@kindlink.org'}
            </Text>
          </View>
        </View>

        {/* Security & Verification Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}>
            Platform Safety Controls
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#131D31' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text
                  style={[
                    styles.switchTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  Mandatory ID Verification
                </Text>
                <Text
                  style={[
                    styles.switchSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Require government ID approval before accepting volunteer tasks
                </Text>
              </View>
              <Switch
                value={requireIdVerification}
                onValueChange={setRequireIdVerification}
                trackColor={{ false: '#767577', true: '#1D61E7' }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text
                  style={[
                    styles.switchTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  Smart Geolocation Matcher
                </Text>
                <Text
                  style={[
                    styles.switchSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Automatically match seniors with the closest available volunteers
                </Text>
              </View>
              <Switch
                value={autoMatchAlgorithm}
                onValueChange={setAutoMatchAlgorithm}
                trackColor={{ false: '#767577', true: '#1D61E7' }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text
                  style={[
                    styles.switchTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  Emergency SOS Broadcast
                </Text>
                <Text
                  style={[
                    styles.switchSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Send instant SMS & push alerts to first responders and nearest verified helpers
                </Text>
              </View>
              <Switch
                value={sosInstantBroadcast}
                onValueChange={setSosInstantBroadcast}
                trackColor={{ false: '#767577', true: '#1D61E7' }}
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.8 : 1 },
          ]}>
          <Text style={styles.logoutBtnText}>Log Out from Admin Portal</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 20,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  adminAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '700',
  },
  adminEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 14,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
});
