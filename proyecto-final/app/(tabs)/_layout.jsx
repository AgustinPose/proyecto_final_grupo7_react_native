import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from './index';
import SearchScreen from './searchScreen';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';

const Tab = createBottomTabNavigator();

export default function AppTabs() {

    return (
      <Tab.Navigator
      screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
              let icon;

              if (route.name === 'Feed') {
                  icon = faHome;
              } else if (route.name === 'Search') {
                  icon = faSearch;
              }

              return <FontAwesomeIcon icon={icon} color={color} size={size} />;
          },
      })}
  >
            <Tab.Screen name="Feed" component={Feed} />
            <Tab.Screen name="Search" component={SearchScreen} />
        </Tab.Navigator>
    );
}
