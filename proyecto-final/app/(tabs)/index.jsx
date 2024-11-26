
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useAuth } from '../../components/AuthContext';
import { router } from 'expo-router';
// import PerfilDefecto from '../../assets/images/perfilDefecto.jpg';
// import CommentsScreen from '../../components/CommentsScreen';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/config';

export default function Feed() {
    const navigation = useNavigation();
    const { token, userId, clearCredentials } = useAuth();
    // const [searchTerm, setSearchTerm] = useState('');
    // const [friends, setFriends] = useState([]);

    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const handleLogout = async () => {
        await clearCredentials();
        router.replace('auth/login');
    };

    const handleFetchFeed = async () => {
        setRefreshing(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/posts/feed`, // cambiar segun ip de tu red
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) {
                if (response.status === 401) {
                    await handleLogout();
                    return;
                }
            }
            const data = await response.json();
            const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(sortedPosts);
        } catch (error) {
            console.error('Fetch feed error:', error);
        }
        setRefreshing(false);
    };
    useEffect(() => { handleFetchFeed() }, [])

    useEffect(() => {
        if (!token) {
            router.replace('auth/login');
            return;
        }
        handleFetchFeed();
    }, [token]);

    const handleLikeToggle = async (postId, isLiked) => {
        try {
            const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, { //cambiar segun ip de tu red
                method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const updatedPost = await response.json();
                updatePostLikes(postId, updatedPost.likes);
            }
        } catch (error) {
            console.error("Error toggling like:", error);

        }
    };

    const updatePostLikes = (postId, newLikes) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId ? { ...post, likes: newLikes } : post
            )
        );
    };

    const handleComment = (postId, comments) => {
        navigation.navigate('CommentsScreen', { postId, initialComments: comments });
    };

    const renderPost = ({ item: post }) => {
        const isLikedByCurrentUser = post.likes.includes(userId);
        const likesCount = post.likes.length;

        return (
            <View style={styles.postCard}>
                <Image
                    source={{
                        uri: `${API_BASE_URL}/api/image/${post.imageUrl}`,
                        headers: { Authorization: `Bearer ${token}` }
                    }}
                    style={styles.postImage}
                />

                <Text style={styles.postUsername}>{post.user.username}</Text>
                <Text>{post.caption}</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => handleLikeToggle(post._id, isLikedByCurrentUser)}>
                        <Icon name="heart" type="material-community" color={isLikedByCurrentUser ? "#ff69b4" : "#808080"} />
                        <Text>{likesCount} Likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleComment(post._id, post.comments)}>
                        <Icon name="comment" type="material-community" color="#000" />
                        <Text>Ver Comentarios</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.appTitle}>FAKESTAGRAM</Text>

                    <Icon name="logout" type="material" onPress={handleLogout} />
                </View>
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={item => item._id}
                    style={styles.postList}
                    refreshing={refreshing}
                    onRefresh={() => { if (!refreshing) { handleFetchFeed() } }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, padding: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    appTitle: { fontSize: 20, fontWeight: 'bold' },
    friendList: { marginBottom: 10, maxHeight: 80 },
    friendCard: { alignItems: 'center', marginRight: 10 },
    friendImage: { width: 50, height: 50, borderRadius: 25 },
    friendName: { fontSize: 14 },
    postList: { flex: 1 },
    postCard: {
        marginBottom: 15,  // Espacio debajo de la tarjeta
        padding: 10,       // Espacio interno de la tarjeta
        backgroundColor: '#fff',  // Color de fondo blanco
        borderRadius: 5,   // Bordes redondeados
        overflow: 'hidden', // Para asegurar que los bordes redondeados de la imagen también se apliquen
    },

    postImage: {
        width: '100%',
        aspectRatio: 4 / 3,
        borderRadius: 10,
        marginVertical: 10,
        resizeMode: 'cover',
    },
    postUsername: { fontWeight: 'bold', marginVertical: 5 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }
});
