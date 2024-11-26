import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "./AuthContext";
import { useRoute } from '@react-navigation/native';
import { API_BASE_URL } from "../constants/config";

const CommentScreen = () => {
  const route = useRoute();
  const { postId, initialComments } = route.params;
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const { token, userId, username } = useAuth();
  const navigation = useNavigation();

  // Actualiza los comentarios al recibir nuevos datos
  useEffect(() => {
    setComments(initialComments);
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
          body: JSON.stringify({
            content: newComment,
            postId: postId,
            userId: userId
          }),
        }
      );
  
      if (!response.ok) {
        const errorDetails = await response.text();
        setError('Error al publicar el comentario');
        return;
      }
  
      const savedComment = await response.json();
  
      // Modify the optimistic comment to ensure username is present
      const optimisticComment = {
        ...savedComment,
        user: {
          _id: userId,
          username: username  // Explicitly set username here
        },
        username: username,  // Add this line to cover different possible data structures
        userId: {
          _id: userId,
          username: username
        }
      };
      
      // Update comments immediately
      setComments(prev => [...prev, optimisticComment]);
      
      // Rest of the function remains the same...
    } catch (error) {
      console.error('Error:', error);
      setError('Error al conectar con el servidor');
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
        setComments((prev) => prev.filter((comment) => comment._id !== commentId));
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

  const renderComment = ({ item: comment }) => {
    const isCurrentUser = comment.user?._id === userId;

    console.log(isCurrentUser);
    
    // Prioritize username extraction
    const displayUsername = 
      comment.user?.username || 
      comment.username || 
      comment.userId?.username;
  
    return (
      <View style={styles.comment}>
        <Text style={styles.commentUsername}>
          {displayUsername}
        </Text>
        <Text style={styles.commentContent}>{comment.content}</Text>
        {isCurrentUser && (
          <TouchableOpacity
            onPress={() => handleDeleteComment(comment._id)}
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
        renderItem={renderComment}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay comentarios</Text>}
        style={styles.commentList}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.commentForm}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Añade un co..."
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleSubmitComment}
          style={[styles.submitButton, !newComment.trim() && styles.disabledButton]}
          disabled={!newComment.trim()}
        >
          <Text style={styles.submitButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* Botón para cerrar la pantalla de comentarios (modal) */}
      <TouchableOpacity
        onPress={() => navigation.goBack()} // Vuelve al feed al presionar
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  commentList: { marginBottom: 10 },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  commentUsername: { fontWeight: "bold", marginRight: 5 },
  commentContent: { flex: 1 },
  deleteButton: { padding: 5 },
  deleteButtonText: { color: "red" },
  emptyText: { textAlign: "center", color: "#777" },
  errorText: { color: "red", textAlign: "center", marginBottom: 5 },
  commentForm: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8 },
  submitButton: { marginLeft: 10, padding: 8, backgroundColor: "#007bff", borderRadius: 5 },
  submitButtonText: { color: "#fff" },
  disabledButton: { backgroundColor: "#aaa" },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
  },
  closeButtonText: { color: "#fff", textAlign: "center" },
});

export default CommentScreen;
