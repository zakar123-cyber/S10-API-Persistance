import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { initDB, getNotes, addNote, deleteNote } from './database';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      await initDB();
      const data = await getNotes();
      setNotes(data);

      // Animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    })();
  }, []);

  const handleAdd = async () => {
    if (text.trim().length > 0) {
      await addNote(text);
      const data = await getNotes();
      setNotes(data);
      setText('');
    }
  };

  const handleDelete = async (id) => {
    await deleteNote(id);
    const data = await getNotes();
    setNotes(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📝 Mes Notes</Text>
          <Text style={styles.headerSubtitle}>
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Zone de saisie */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Écrire une nouvelle note..."
            placeholderTextColor="#A0A0A0"
            value={text}
            onChangeText={setText}
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            style={[styles.addButton, !text.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!text.trim()}
          >
            <Text style={styles.addButtonText}>Ajouter ✨</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des notes */}
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.noteCard, {
                backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8F9FA'
              }]}
              onPress={() => handleDelete(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.noteContent}>
                <Text style={styles.noteText}>{item.text}</Text>
              </View>
              <View style={styles.deleteIcon}>
                <Text style={styles.deleteText}>🗑️</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📭</Text>
              <Text style={styles.emptySubtext}>Aucune note pour le moment</Text>
            </View>
          }
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#6C63FF',
    padding: 25,
    paddingTop: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0FF',
    fontWeight: '500',
  },
  inputContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#D0D0D0',
    shadowOpacity: 0,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
    marginRight: 10,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  deleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});
