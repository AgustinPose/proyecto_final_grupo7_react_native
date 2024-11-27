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
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { storeCredentials } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://10.0.2.2:3001/api/auth/login", {
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
        await storeCredentials(data.token, data._id); // Guarda token e id
        router.replace("/(tabs)"); // Redirecciona al feed después del login
      }
    } catch (error) {
      Alert.alert("Error", "Error de red, por favor inténtalo de nuevo.");
    }
  };

  return (
    <SafeAreaView>
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

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Los estilos siguen igual

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  form: {
    width: "80%",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 15,
    color: "#007bff",
    textAlign: "center",
  },
});
