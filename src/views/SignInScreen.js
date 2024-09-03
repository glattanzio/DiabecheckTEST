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
      // Obtener el rol del usuario desde el backend 10.0.2.2
      const response = await fetch(`http://${API_IP}:8000/user-role/?email=${encodeURIComponent(email)}`, {
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

      const role = data.Rol;
      await AsyncStorage.setItem('token', token);

      // Navegar a la pantalla adecuada basada en el rol del usuario
      if (role === 'Medico') {
        const medicoId = data.IdUsuario;
        await AsyncStorage.setItem('medicoId', medicoId.toString());
        navigation.navigate('Medico Home View', { medicoId });
      } else if (role === 'Paciente') {
        const pacienteId = data.IdUsuario;
        await AsyncStorage.setItem('pacienteId', pacienteId.toString());
        navigation.navigate('Cargar Medicion'); 
      } else {
        console.error('Rol desconocido del usuario:', role);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In with Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Button title="Sign In" onPress={handleSignIn} color="#428f7a" />
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
