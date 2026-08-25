import { Redirect } from 'expo-router';
import { useAuthContext } from '@/context/auth-context';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  if (isAdmin) {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(client)" />;
}
