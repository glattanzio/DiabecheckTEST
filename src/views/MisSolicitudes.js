import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { API_IP } from '../services/apiService';  
import HeaderMedico from '../components/Header/HeaderMedico';
import { auth } from '../services/firebase';


const MisSolicitudes = ({ route, navigation }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const { medicoId } = route.params;


  // Función para obtener las solicitudes pendientes del médico
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`http://${API_IP}:8000/medico/solicitudes/${medicoId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las solicitudes');
        }

        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
      }
    };

    fetchSolicitudes();
  }, [medicoId]);

  // Función para manejar la aceptación de la solicitud
  const handleAceptar = (idSolicitud) => {
    fetch(`http://${API_IP}:8000/medico/solicitudes/aceptar/${idSolicitud}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idSolicitud }),
    })
    .then(response => response.json())
    .then(data => {
      Alert.alert('Éxito', 'Solicitud aceptada');
      // Actualizar la lista de solicitudes
      setSolicitudes(solicitudes.filter(solicitud => solicitud.IdConexionMedicoPaciente !== idSolicitud));
    })
    .catch(error => console.error('Error aceptando solicitud:', error));
  };

  // Función para manejar el rechazo de la solicitud
  const handleRechazar = (idSolicitud) => {
    fetch(`http://${API_IP}:8000/medico/solicitudes/rechazar/${idSolicitud}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idSolicitud }),
    })
    .then(response => response.json())
    .then(data => {
      Alert.alert('Éxito', 'Solicitud rechazada');
      // Actualizar la lista de solicitudes
      setSolicitudes(solicitudes.filter(solicitud => solicitud.IdConexionMedicoPaciente !== idSolicitud));
    })
    .catch(error => console.error('Error rechazando solicitud:', error));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    return age;
  };


  return (
    <View style={styles.container}>
      <HeaderMedico navigation={navigation} />
      <Text style={styles.title}>MIS SOLICITUDES</Text>
      <FlatList
        data={solicitudes}
        keyExtractor={item => item.IdConexionMedicoPaciente}
        renderItem={({ item }) => (
          <View style={styles.solicitudContainer}>
            <Text style={styles.nombre}>{item.Nombre}</Text>
            <Text style={styles.nombre}>{item.Apellido}</Text>
            <Text style={styles.info}>{calculateAge(item.FechaNacimiento)} Años</Text>
            <Text style={styles.info}>{item.coberturaMedica}</Text>
            <View style={styles.acciones}>
              <TouchableOpacity onPress={() => handleAceptar(item.IdConexionMedicoPaciente)}>
                <FontAwesome name="check-circle" size={24} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRechazar(item.IdConexionMedicoPaciente)} style={styles.rechazarIcon}>
                <FontAwesome name="times-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  solicitudContainer: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  info: {
    color: 'gray',
  },
  acciones: {
    flexDirection: 'row',
  },
  rechazarIcon: {
    marginLeft: 15,
  },
});

export default MisSolicitudes;
