import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { API_IP } from '../services/apiService';  
import HeaderMedico from '../components/Header/HeaderMedico';
import { auth } from '../services/firebase';


const MisSolicitudes = ({ route, navigation }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);  // Estado para manejar la carga de datos
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
      } finally {
        setLoading(false); // Termina la carga de datos
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

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderMedico navigation={navigation} />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderMedico navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOLICITUDES</Text>
      </View>
      {solicitudes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes solicitudes pendientes</Text>
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={item => item.IdConexionMedicoPaciente.toString()}  // Asegúrate de que sea un string
          renderItem={({ item }) => (
            <View style={styles.solicitudContainer}>
              <View>
                <Text style={styles.nombre}>{item.Nombre}</Text>
                <Text style={styles.nombre}>{item.Apellido}</Text>
                <Text style={styles.info}>{calculateAge(item.FechaNacimiento)} Años</Text>
                <Text style={styles.info}>{item.coberturaMedica}</Text>
              </View>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d7d7',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#edf1f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "center",
    marginLeft: 150,
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
