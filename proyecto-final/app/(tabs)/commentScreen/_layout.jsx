import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CommentsScreen from "./CommentsScreen";

const Stack = createStackNavigator();

export default function CommentsLayout() {
  return (
    <Stack.Navigator>
      {/* Pantalla principal de comentarios */}
      <Stack.Screen
        name="CommentsScreen"
        component={CommentsScreen}
        options={{
          title: "Comentarios", // Título que aparece en la barra superior
          headerShown: true, // Mostrar encabezado
        }}
      />
    </Stack.Navigator>
  );
}
