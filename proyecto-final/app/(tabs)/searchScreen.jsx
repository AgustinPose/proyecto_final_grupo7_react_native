import React, { useState } from 'react';
import { View, Text, Image, FlatList, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PerfilDefecto from '../../assets/images/perfilDefecto.jpg';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigation = useNavigation();
    const currentUserId = '67045766b9179756fe4260df'; // Reemplazar con el ID actual del usuario
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQ1NzY2YjkxNzk3NTZmZTQyNjBkZiIsImlhdCI6MTczMDkxOTcyNiwiZXhwIjoxNzMzNTExNzI2fQ.EfzqxOt-tsYSHWHHG0vXlywkIWIajJ6c9zgnKX_6bBA'; // Reemplazar con el token de autenticación

    // Función para obtener amigos del backend en base al término de búsqueda
    const fetchFriends = async (term) => {
        if (!term) {
            setFriends([]);
            return;
        }
        
        try {
            const response = await fetch('http://172.20.10.4:3001/api/user/all', { // Edita la IP según tu red
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al obtener amigos');
            const data = await response.json();
            // Filtra amigos que coincidan con el término de búsqueda y excluye al usuario actual
            const filteredFriends = data
                .filter(friend => friend._id !== currentUserId && friend.username.toLowerCase().includes(term.toLowerCase()));
            setFriends(filteredFriends);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    // Renderizar cada amigo en la lista
    const renderFriend = ({ item: friend }) => (
        <View style={styles.friendCard}>
            <Image source={friend.profilePicture ? { uri: friend.profilePicture } : PerfilDefecto} style={styles.friendImage} />
            <Text style={styles.friendName}>{friend.username}</Text>
            <Button title="Ver" onPress={() => navigation.navigate('UserProfile', { friendId: friend._id })} />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar amigo por nombre de usuario"
                    value={searchTerm}
                    onChangeText={(text) => {
                        setSearchTerm(text);
                        fetchFriends(text);
                    }}
                />
                <Icon name="search" type="material" />
            </View>

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
    safeArea: { flex: 1, padding: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    searchInput: { flex: 1, padding: 5, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 10 },
    friendList: { marginBottom: 10 },
    friendCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
    friendImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    friendName: { fontSize: 16, fontWeight: 'bold' },
});

export default SearchScreen;
