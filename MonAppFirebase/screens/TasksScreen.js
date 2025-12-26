import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    StatusBar,
    Animated,
    TextInput,
    Modal
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function TasksScreen({ setScreen }) {
    const [taches, setTaches] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        lireTaches();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const ajouterTache = async () => {
        if (newTaskTitle.trim().length === 0) {
            alert("Veuillez entrer un titre pour la tâche !");
            return;
        }

        try {
            await addDoc(collection(db, "taches"), {
                titre: newTaskTitle,
                fait: false,
                createdAt: new Date().toISOString(),
            });
            console.log("✅ Tâche ajoutée !");
            setNewTaskTitle("");
            setModalVisible(false);
            lireTaches();
        } catch (error) {
            console.error("❌ Erreur ajout:", error);
            alert("Erreur lors de l'ajout de la tâche");
        }
    };

    const lireTaches = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "taches"));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTaches(data);
        } catch (error) {
            console.error("❌ Erreur lecture:", error);
        }
    };

    const toggleTache = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "taches", id), {
                fait: !currentStatus
            });
            lireTaches();
        } catch (error) {
            console.error("❌ Erreur toggle:", error);
        }
    };

    const supprimerTache = async (id) => {
        try {
            await deleteDoc(doc(db, "taches", id));
            console.log("✅ Tâche supprimée !");
            lireTaches();
        } catch (error) {
            console.error("❌ Erreur suppression:", error);
        }
    };

    const deconnexion = () => {
        auth.signOut();
        setScreen("login");
    };

    const completedTasks = taches.filter(t => t.fait).length;
    const totalTasks = taches.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* En-tête */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>📋 Mes Tâches</Text>
                        <Text style={styles.headerSubtitle}>
                            {completedTasks} / {totalTasks} terminées
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={deconnexion}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.logoutText}>🚪</Text>
                    </TouchableOpacity>
                </View>

                {/* Barre de progression */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>

                {/* Bouton d'ajout */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.addButtonText}>+ Ajouter une tâche</Text>
                </TouchableOpacity>

                {/* Liste des tâches */}
                <FlatList
                    data={taches}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.taskCard}>
                            <TouchableOpacity
                                style={styles.taskContent}
                                onPress={() => toggleTache(item.id, item.fait)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.checkbox,
                                    item.fait && styles.checkboxChecked
                                ]}>
                                    {item.fait && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={[
                                    styles.taskTitle,
                                    item.fait && styles.taskTitleCompleted
                                ]}>
                                    {item.titre}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => supprimerTache(item.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.deleteButtonText}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📝</Text>
                            <Text style={styles.emptyText}>Aucune tâche pour le moment</Text>
                            <Text style={styles.emptySubtext}>Ajoutez votre première tâche !</Text>
                        </View>
                    }
                />
            </Animated.View>

            {/* Modal d'ajout de tâche */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nouvelle tâche</Text>

                        <TextInput
                            placeholder="Titre de la tâche..."
                            placeholderTextColor="#A0A0A0"
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            style={styles.modalInput}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setNewTaskTitle("");
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonAdd]}
                                onPress={ajouterTache}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalButtonTextAdd}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
    },
    header: {
        backgroundColor: '#FF6B6B',
        padding: 25,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#FFE0E0',
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 24,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 20,
        marginTop: 25,
    },
    progressBar: {
        flex: 1,
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 15,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 6,
    },
    progressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        minWidth: 45,
    },
    addButton: {
        backgroundColor: '#FF6B6B',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 20,
        paddingTop: 15,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    taskContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    taskTitle: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    deleteButton: {
        backgroundColor: '#FFE5E5',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#F0F0F0',
    },
    modalButtonAdd: {
        backgroundColor: '#FF6B6B',
    },
    modalButtonTextCancel: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalButtonTextAdd: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
