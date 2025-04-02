import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_IP } from '../services/apiService';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      // Iniciar sesión con correo y contraseña
      await signInWithEmailAndPassword(auth, email, password);
      // Obtener el token del usuario autenticado
      const token = await auth.currentUser.getIdToken();
      // Obtener el rol del usuario desde el backend
      const response = await fetch(`http://${API_IP}:8000/user_role/?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener el rol del usuario');
      }
      
      const data = await response.json();

      const role = data.Role;
      const IdUser = data.IdUser; // Asegúrate de que el backend devuelva el IdUser
      await AsyncStorage.setItem('token', token);

      // Navegar a la pantalla adecuada basada en el rol del usuario
      console.log('Rol del usuario:', role); // Agregado para depuración
      console.log('IdUser:', IdUser); // Agregado para depuración
      if (role === 'Doctor') {
        await AsyncStorage.setItem('IdUser', IdUser.toString());
        navigation.navigate('Medico Home View', { IdUser });
      } else if (role === 'Paciente') {
        await AsyncStorage.setItem('IdUser', IdUser.toString());
        navigation.navigate('Cargar Medicion', { IdUser });
      } else {
        console.error('Rol desconocido del usuario:', role);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesion</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor="#999"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Button title="Ingresar" onPress={handleSignIn} color="#428f7a" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
  },
});

export default SignInScreen;
