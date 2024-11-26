import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TextInput, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PerfilDefecto from '../../../assets/images/perfilDefecto.jpg';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../../../constants/config';
import { useAuth } from '../../../components/AuthContext';

const SearchScreen = () => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();
  const { token, userId } = useAuth();


  // Función para obtener amigos del backend en base al término de búsqueda
  const fetchFriends = async (term) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/all`, { // Edita la IP según tu red
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener amigos');
      const data = await response.json();
      // Filtra amigos que coincidan con el término de búsqueda y excluye al usuario actual
      const filteredFriends = data
        .filter(friend => friend._id !== userId && friend.username.toLowerCase().includes(term.toLowerCase()));
      setFriends(filteredFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Maneja el cambio en el término de búsqueda con un "debounce"
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(() => {
        fetchFriends(searchTerm);
      }, 500); // Retraso de 500 ms para reducir las llamadas

      return () => clearTimeout(delayDebounceFn);
    } else {
      setFriends([]);
    }
  }, [searchTerm]);

  const handleFriendProfileClick = (userId) => {
    navigation.navigate('UserProfileFriend', { friendId: userId });
  }

  // Renderizar cada amigo en la lista
  const renderFriend = ({ item: friend }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => handleFriendProfileClick(friend._id)}
    >
      <Image source={friend.profilePicture ? { uri: friend.profilePicture } : PerfilDefecto} style={styles.friendImage} />
      <Text style={styles.friendName}>{friend.username}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Icon name="search" type="material" />
      </View>

      {!isSearching && friends.length === 0 && searchTerm.length > 0 && (
        <Text style={styles.noResultsText}>No se encontraron usuarios.</Text>
      )}


      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={item => item._id}
        style={styles.friendList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  friendList: {
    marginBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  }
});


export default SearchScreen;
