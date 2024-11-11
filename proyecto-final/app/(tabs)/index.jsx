import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.logoContainer}>
        <Ionicons name="leaf" size={100} color="#A1CEDC" />
        <ThemedText type="title">Welcome</ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <ThemedView style={styles.button}>
          <ThemedText type="subtitle">Login</ThemedText>
        </ThemedView>

        <ThemedView style={styles.button}>
          <ThemedText type="subtitle">Register</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#A1CEDC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  }
});
