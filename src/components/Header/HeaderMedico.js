import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const staticInfo = {
    name: "Diabecheck"
};

const HeaderMedico = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [medicoId, setMedicoId] = useState(null);

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Obtener el medicoId desde AsyncStorage
                    const storedMedicoId = await AsyncStorage.getItem('medicoId');
                    setMedicoId(storedMedicoId);
                } catch (error) {
                    console.error('Error al obtener el medicoId:', error);
                }
            } else {
                setMedicoId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigation.navigate('Home');  // Redirige al usuario a la pantalla de inicio
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const handleMisSolicitudes = () => {
        try {
            setModalVisible(false); 
            navigation.navigate('Mis Solicitudes', {medicoId: medicoId});
        } catch (error) {
            console.error('Error al ver solicitudes:', error);
        }
    };

    const handleVerPacientes = () => {
        try {
            setModalVisible(false); 
            navigation.navigate('Medico Home View', {medicoId: medicoId});
        } catch (error) {
            console.error('Error al ver solicitudes:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Icon name="menu" size={40} color="#fff" style={styles.menu} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
                <Text style={styles.name}>{staticInfo.name}</Text>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                    <Pressable style={styles.modalButton} onPress={handleVerPacientes}>
                            <Text style={styles.modalButtonText}>Pacientes</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={handleMisSolicitudes}>
                            <Text style={styles.modalButtonText}>Mis Solicitudes</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={handleSignOut}>
                            <Text style={styles.modalButtonText}>Cerrar Sesión</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',         
        alignItems: 'center',         
        paddingHorizontal: 10,
        paddingVertical: 15,
        paddingRight: 50,
        backgroundColor: '#428f7a',
    },
    titleContainer: {
        flex: 1,                       
        alignItems: 'center',          
    },
    name: {
        fontWeight: 'bold',
        fontSize: 26,
        textAlign: 'center',
    },
    userId: {
        fontSize: 14,
        color: '#fff',
    },
    menu: {
        marginRight: 10,               
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalButton: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 18,
        color: '#428f7a',
    },
});

export default HeaderMedico;
