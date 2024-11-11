import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, Modal, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PerfilDefecto from '../../assets/images/perfilDefecto.jpg';
import { useNavigation } from '@react-navigation/native';

const Feed = ({ onLogout }) => {
    const navigation = useNavigation();
    const [friends, setFriends] = useState([]);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const currentUserId = '67045766b9179756fe4260df'; // Reemplazar con el ID actual del usuario
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQ1NzY2YjkxNzk3NTZmZTQyNjBkZiIsImlhdCI6MTczMDkxOTcyNiwiZXhwIjoxNzMzNTExNzI2fQ.EfzqxOt-tsYSHWHHG0vXlywkIWIajJ6c9zgnKX_6bBA'; // Reemplazar con el token de autenticación

    const handleFetchFeed = async () => {
        try {
            const response = await fetch('http://172.20.10.6:3001/api/posts/feed', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al obtener el feed');
            const data = await response.json();
            const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(sortedPosts);
        } catch (error) {
            console.error('Fetch feed error:', error);
        }
    };

    useEffect(() => {
        handleFetchFeed();
        fetchFriends();
    }, [token]);

    const fetchFriends = async () => {
        try {
            const response = await fetch('http://172.20.10.6:3001/api/user/all', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al obtener amigos');
            const data = await response.json();
            const filteredFriends = data.filter(friend => friend._id !== currentUserId);
            setFriends(filteredFriends);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFriendProfileClick = (friendId) => {
        navigation.navigate('UserProfile', { friendId });
    };

    const openPostDetails = (post) => {
        setSelectedPost(post);
    };

    const closePostDetails = () => {
        setSelectedPost(null);
    };

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderPost = ({ item: post }) => (
        <TouchableOpacity onPress={() => openPostDetails(post)} style={styles.postCard}>
            <Image source={{ uri: `http://172.20.10.6:3001/${post.imageUrl.replace(/\\/g, '/')}` }} style={styles.postImage} />
            <Text style={styles.postUsername}>{post.user.username}</Text>
            <Text>{post.caption}</Text>
        </TouchableOpacity>
    );

    const renderFriend = ({ item: friend }) => (
        <View style={styles.friendCard}>
            <Image source={{ uri: friend.profilePicture || PerfilDefecto }} style={styles.friendImage} />
            <Text style={styles.friendName}>{friend.username}</Text>
            <Button title="View" onPress={() => handleFriendProfileClick(friend._id)} />
        </View>
    );

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.appTitle}>FAKESTAGRAM</Text>
                <Icon name="logout" type="material" onPress={onLogout} />
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar amigo por nombre de usuario"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <Icon name="search" type="material" />
            </View>

            <FlatList
                data={filteredFriends}
                renderItem={renderFriend}
                keyExtractor={item => item._id}
                horizontal
                style={styles.friendList}
            />

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item._id}
                style={styles.postList}
            />

            {selectedPost && (
                <Modal visible={true} transparent={true} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text>{selectedPost.caption}</Text>
                        <Button title="Cerrar" onPress={closePostDetails} />
                    </View>
                </Modal>
            )}
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, padding: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    appTitle: { fontSize: 20, fontWeight: 'bold' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    searchInput: { flex: 1, padding: 5, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 10 },
    friendList: { marginBottom: 10, maxHeight: 80 },
    friendCard: { alignItems: 'center', marginRight: 10 },
    friendImage: { width: 50, height: 50, borderRadius: 25 },
    friendName: { fontSize: 14 },
    postList: { flex: 1 },
    postCard: { marginBottom: 15 },
    postImage: { width: '100%', height: 200 },
    postUsername: { fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
});

export default Feed;
