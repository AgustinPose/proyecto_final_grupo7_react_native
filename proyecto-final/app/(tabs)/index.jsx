import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useAuth } from '../../components/AuthContext';
import { router } from 'expo-router';
import PerfilDefecto from '../../assets/images/perfilDefecto.jpg';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';

export default function IndexScreen() {
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
              "http://10.0.2.2:3001/api/posts/feed",
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
        fetchFriends();
    }, [token]);

    const fetchFriends = async () => {
        try {
            const response = await fetch("http://10.0.2.2:3001/api/user/all", {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Error al obtener amigos');
            const data = await response.json();
            const filteredFriends = data.filter(friend => friend._id !== userId);
            setFriends(filteredFriends);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await fetch(
              `http://10.0.2.2:3001/api/posts/${postId}/like`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (response.ok) {
                const updatedPost = await response.json();
                updatePostLikes(postId, updatedPost.likes);
            }
        } catch (error) {
            console.error("Error liking post:", error);
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

    const handleFriendProfileClick = (friendId) => {
        navigation.navigate('UserProfile', { friendId });
    };

    const renderPost = ({ item: post }) => (
      <View style={styles.postCard}>
        <Image
          source={{
            uri: `http://10.0.2.2:3001/${post.imageUrl.replace(/\\/g, "/")}`,
          }}
          style={styles.postImage}
        />
        <Text style={styles.postUsername}>{post.user.username}</Text>
        <Text>{post.caption}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => handleLike(post._id)}>
            <Icon name="heart" type="material-community" color="#f00" />
            <Text>{post.likes.length} Likes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleComment(post._id)}>
            <Icon name="comment" type="material-community" color="#000" />
            <Text>Comment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    const renderFriend = ({ item: friend }) => (
        <View style={styles.friendCard}>
            <Image source={friend.profilePicture ? { uri: friend.profilePicture } : PerfilDefecto} style={styles.friendImage} />
            <Text style={styles.friendName}>{friend.username}</Text>
            <Button title="View" onPress={() => handleFriendProfileClick(friend._id)} />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.appTitle}>FAKESTAGRAM</Text>
                    <Icon name="logout" type="material" onPress={handleLogout} />
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
                    data={friends.filter(friend => friend.username.toLowerCase().includes(searchTerm.toLowerCase()))}
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
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1 
    },
    container: { 
        flex: 1, 
        padding: 10 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    appTitle: { 
        fontSize: 20, 
        fontWeight: 'bold' 
    },
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    searchInput: { 
        flex: 1, 
        padding: 5, 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        marginRight: 10 
    },
    friendList: { 
        marginBottom: 10, 
        maxHeight: 80 
    },
    friendCard: { 
        alignItems: 'center', 
        marginRight: 10 
    },
    friendImage: { 
        width: 50, 
        height: 50, 
        borderRadius: 25 
    },
    friendName: { 
        fontSize: 14 
    },
    postList: { 
        flex: 1 
    },
    postCard: { 
        marginBottom: 15, 
        padding: 10, 
        backgroundColor: '#fff', 
        borderRadius: 5 
    },
    postImage: { 
        width: '100%', 
        height: 200, 
        borderRadius: 5 
    },
    postUsername: { 
        fontWeight: 'bold', 
        marginVertical: 5 
    },
    actionsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginTop: 10 
    }
});