import React, { createContext, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from './index';
import SearchScreen from './searchScreen';
import Postear from './postear';

export const ImagenesContext = createContext();

const Tab = createBottomTabNavigator();

export default function AppTabs() {
    const [imagenes, setImagenes] = useState([]); // Estado para almacenar imágenes publicadas

    // Función para agregar una imagen al feed
    const agregarImagen = (nuevaImagen) => {
        setImagenes((prevImagenes) => [nuevaImagen, ...prevImagenes]);
    };

    return (
        <ImagenesContext.Provider value={{ imagenes, agregarImagen }}>
            <Tab.Navigator>
                <Tab.Screen name="Feed" component={Feed} />
                <Tab.Screen name="Postear" component={Postear} />
                <Tab.Screen name="Search" component={SearchScreen} />
            </Tab.Navigator>
        </ImagenesContext.Provider>
    );
}
