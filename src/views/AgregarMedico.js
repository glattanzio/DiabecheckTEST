import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { API_IP } from '../services/apiService';
import HeaderPaciente from '../components/Header/HeaderPaciente';

const AgregarMedico = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [matricula, setMatricula] = useState('');
  const [medico, setMedico] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const buscarMedico = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://${API_IP}:8000/buscar_medico/${matricula}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Médico no encontrado');
      }

      const data = await response.json();
      setMedico(data[0]);
      setMensaje('');
    } catch (error) {
      console.error(error);
      setMedico(null);
      setMensaje('Médico no encontrado');
    } finally {
      setLoading(false);
    }
  };


  const enviarSolicitud = async () => {
    try {
      if (!medico) {
        Alert.alert('Error', 'Debes buscar y seleccionar un médico antes de enviar la solicitud');
        return;
      }

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
      setMatricula('');
      setMedico(null);
      setMensaje('');
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
          placeholder="Introducir Matrícula"
          placeholderTextColor="gray"
          value={matricula}
          onChangeText={setMatricula}
        />
        <TouchableOpacity style={styles.searchButton} onPress={buscarMedico}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : medico ? (
        <View style={styles.medicoInfoContainer}>
          <FontAwesome name="user-circle-o" size={40} color="gray" />
          <Text style={styles.medicoName}>{`${medico.Nombre} ${medico.Apellido}`}</Text>
        </View>
      ) : mensaje ? (
        <Text style={styles.errorText}>{mensaje}</Text>
      ) : null}

      <TouchableOpacity style={styles.modernButton} onPress={enviarSolicitud}>
        <Text style={styles.modernButtonText}>Enviar Solicitud</Text>
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
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  medicoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  medicoName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  modernButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 30,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modernButtonText: {
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
