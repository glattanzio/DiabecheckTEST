  import React, { useState, useEffect } from 'react';
  import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
  import { auth } from '../services/firebase';
  import { Ionicons, FontAwesome } from '@expo/vector-icons'; // Asegúrate de tener estas librerías instaladas
  import { API_IP } from '../services/apiService';
  import HeaderPaciente from '../components/Header/HeaderPaciente';
  import HeaderMedico from '../components/Header/HeaderMedico';
  import {styles} from '../services/styles'


const MisArchivos = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { userId } = route.params;
  const [archivos, setArchivos] = useState([]);
  const [userRole, setUserRole] = useState(null);


  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        if (patientId) {
          const response = await fetch(`http://${API_IP}:8000/pacientes/${patientId}/archivos`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Error al obtener la lista de archivos');
          }

          const data = await response.json();
          setArchivos(data);
        }
      } catch (error) {
        console.error('Error al obtener la lista de archivos:', error);
      }
    };

    fetchArchivos();
  }, [patientId]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = await auth.currentUser.getIdToken();

        const response = await fetch(`http://${API_IP}:8000/user-role/?user_id=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener el rol del usuario');
        }

        const dataRol = await response.json();
        setUserRole(dataRol.Rol);
        console.log('Role',userRole);
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    fetchRole();
  }, []);

  // Función para manejar el rechazo de la solicitud
    const handleEliminar = (idArchivo) => {
      fetch(`http://${API_IP}:8000/archivos/borrar/${idArchivo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idArchivo }),
      })
      .then(response => response.json())
      .then(data => {
        Alert.alert('Éxito', 'Archivo eliminado');
        console.log('id',idArchivo);
        // Actualizar la lista de solicitudes
        setArchivos(archivos.filter(archivo => archivo.IdArchivo !== idArchivo));
      })
      .catch(error => console.error('Error eliminando archivo:', error));
    };

  const renderArchivos = ({ item }) => (
    <View style={styles.archivoContainer}>
        <View style ={styles.infoContainer}>
          <Text style={styles.archivoInfo}>{`${item.Nombre}`}</Text>
          <Text style={styles.archivoInfo}>{`${item.NombreCreador} ${item.ApellidoCreador}`}</Text>
          <Text style={styles.archivoInfo}>{`${formatDate(item.FechaPublicacion)}`}</Text>
        </View>
      <TouchableOpacity onPress={() => descargarArchivo(item.IdArchivo)}>
        <Ionicons name="download" size={24} color="black" style={styles.downloadIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleEliminar(item.IdArchivo)}>
        <Ionicons name="trash" size={24} color="black" style={styles.deleteIcon} />
      </TouchableOpacity>
    </View>
  );

  function formatDate(datetime) {
    const date = new Date(datetime);  // Convierte el string datetime a un objeto Date

    const day = String(date.getDate()).padStart(2, '0');    // Obtener el día (2 dígitos)
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Obtener el mes (2 dígitos) +1 porque los meses son 0-indexados
    const year = date.getFullYear();   // Obtener el año completo

    return `${day}/${month}/${year}`;  // Formatear como dd/mm/yyyy
  }

  const descargarArchivo = (idArchivo) => {
    // Lógica para descargar el archivo aquí
    console.log('Descargar archivo con id: ', idArchivo);
  };

    return (
      <View style={styles.container}>
            {userRole === 'Medico' ? (
              <HeaderMedico navigation={navigation} />
            ) : (
              <HeaderPaciente navigation={navigation} />
            )}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ARCHIVOS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cargar Archivo', { patientId, userId  })}>
            <Ionicons name="add-circle-outline" size={30} color="black" style={styles.addButton} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={archivos}
          renderItem={renderArchivos}
          keyExtractor={item => item.IdArchivo.toString()}
          contentContainerStyle={styles.listContainer}
        />

      </View>
    );
  };

  export default MisArchivos;
