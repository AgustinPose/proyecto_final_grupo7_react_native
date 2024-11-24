import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Feed", headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: "Buscar", headerShown: false }} />
    </Stack>
  );
}

