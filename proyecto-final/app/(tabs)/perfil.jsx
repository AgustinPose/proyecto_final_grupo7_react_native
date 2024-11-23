import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    Alert
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { API_BASE_URL } from '../../constants/config';
import perfilDefecto from '../../assets/images/perfilDefecto.jpg';
import * as ImagePicker from 'expo-image-picker';

export default function Perfil() {
    const { token, userId } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [feedPosts, setFeedPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [error, setError] = useState('');

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Error al obtener los datos del perfil');

            const data = await response.json();
            setProfileData(data.user);
            setFeedPosts(data.posts);
            setNewUsername(data.user.username);
            setNewDescription(data.user.description);
            setProfileImagePreview(data.user.profilePicture ? `${API_BASE_URL}/${data.user.profilePicture.replace(/\\/g, '/')}` : perfilDefecto);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        if (token && userId) fetchProfile();
    }, [token, userId]);

    // Handle edit toggle
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    // Save profile changes
    const handleSaveChanges = async () => {
        try {
            const updatedData = {
                username: newUsername,
                description: newDescription,
            };

            if (profileImagePreview) {
                updatedData.profilePicture = profileImagePreview;
            }

            const response = await fetch(`${API_BASE_URL}/api/user/profile/edit`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) throw new Error('Error al actualizar el perfil');

            const data = await response.json();

            setProfileData({
                ...profileData,
                username: data.user.username,
                profilePicture: data.user.profilePicture,
                description: data.user.description
            });

            setProfileImagePreview(data.user.profilePicture);
            console.log('Profile image:', profileImagePreview);
            setIsEditing(false);

        } catch (error) {
            setError(error.message);
        }
    };

    // Pick image from gallery
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImagePreview(result.assets[0].uri);
        }
    };

    // Render post item
    const renderPost = ({ item }) => (
        <View style={styles.postCard}>
            <Image
                source={{ uri: `${API_BASE_URL}/${item.imageUrl.replace(/\\/g, '/')}` }}
                style={styles.postImage}
            />
            <Text style={styles.postDescription}>{item.description}</Text>
        </View>
    );

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    if (!profileData) {
        return <Text style={styles.loading}>Cargando perfil...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image
                    source={profileImagePreview ? { uri: profileImagePreview } : require('../../assets/images/perfilDefecto.jpg')}
                    style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={newUsername}
                            onChangeText={setNewUsername}
                            placeholder="Nuevo username"
                        />
                    ) : (
                        <Text style={styles.username}>{profileData.username}</Text>
                    )}
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={newDescription}
                            onChangeText={setNewDescription}
                            placeholder="Nueva descripción"
                            multiline
                        />
                    ) : (
                        <Text style={styles.description}>{profileData.description || 'No hay descripción.'}</Text>
                    )}
                </View>
            </View>

            {isEditing && (
                <TouchableOpacity style={styles.saveButton} onPress={pickImage}>
                    <Text style={styles.saveButtonText}>Seleccionar imagen</Text>
                </TouchableOpacity>
            )}

            {isEditing ? (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
                    <Text style={styles.editButtonText}>Editar perfil</Text>
                </TouchableOpacity>
            )}

            {!isEditing && (
                <FlatList
                    data={feedPosts}
                    keyExtractor={(item) => item._id}
                    renderItem={renderPost}
                    contentContainerStyle={styles.feedContainer}
                    ListEmptyComponent={<Text>No hay publicaciones.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    profileImage: { width: 100, height: 100, borderRadius: 50 },
    profileInfo: { flex: 1, marginLeft: 16 },
    username: { fontSize: 24, fontWeight: 'bold' },
    description: { fontSize: 16, color: '#666' },
    input: { borderWidth: 1, padding: 8, marginBottom: 8 },
    textArea: { height: 80 },
    saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 8, marginBottom: 10 },
    editButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 8, marginBottom: 16 },
    postCard: { marginBottom: 16 },
    postImage: { width: '100%', height: 200, borderRadius: 8 },
    postDescription: { marginTop: 8 },
    error: { textAlign: 'center', color: 'red' },
    loading: { textAlign: 'center', color: '#666' },
});
