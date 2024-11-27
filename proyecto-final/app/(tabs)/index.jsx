

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
    // borrar si no es util
    // const [searchTerm, setSearchTerm] = useState('');
    // const [friends, setFriends] = useState([]);

    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const handleLogout = async () => {
        await clearCredentials();
        router.replace("auth/login");
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
            const sortedPosts = data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setPosts(sortedPosts);
        } catch (error) {
            console.error("Fetch feed error:", error);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        handleFetchFeed();
    }, []);

    useEffect(() => {
        if (!token) {
            router.replace("auth/login");
            return;
        }
        handleFetchFeed();
    }, [token]);

    const handleLikeToggle = async (postId, isLiked) => {
        try {
            const method = isLiked ? "DELETE" : "POST";
            const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
                //cambiar segun ip de tu red
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
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
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post._id === postId ? { ...post, likes: newLikes } : post
            )
        );
    };

    const handleRefreshFeed = () => {
        console.log("Feed refreshed"); // Lógica para actualizar el feed
        handleFetchFeed(); // Tu lógica para recargar el feed
    };

    const handleComment = (postId, comments) => {
        navigation.navigate("CommentsSection", {
            postId,
            initialComments: comments,
            onCommentChange: () => handleRefreshFeed(), // Remove the immediate execution
        });
    }
    // const renderPost = ({ item: post }) => {
    //     const isLikedByCurrentUser = post.likes.includes(userId);
    //     const likesCount = post.likes.length;

    //     return (
    //         <View style={styles.postCard}>
    //             <Image
    //                 source={{
    //                     uri: `${API_BASE_URL}/${post.imageUrl.replace(/\\/g, "/")}`,
    //                     headers: { Authorization: `Bearer ${token}` }
    //                 }}
    //                 style={styles.postImage}
    //             />

    //             <Text style={styles.postUsername}>{post.user.username}</Text>
    //             <Text>{post.caption}</Text>
    //             <View style={styles.actionsRow}>
    //                 <TouchableOpacity onPress={() => handleLikeToggle(post._id, isLikedByCurrentUser)}>
    //                     <Icon name="heart" type="material-community" color={isLikedByCurrentUser ? "#ff69b4" : "#808080"} />
    //                     <Text>{likesCount} Likes</Text>
    //                 </TouchableOpacity>
    //                 <TouchableOpacity onPress={() => handleComment(post._id, post.comments)}>
    //                     <Icon name="comment" type="material-community" color="#000" />
    //                     <Text>Ver Comentarios</Text>
    //                 </TouchableOpacity>
    //             </View>
    //         </View>
    //     );
    // };


    const renderPost = ({ item: post }) => {
        const isLikedByCurrentUser = post.likes.includes(userId);
        const likesCount = post.likes.length;

        return (
            <View style={styles.postCard}>
                <Image
                    source={{
                        uri: `${API_BASE_URL}/${post.imageUrl.replace(/\\/g, "/")}`,
                    }}
                    style={styles.postImage}
                />
                <Text style={styles.postUsername}>{post.user.username}</Text>
                <Text>{post.caption}</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        onPress={() => handleLikeToggle(post._id, isLikedByCurrentUser)}
                    >
                        <Icon
                            name="heart"
                            type="material-community"
                            color={isLikedByCurrentUser ? "#ff69b4" : "#808080"}
                        />
                        <Text>{likesCount} Likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleComment(post._id, post.comments)}
                    >
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
                    <Text style={styles.appTitle}>Fakestagram</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" type="material" color="#262626" size={24} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={posts}
                    renderItem={({ item: post }) => (
                        <View style={styles.postCard}>
                            <View style={styles.postHeader}>
                                <Image
                                    style={styles.avatarImage}
                                />
                                <Text style={styles.postUsername}>{post.user.username}</Text>
                            </View>

                            <Image
                                source={{
                                    uri: `${API_BASE_URL}/${post.imageUrl.replace(/\\/g, "/")}`,
                                }}
                                style={styles.postImage}
                            />

                            <View style={styles.postContent}>
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity
                                        onPress={() => handleLikeToggle(post._id, post.likes.includes(userId))}
                                        style={styles.actionButton}
                                    >
                                        <Icon
                                            name="heart"
                                            type="material-community"
                                            color={post.likes.includes(userId) ? "#E1306C" : "#262626"}
                                            size={28}
                                        />
                                        <Text style={styles.actionText}>{post.likes.length}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleComment(post._id, post.comments)}
                                        style={styles.actionButton}
                                    >
                                        <Icon
                                            name="comment"
                                            type="material-community"
                                            color="#262626"
                                            size={28}
                                        />
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item._id}
                    style={styles.postList}
                    refreshing={refreshing}
                    onRefresh={() => { if (!refreshing) { handleFetchFeed() } }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    appTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#262626",
        letterSpacing: -1,
        fontFamily: "System",
        textTransform: "uppercase",
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#FAFAFA"
    },
    container: {
        flex: 1
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#DBDBDB",
        backgroundColor: "#FFFFFF"
    },
    postList: {
        flex: 1
    },
    postCard: {
        marginBottom: 8,
        backgroundColor: "#FFFFFF",
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12
    },
    avatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10
    },
    postContent: {
        padding: 12
    },
    postUsername: {
        fontWeight: "600",
        fontSize: 14,
        color: "#262626"
    },
    actionsRow: {
        flexDirection: "row",
        marginBottom: 8,
        justifyContent: "flex-end" // This will align buttons to the right
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 16,
        marginLeft: 16 // Add some spacing between buttons
    },
    actionText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#262626"
    },
    caption: {
        fontSize: 14,
        lineHeight: 18,
        color: "#262626"
    },
    postImage: {
        width: '100%',
        aspectRatio: 4 / 3,
        borderRadius: 10,
        marginVertical: 10,
        resizeMode: 'cover',

    },
    logoutButton: {
        padding: 8
    }
});