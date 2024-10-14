  import React, { useState, useEffect } from 'react';
  import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
  import { auth } from '../services/firebase';
  import { Ionicons, FontAwesome } from '@expo/vector-icons'; // Asegúrate de tener estas librerías instaladas
  import { API_IP } from '../services/apiService';
  import HeaderPaciente from '../components/Header/HeaderPaciente';
  import {styles} from '../services/styles'


const CargarArchivo = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { userId } = route.params;
  const [archivos, setArchivos] = useState([]);

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

  const renderArchivos = ({ item }) => (
    <View style={styles.archivoContainer}>
        <View style ={styles.infoContainer}>
          <Text style={styles.archivoInfo}>{`${item.Nombre}`}</Text>
          <Text style={styles.archivoInfo}>{`${item.NombreCreador} ${item.ApellidoCreador}`}</Text>
          <Text style={styles.archivoInfo}>{`${item.FechaPublicacion}`}</Text>
        </View>
      <TouchableOpacity onPress={() => descargarArchivo(item.IdArchivo)}>
        <Ionicons name="download" size={24} color="black" style={styles.downloadIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => eliminarArchivo(item.IdArchivo)}>
        <Ionicons name="trash" size={24} color="black" style={styles.deleteIcon} />
      </TouchableOpacity>
    </View>
  );

  const eliminarArchivo = (idArchivo) => {
    // Lógica para eliminar el archivo aquí
    console.log('Eliminar archivo con id: ', idArchivo);

  };
  const descargarArchivo = (idArchivo) => {
    // Lógica para descargar el archivo aquí
    console.log('Descargar archivo con id: ', idArchivo);
  };

    return (
      <View style={styles.container}>
        <HeaderPaciente navigation={navigation} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MIS ARCHIVOS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cargar Archivo', { patientId })}>
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

  export default CargarArchivo;
