import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../../components/AuthContext";
import { router } from "expo-router";
import { API_BASE_URL } from "@/constants/config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { storeCredentials } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.message || "Credenciales incorrectas");
        return;
      }

      if (data.token) {
        await storeCredentials(data.token, data._id);
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert("Error", "Error de red, por favor inténtalo de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.brandTitle}>FakeInstagram</Text>

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

        <TouchableOpacity onPress={() => router.replace("auth/signup")}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  form: {
    width: "80%",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#262626",
    fontStyle: "italic",
  },
  input: {
    height: 44,
    borderColor: "#DBDBDB",
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 15,
    paddingLeft: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0095F6",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  linkText: {
    marginTop: 15,
    color: "#0095F6",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
