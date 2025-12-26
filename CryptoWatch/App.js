import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

// 📦 Import des modules externes (Module 4 & 5)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé pour le stockage local
const FAVORITES_KEY = '@my_favorites_ids';

export default function App() {
  // --- ÉTATS (STATE) ---
  const [users, setUsers] = useState([]); // Données API
  const [favorites, setFavorites] = useState([]); // Liste des ID favoris
  const [isLoading, setIsLoading] = useState(true); // Indicateur de chargement
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Défi 1: Filtrage
  const [modalVisible, setModalVisible] = useState(false); // Défi 3: Modal pour ajout
  const [newUserName, setNewUserName] = useState(''); // Défi 3: Nom du nouvel utilisateur
  const [newUserEmail, setNewUserEmail] = useState(''); // Défi 3: Email du nouvel utilisateur

  // --- CYCLE DE VIE (EFFECTS) ---
  useEffect(() => {
    loadData();
  }, []); // [] = S'exécute une seule fois au montage

  // --- LOGIQUE MÉTIER ---

  // 1. Fonction pour charger les données (API + Storage)
  const loadData = async () => {
    setIsLoading(true);
    try {
      // A. Appel API avec Axios (Module 4)
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(response.data);

      // B. Chargement des favoris locaux (Module 5)
      const storedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs)); // Conversion JSON -> Tableau
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
      console.error(error);
    } finally {
      setIsLoading(false); // Arrêt du chargement quoi qu'il arrive
    }
  };

  // 2. Gestion des Favoris (Ajout/Retrait + Persistance)
  const toggleFavorite = async (userId) => {
    try {
      let newFavorites;
      if (favorites.includes(userId)) {
        // Si déjà favori, on le retire
        newFavorites = favorites.filter(id => id !== userId);
      } else {
        // Sinon, on l'ajoute
        newFavorites = [...favorites, userId];
      }

      // Mise à jour du State (Interface réactive)
      setFavorites(newFavorites);

      // Mise à jour du Storage (Persistance)
      // JSON.stringify est obligatoire car AsyncStorage ne stocke que des Strings
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
    }
  };

  // 🎯 DÉFI 2: Fonction pour effacer tous les favoris
  const clearAllFavorites = async () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment effacer tous les favoris ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Effacer",
          style: "destructive",
          onPress: async () => {
            try {
              // Suppression du AsyncStorage
              await AsyncStorage.removeItem(FAVORITES_KEY);
              // Réinitialisation de l'état local
              setFavorites([]);
              Alert.alert("Succès", "Tous les favoris ont été effacés");
            } catch (error) {
              console.error("Erreur lors de l'effacement", error);
              Alert.alert("Erreur", "Impossible d'effacer les favoris");
            }
          }
        }
      ]
    );
  };

  // 🎯 DÉFI 3: Fonction pour ajouter un utilisateur via API POST
  const addNewUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      // Appel POST vers l'API (JSONPlaceholder simule l'ajout)
      const response = await axios.post('https://jsonplaceholder.typicode.com/users', {
        name: newUserName,
        email: newUserEmail,
        username: newUserName.toLowerCase().replace(/\s/g, ''),
        phone: "000-000-0000",
        website: "example.com"
      });

      // L'API renvoie un objet avec un ID (simulé, généralement 11)
      const newUser = response.data;

      // Ajout à la liste locale (en début de liste pour le voir facilement)
      setUsers([newUser, ...users]);

      // Réinitialisation du formulaire
      setNewUserName('');
      setNewUserEmail('');
      setModalVisible(false);

      Alert.alert("Succès", `Utilisateur "${newUser.name}" ajouté avec l'ID ${newUser.id}`);
    } catch (error) {
      console.error("Erreur lors de l'ajout", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'utilisateur");
    }
  };

  // --- RENDU GRAPHIQUE (RENDER) ---

  // Composant pour un item de la liste
  const renderItem = ({ item }) => {
    const isFav = favorites.includes(item.id);
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={[styles.favButton, isFav ? styles.favActive : styles.favInactive]}
        >
          <Text style={styles.favText}>{isFav ? "★" : "☆"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 🎯 DÉFI 1: Filtrage des données selon le mode
  const getDisplayedUsers = () => {
    if (showOnlyFavorites) {
      return users.filter(user => favorites.includes(user.id));
    }
    return users;
  };

  // Affichage principal
  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>📇 Mon Répertoire API</Text>
        <Text style={styles.subheader}>
          {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        {/* 🎯 DÉFI 1: Bouton de filtrage */}
        <TouchableOpacity
          style={[styles.filterButton, showOnlyFavorites && styles.filterButtonActive]}
          onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
        >
          <Text style={styles.filterButtonText}>
            {showOnlyFavorites ? "📋 Tous" : "⭐ Favoris"}
          </Text>
        </TouchableOpacity>

        {/* 🎯 DÉFI 3: Bouton d'ajout */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>➕ Ajouter</Text>
        </TouchableOpacity>

        {/* 🎯 DÉFI 2: Bouton d'effacement */}
        {favorites.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllFavorites}
          >
            <Text style={styles.clearButtonText}>🗑️ Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenu principal */}
      {isLoading ? (
        // Affichage du spinner pendant le chargement
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement des contacts...</Text>
        </View>
      ) : (
        <FlatList
          data={getDisplayedUsers()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>
                {showOnlyFavorites ? "⭐" : "📭"}
              </Text>
              <Text style={styles.emptyText}>
                {showOnlyFavorites
                  ? "Aucun favori pour le moment"
                  : "Aucun contact disponible"}
              </Text>
            </View>
          }
        />
      )}

      {/* 🎯 DÉFI 3: Modal pour ajouter un utilisateur */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un contact</Text>

            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor="#999"
              value={newUserName}
              onChangeText={setNewUserName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newUserEmail}
              onChangeText={setNewUserEmail}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setNewUserName('');
                  setNewUserEmail('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonAdd]}
                onPress={addNewUser}
              >
                <Text style={styles.modalButtonTextAdd}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40
  },
  headerContainer: {
    backgroundColor: '#3498db',
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ecf0f1',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#f39c12',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  favButton: {
    padding: 10,
    borderRadius: 20,
    minWidth: 45,
    alignItems: 'center',
  },
  favActive: {
    backgroundColor: '#fff3cd',
  },
  favInactive: {
    backgroundColor: '#f0f0f0',
  },
  favText: {
    fontSize: 24,
    color: '#f1c40f',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    fontWeight: '500',
  },
  // Styles pour le modal (Défi 3)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#ecf0f1',
  },
  modalButtonAdd: {
    backgroundColor: '#27ae60',
  },
  modalButtonTextCancel: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextAdd: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
