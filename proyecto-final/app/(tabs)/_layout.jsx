import React, { createContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faHome,
  faSearch,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Feed from "./index";
import SearchScreen from "./searchScreen";
import Postear from "./postear";
export const ImagenesContext = createContext();
import { createStackNavigator } from "@react-navigation/stack";
import CommentsSection from "./CommentsSection";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const FeedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CommentsSection"
        component={CommentsSection}
        options={{ presentation: "modal", headerShown: false }} // Puedes personalizar este header si lo deseas
      />
    </Stack.Navigator>
  );
};

export default function AppTabs() {
  const [imagenes, setImagenes] = useState([]); // Estado para almacenar imágenes publicadas

  // Función para agregar una imagen al feed
  const agregarImagen = (nuevaImagen) => {
    setImagenes((prevImagenes) => [nuevaImagen, ...prevImagenes]);
  };

  return (
    <ImagenesContext.Provider value={{ imagenes, agregarImagen }}>
      <Tab.Navigator
        initialRouteName="Feed" // Agregamos esto
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon;

            if (route.name === "Feed") {
              icon = faHome;
            } else if (route.name === "Search") {
              icon = faSearch;
            } else if (route.name === "Postear") {
              icon = faSquarePlus;
            }

            return <FontAwesomeIcon icon={icon} color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen
          name="Feed"
          component={FeedStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Postear" component={Postear} />
        <Tab.Screen name="Search" component={SearchScreen} />
      </Tab.Navigator>
    </ImagenesContext.Provider>
  );
}
