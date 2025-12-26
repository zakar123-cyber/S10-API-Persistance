import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Animated
} from "react-native";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterScreen({ setScreen }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [slideAnim] = useState(new Animated.Value(50));
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const register = async () => {
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }

        if (password.length < 6) {
            alert("Le mot de passe doit contenir au moins 6 caractères !");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("✅ Utilisateur créé !");
            setScreen("tasks");
        } catch (error) {
            console.error("❌ Erreur création:", error);
            alert("Erreur lors de la création du compte. L'email est peut-être déjà utilisé.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#7B68EE" />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* En-tête */}
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>✨</Text>
                    <Text style={styles.headerTitle}>Créer un compte</Text>
                    <Text style={styles.headerSubtitle}>Rejoignez TaskMaster aujourd'hui</Text>
                </View>

                {/* Formulaire */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>📧 Adresse email</Text>
                        <TextInput
                            placeholder="votre@email.com"
                            placeholderTextColor="#A0A0A0"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>🔐 Mot de passe</Text>
                        <TextInput
                            placeholder="Minimum 6 caractères"
                            placeholderTextColor="#A0A0A0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>🔒 Confirmer le mot de passe</Text>
                        <TextInput
                            placeholder="Retapez votre mot de passe"
                            placeholderTextColor="#A0A0A0"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={register}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>Créer mon compte 🚀</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Déjà inscrit ?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => setScreen("login")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#7B68EE',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    headerIcon: {
        fontSize: 70,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E8E0FF',
        fontWeight: '500',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    registerButton: {
        backgroundColor: '#7B68EE',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#7B68EE',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#7B68EE',
    },
    loginButtonText: {
        color: '#7B68EE',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
