import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useAuth } from './AuthContext';
import perfilDefecto from '../assets/images/perfilDefecto.jpg';
import { API_BASE_URL } from '../constants/config';

const UserProfileFriend = ({ route }) => {
  const { friendId } = route.params;
  const { token, userId: currentUserId } = useAuth();
  const [friendData, setFriendData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [feedPosts, setFeedPosts] = useState([]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const currentUserResponse = await fetch(`${API_BASE_URL}/api/user/profile/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!currentUserResponse.ok) {
        throw new Error('Error al obtener los datos del usuario actual.');
      }

      const currentUserData = await currentUserResponse.json();

      const friendResponse = await fetch(`${API_BASE_URL}/api/user/profile/${friendId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!friendResponse.ok) {
        throw new Error('Error al obtener los datos del perfil del amigo.');
      }

      const friendData = await friendResponse.json();
      setFriendData({
        ...friendData.user,
        friendsCount: friendData.user.friends?.length || 0,
      });
      setFeedPosts(friendData.posts || []);

      const friendsList = currentUserData.user.friends || [];
      setIsFriend(friendsList.some(friend => friend._id === friendId));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (friendId && token) {
      fetchProfile();
    } else {
      setError('No se pudo obtener la información del usuario.');
    }
  }, [friendId, token]);

  const handleFriendAction = async () => {
    try {
      const endpoint = isFriend ? 'remove-friend' : 'add-friend';
      const method = isFriend ? 'DELETE' : 'POST';

      const response = await fetch(`${API_BASE_URL}/api/user/${endpoint}/${friendId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la amistad.');
      }

      setIsFriend(!isFriend);
      setFriendData(prevData => ({
        ...prevData,
        friendsCount: isFriend 
          ? prevData.friendsCount - 1 
          : prevData.friendsCount + 1,
      }));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: friendData.profilePicture || perfilDefecto }}
          style={styles.profileImage}
        />
        <View style={styles.info}>
          <Text style={styles.username}>{friendData.username}</Text>
          <Text style={styles.stats}>
            {feedPosts.length} posts | {friendData.friendsCount} friends
          </Text>
          <Text style={styles.description}>
            {friendData.description || 'No hay descripción aún.'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.friendButton, 
            isFriend && styles.friendButtonActive,
          ]}
          onPress={handleFriendAction}
        >
          <Text style={styles.friendButtonText}>
            {isFriend ? 'Amigos' : 'Añadir amigo'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={feedPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Image
              source={{ uri: `${API_BASE_URL}/${item.imageUrl.replace(/\\/g, '/')}` }}
              style={styles.postImage}
            />
            <Text style={styles.postDescription}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay publicaciones.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', textAlign: 'center' },
  header: { flexDirection: 'row', marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  info: { flex: 1, marginLeft: 16 },
  username: { fontSize: 20, fontWeight: 'bold' },
  stats: { fontSize: 14, color: '#666' },
  description: { fontSize: 14, marginTop: 8 },
  friendButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignSelf: 'center',
  },
  friendButtonActive: { backgroundColor: '#28a745' },
  friendButtonText: { color: '#fff' },
  postCard: { marginBottom: 16 },
  postImage: { width: '100%', height: 200, borderRadius: 8 },
  postDescription: { marginTop: 8 },
});

export default UserProfileFriend;
