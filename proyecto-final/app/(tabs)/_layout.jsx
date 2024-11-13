import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from './index';
import SearchScreen from './searchScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {

    return (
        <Tab.Navigator>
            <Tab.Screen name="Feed" component={Feed} />
            <Tab.Screen name="Search" component={SearchScreen} />
        </Tab.Navigator>
    );
}
