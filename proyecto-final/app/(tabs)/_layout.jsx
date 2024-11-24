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
const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

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
        <Tab.Screen name="Feed" component={Feed} />
        <Tab.Screen name="Postear" component={Postear} />
        <Tab.Screen name="Search" component={SearchScreen} />
      </Tab.Navigator>
    </ImagenesContext.Provider>
  );
}
