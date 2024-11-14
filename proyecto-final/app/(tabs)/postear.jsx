import React, { useState } from 'react';
import { View, Button, StyleSheet, Image, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function FormularioScreen() {
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState('');
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
            const response = await fetch('http://172.20.10.6:3001/api/posts/upload', { //cambiar segun ip de tu red
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
            <Button title="Añadir imagen" onPress={seleccionarDeGaleria} />
            <Button title='Sacar foto' onPress={tomarFoto}/>

            {image && (
                <Image
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

            <Button title="Subir publicación" onPress={handleUpload} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginVertical: 10,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    captionInput: {
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        marginBottom: 10,
    },
});
