import type { ReactNode } from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    // Centralized error logging point for app-level crashes.
    console.error('Unhandled app error:', error);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text accessibilityRole="header" style={styles.title}>
            Something went wrong
          </Text>
          <Text style={styles.subtitle}>Please restart the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#ffffff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6b7280' }
});
