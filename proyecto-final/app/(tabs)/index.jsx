import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useAuth } from '../../components/AuthContext';
import { router } from 'expo-router';
import PerfilDefecto from '../../assets/images/perfilDefecto.jpg';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';

export default function Feed() {
    const navigation = useNavigation();
    const { token, userId, clearCredentials } = useAuth();
    const [friends, setFriends] = useState([]);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = async () => {
        await clearCredentials();
        router.replace('/login');
    };

    const handleFetchFeed = async () => {
        try {
            const response = await fetch(
              "http://10.0.2.6:3001/api/posts/feed", // cambiar segun ip de tu red
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
                throw new Error('Error al obtener el feed');
            }
            const data = await response.json();
            const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(sortedPosts);
        } catch (error) {
            console.error('Fetch feed error:', error);
        }
    };

    useEffect(() => {
        if (!token) {
            router.replace('/(auth)/login');
            return;
        }
        handleFetchFeed();
    }, [token]);

    const handleLikeToggle = async (postId, isLiked) => {
        try {
            const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetch(`http://172.20.10.6:3001/api/posts/${postId}/like`, { //cambiar segun ip de tu red
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

    const handleComment = (postId) => {
        navigation.navigate('Comments', { postId });
    };

    const renderPost = ({ item: post }) => {
        const isLikedByCurrentUser = post.likes.includes(currentUserId);
        const likesCount = post.likes.length;

        return (
            <View style={styles.postCard}>
                <Image source={{ uri: `http://172.20.10.6:3001/${post.imageUrl.replace(/\\/g, '/')}` }} style={styles.postImage} /> //cambiar segun ip de tu red
                <Text style={styles.postUsername}>{post.user.username}</Text>
                <Text>{post.caption}</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => handleLikeToggle(post._id, isLikedByCurrentUser)}>
                        <Icon name="heart" type="material-community" color={isLikedByCurrentUser ? "#ff69b4" : "#808080"} />
                        <Text>{likesCount} Likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleComment(post._id)}>
                        <Icon name="comment" type="material-community" color="#000" />
                        <Text>Comment</Text>
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
    postCard: { marginBottom: 15, padding: 10, backgroundColor: '#fff', borderRadius: 5 },
    postImage: { width: '100%', height: 200, borderRadius: 5 },
    postUsername: { fontWeight: 'bold', marginVertical: 5 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }
});
