import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Asegúrate de tener estas librerías instaladas
import { API_IP } from '../services/apiService';
import HeaderPaciente from '../components/Header/HeaderPaciente';

const AgregarMedico = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [matricula, setMatricula] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  const enviarSolicitud = async () => {
    try {
      const response = await fetch(`http://${API_IP}:8000/solicitud-medico/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula: parseInt(matricula),
          paciente_id: parseInt(patientId),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar la solicitud');
      }
  
      const data = await response.json();
      setMensaje('Solicitud enviada con éxito');
      Alert.alert('Éxito', 'Solicitud enviada con éxito');
    } catch (error) {
      console.error(error);
      setMensaje('Error al enviar la solicitud');
      Alert.alert('Error', 'Error al enviar la solicitud');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderPaciente navigation={navigation} />
      
      <Text style={styles.title}>NUEVO MEDICO</Text>
  
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Introducir Codigo"
          placeholderTextColor="gray"
          value={matricula}
          onChangeText={setMatricula}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={enviarSolicitud}>
        <Text style={styles.buttonText}>Enviar Solicitud</Text>
      </TouchableOpacity>

      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d7d7',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: 'black',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a8b2af',
    paddingHorizontal: 10,
    borderRadius: 25,
    marginTop: 40,
    marginHorizontal: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: 'black',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mensaje: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default AgregarMedico;
