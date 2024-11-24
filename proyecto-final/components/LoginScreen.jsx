import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/constants/config';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { storeCredentials } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, { //edita segun ip de tu red
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Credenciales incorrectas');
        return;
      }

      if (data.token) {
        await storeCredentials(data.token, data._id);
        router.replace('/');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red, por favor inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Login</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('auth/signup')}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}