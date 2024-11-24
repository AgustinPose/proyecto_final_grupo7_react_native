import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { API_BASE_URL } from "../../constants/config";
import { useAuth } from "../../components/AuthContext";

const CommentsSection = ({ route, navigation }) => {
  const { postId, initialComments } = route.params; // Recibe postId y comentarios iniciales de la navegación
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const { token, currentUserId } = useAuth();

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (!response.ok) throw new Error("Error al publicar el comentario");

      const savedComment = await response.json();
      setComments((prevComments) => [...prevComments, savedComment]);
      setNewComment("");
    } catch (error) {
      setError("No se pudo publicar el comentario");
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
      } else if (response.status === 403) {
        setError("No puedes eliminar este comentario");
      } else if (response.status === 404) {
        setError("Comentario no encontrado");
      } else {
        setError("Error al intentar eliminar el comentario");
      }
    } catch (error) {
      setError("Error del servidor");
      console.error(error);
    }
  };

  const renderComment = ({ item }) => {
    const isCurrentUser = item.user?._id === currentUserId;

    return (
      <View style={styles.commentContainer}>
        <Text style={styles.commentUser}>
          {item.user?.username || "Usuario desconocido"}
        </Text>
        <Text style={styles.commentContent}>{item.content}</Text>
        {isCurrentUser && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Confirmar",
                "¿Seguro que quieres eliminar este comentario?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    onPress: () => handleDeleteComment(item._id),
                  },
                ]
              )
            }
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={renderComment}
        contentContainerStyle={styles.commentsList}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Añade un comentario..."
        />
        <TouchableOpacity
          onPress={handleSubmitComment}
          disabled={!newComment.trim()}
          style={[
            styles.submitButton,
            { opacity: newComment.trim() ? 1 : 0.5 },
          ]}
        >
          <Text style={styles.submitButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  commentsList: {
    paddingBottom: 16,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  commentUser: {
    fontWeight: "bold",
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: "red",
    fontSize: 16,
  },
  form: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 8,
  },
});

export default CommentsSection;
