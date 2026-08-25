import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthContext } from '@/context/auth-context';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndex() {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FA' }}>
        <ActivityIndicator size="large" color="#1F5C96" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role?.toLowerCase() === 'admin') {
    return <Redirect href="/(admin)/users" />;
  }

  return <Redirect href="/(client)" />;
}
