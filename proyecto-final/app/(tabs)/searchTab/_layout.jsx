import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from './searchScreen';
import UserProfileFriend from '../../../components/UserProfileFriend';

const SearchStack = createStackNavigator();

export default function SearchTab() {
  return (
    <SearchStack.Navigator initialRouteName="SearchScreen">
      <SearchStack.Screen 
        name="SearchScreen" 
        component={SearchScreen} 
        options={{ title: 'Buscar' }} 
      />
      <SearchStack.Screen 
        name="UserProfileFriend" 
        component={UserProfileFriend} 
        options={({ route }) => ({ title: route.params?.username || 'Perfil' })}
      />
    </SearchStack.Navigator>
  );
}
