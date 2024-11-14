import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export default function FormularioScreen() {
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(null);

    const currentUserId = '67045766b9179756fe4260df'; // Reemplazar con el ID actual del usuario
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQ1NzY2YjkxNzk3NTZmZTQyNjBkZiIsImlhdCI6MTczMDkxOTcyNiwiZXhwIjoxNzMzNTExNzI2fQ.EfzqxOt-tsYSHWHHG0vXlywkIWIajJ6c9zgnKX_6bBA'; // Reemplazar con el token de autenticación

    const seleccionarDeGaleria = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const tomarFoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Se requiere acceso a la cámara');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!image) {
            Alert.alert('Por favor selecciona una imagen primero');
            return;
        }
        const formData = new FormData();
        formData.append('image', {
            uri: image,
            name: 'post.jpg',
            type: 'image/jpeg',
        });
        formData.append('caption', caption);

        try {
            const response = await fetch('http://172.20.10.6:3001/api/posts/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Publicación creada exitosamente');
                setImage(null);
                setCaption('');
                router.back();
            } else {
                const errorData = await response.json();
                Alert.alert('Error al crear publicación', errorData.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error de red', 'No se pudo conectar con el servidor');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.button} onPress={seleccionarDeGaleria}>
                    <Text style={styles.buttonText}>Añadir imagen</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={tomarFoto}>
                    <Text style={styles.buttonText}>Sacar foto</Text>
                </TouchableOpacity>
            </View>

            {image && (
                <Image
                    title="image"
                    source={{ uri: image }}
                    style={styles.imagePreview}
                />
            )}

            <TextInput
                placeholder="Escribe un caption..."
                value={caption}
                onChangeText={setCaption}
                style={styles.captionInput}
            />

            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                <Text style={styles.buttonText}>Subir publicación</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#0a7ea4',
        padding: 12,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    uploadButton: {
        backgroundColor: '#0a7ea4',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreview: {
        width: '80%',
        aspectRatio: 4 / 3,
        borderRadius: 10,
        marginVertical: 10,
        resizeMode: 'cover',
    },
    captionInput: {
        width: '100%',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    }
});
