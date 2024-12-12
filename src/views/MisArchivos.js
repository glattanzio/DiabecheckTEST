import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform, PermissionsAndroid } from 'react-native';
import { auth } from '../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { API_IP } from '../services/apiService';
import HeaderPaciente from '../components/Header/HeaderPaciente';
import HeaderMedico from '../components/Header/HeaderMedico';
import { styles } from '../services/styles';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Permissions from 'expo-permissions';
import * as DocumentPicker from 'expo-downloads-manager';


const MisArchivos = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { userId } = route.params;
  const [archivos, setArchivos] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [tipoArchivo, setTipoArchivo] = useState("0"); // Estado para el filtro de tipo
  const [sortDate, setSortDate] = useState(null); // Estado para el orden por fecha


  const showPopup = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2000); // Ocultar automáticamente después de 2 segundos
  };

  const toggleDateSort = () => {
    if (sortDate === null) {
      setSortDate('asc');
    } else if (sortDate === 'asc') {
      setSortDate('desc');
    } else {
      setSortDate(null);
    }
  };

  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        if (patientId) {
          // Modify URL to include sorting parameter
          const url = new URL(`http://${API_IP}:8000/archivos/${patientId}`);
          
          if (tipoArchivo) {
            url.searchParams.append('tipo', tipoArchivo);
          }
          
          if (sortDate) {
            url.searchParams.append('sort_date', sortDate);
          }

          const response = await fetch(url.toString(), {
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
  }, [patientId, tipoArchivo, sortDate]);  // Volver a ejecutar cuando cambie el filtro

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
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    fetchRole();
  }, []);

  const handleEliminar = (idArchivo) => {
    fetch(`http://${API_IP}:8000/archivos/borrar/${idArchivo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idArchivo }),
    })
      .then(response => response.json())
      .then(() => {
        showPopup();
        setArchivos(archivos.filter(archivo => archivo.IdArchivo !== idArchivo));
      })
      .catch(error => console.error('Error eliminando archivo:', error));
  };

  const renderArchivos = ({ item }) => (
      <View style={styles.archivoContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.archivoInfo}>{`${item.Nombre}`}</Text>
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
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }


  const descargarArchivo = async (idArchivo) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://${API_IP}:8000/archivo/${idArchivo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Error obteniendo detalles del archivo');
      }
  
      const fileData = await response.json();
      const firebaseUrl = fileData.RutaArchivo;
  
      const cleanFileName = fileData.Nombre.replace(/[^a-z0-9.]/gi, '_');
      const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;
  
      // Download file
      await FileSystem.downloadAsync(firebaseUrl, fileUri);
  
      // Share the file (this will open the native share/download dialog)
      await Sharing.shareAsync(fileUri);
  
    } catch (error) {
      console.error('Error descargando archivo:', error);
      Alert.alert('Error', 'No se pudo descargar el archivo');
    }
  };

  return (
    <View style={styles.container}>
      {userRole === 'Medico' ? (
        <HeaderMedico navigation={navigation} />
      ) : (
        <HeaderPaciente navigation={navigation} />
      )}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DOCUMENTACIÓN</Text>
        <TouchableOpacity onPress={toggleDateSort}>
          {sortDate === null && (
            <Ionicons name="swap-vertical" size={30} color="black" style={styles.sortButton} />
          )}
          {sortDate === 'asc' && (
            <Ionicons name="arrow-up" size={30} color="black" style={styles.sortButton} />
          )}
          {sortDate === 'desc' && (
            <Ionicons name="arrow-down" size={30} color="black" style={styles.sortButton} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cargar Archivo', { patientId, userId })}>
          <Ionicons name="add-circle-outline" size={30} color="black" style={styles.addButton} />
        </TouchableOpacity>
      </View>
      <Picker
        selectedValue={tipoArchivo}
        onValueChange={(itemValue) => {
          setTipoArchivo(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Todos" value="0" />
        <Picker.Item label="Planillas" value="1" />
        <Picker.Item label="Recetas" value="2" />
        <Picker.Item label="Estudio" value="3" />
        <Picker.Item label="Extraccion de Sangre" value="4" />
      </Picker>
      <FlatList
        data={archivos}
        renderItem={renderArchivos}
        keyExtractor={item => item.IdArchivo.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <Modal
        isVisible={isModalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Icon name="check-circle" size={60} color="#428f7a" />
          <Text style={styles.modalText}>Documentación eliminada correctamente</Text>
        </View>
      </Modal>
    </View>
  );
};

export default MisArchivos;
