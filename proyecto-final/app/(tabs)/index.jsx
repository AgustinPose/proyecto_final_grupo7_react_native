import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PerfilDefecto from '../../assets/images/perfilDefecto.jpg';
import { useNavigation } from '@react-navigation/native';

const Feed = ({ onLogout }) => {
    const navigation = useNavigation();
    const [friends, setFriends] = useState([]);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const currentUserId = '67045766b9179756fe4260df'; // Reemplazar con el ID actual del usuario
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQ1NzY2YjkxNzk3NTZmZTQyNjBkZiIsImlhdCI6MTczMDkxOTcyNiwiZXhwIjoxNzMzNTExNzI2fQ.EfzqxOt-tsYSHWHHG0vXlywkIWIajJ6c9zgnKX_6bBA'; // Reemplazar con el token de autenticación

    const handleFetchFeed = async () => {
        try {
            const response = await fetch('http://172.20.10.4:3001/api/posts/feed', {
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
            const response = await fetch('http://172.20.10.4:3001/api/user/all', {
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

    const handleLike = async (postId) => {
      try {
          const response = await fetch(`http://172.20.10.4:3001/api/posts/${postId}/like`, {
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

    const handleFriendProfileClick = (friendId) => {
        navigation.navigate('UserProfile', { friendId });
    };

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderPost = ({ item: post }) => (
      <View style={styles.postCard}>
          <Image source={{ uri: `http://172.20.10.4:3001/${post.imageUrl.replace(/\\/g, '/')}` }} style={styles.postImage} />
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
        <SafeAreaView style={styles.container}>
            <TextInput
                placeholder="Search friends..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.searchInput}
            />
            <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item._id}
                renderItem={renderFriend}
                horizontal
                style={styles.friendsList}
            />
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={renderPost}
                style={styles.feedList}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  searchInput: {
      padding: 10,
      backgroundColor: '#eee',
      marginVertical: 5,
      borderRadius: 5,
  },
  friendsList: {
      maxHeight: 80,
  },
  friendCard: {
      alignItems: 'center',
      marginRight: 10,
  },
  friendImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
  },
  friendName: {
      fontSize: 14,
  },
  postCard: {
      padding: 10,
      marginVertical: 5,
      backgroundColor: '#fff',
      borderRadius: 8,
  },
  postImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
  },
  postUsername: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
  },
});

export default Feed;
