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
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen({ setScreen }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [scaleAnim] = useState(new Animated.Value(0.9));

    React.useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const login = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("✅ Connecté !");
            setScreen("tasks");
        } catch (error) {
            console.error("❌ Erreur login:", error);
            alert("Erreur de connexion. Vérifiez vos identifiants.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

            <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
                {/* Logo/Icône */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>🔐</Text>
                    <Text style={styles.logoText}>TaskMaster</Text>
                    <Text style={styles.logoSubtext}>Gérez vos tâches efficacement</Text>
                </View>

                {/* Formulaire de connexion */}
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Connexion</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>📧 Email</Text>
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
                        <Text style={styles.label}>🔑 Mot de passe</Text>
                        <TextInput
                            placeholder="••••••••"
                            placeholderTextColor="#A0A0A0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={login}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OU</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => setScreen("register")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>Créer un compte</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4A90E2',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        fontSize: 80,
        marginBottom: 10,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    logoSubtext: {
        fontSize: 16,
        color: '#E0F0FF',
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 25,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
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
    loginButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    loginButtonText: {
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
    registerButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    registerButtonText: {
        color: '#4A90E2',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
