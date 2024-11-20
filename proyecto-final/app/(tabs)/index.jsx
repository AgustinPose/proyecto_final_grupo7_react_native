import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const Feed = ({ onLogout }) => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const currentUserId = '67045766b9179756fe4260df'; // Reemplazar con el ID actual del usuario
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQ1NzY2YjkxNzk3NTZmZTQyNjBkZiIsImlhdCI6MTczMDkxOTcyNiwiZXhwIjoxNzMzNTExNzI2fQ.EfzqxOt-tsYSHWHHG0vXlywkIWIajJ6c9zgnKX_6bBA'; // Reemplazar con el token de autenticación
    const [refreshing,setRefreshing]=useState(false);
    const handleFetchFeed = async () => {
        setRefreshing(true);
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
        setRefreshing(false);
    };
    useEffect(()=>{handleFetchFeed()},[])


    const handleLike = async (postId) => {
        try {
            const response = await fetch(`http://172.20.10.6:3001/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

    const renderPost = ({ item: post }) => (
        <View style={styles.postCard}>
            <Image source={{ uri: `http://172.20.10.6:3001/${post.imageUrl.replace(/\\/g, '/')}` }} style={styles.postImage} />
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


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.appTitle}>FAKESTAGRAM</Text>
                    <Icon name="logout" type="material" onPress={onLogout} />
                </View>

                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={item => item._id}
                    style={styles.postList}
                    refreshing={refreshing}
                    onRefresh={()=>{if(!refreshing){handleFetchFeed()}}}
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

export default Feed;
