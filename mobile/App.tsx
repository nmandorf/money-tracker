import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GroupsNavigator } from './src/features/groups/GroupsNavigator';
import { createRepository, openAppDatabase, type Repository } from './src/persistence';

type AppProps = {
  repository?: Repository;
};

export default function App({ repository }: AppProps) {
  const [runtimeRepository, setRuntimeRepository] = useState<Repository | null>(repository ?? null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    if (repository) {
      return;
    }

    const bootstrap = async () => {
      try {
        const db = await openAppDatabase();
        setRuntimeRepository(createRepository(db));
        setLoadingError(null);
      } catch {
        setLoadingError('Unable to initialize local database.');
      }
    };

    void bootstrap();
  }, [repository]);

  if (!runtimeRepository) {
    return (
      <View style={styles.container}>
        {loadingError ? <Text style={styles.error}>{loadingError}</Text> : null}
        {!loadingError ? <ActivityIndicator size="large" /> : null}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <GroupsNavigator repository={runtimeRepository} />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  error: {
    color: '#b91c1c'
  }
});
