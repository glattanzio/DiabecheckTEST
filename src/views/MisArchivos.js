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
  const { idPatient } = route.params;
  const { idUser } = route.params;
  const [files, setFiles] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [fileType, setFileType] = useState("0"); // Estado para el filtro de tipo
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
    const fetchFiles = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        if (idPatient) {
          // Modify URL to include sorting parameter
          const url = new URL(`http://${API_IP}:8000/patient_files/${idPatient}`);
          
          if (fileType) {
            url.searchParams.append('fileType', fileType);
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
            throw new Error('Error al obtener la lista de files');
          }

          const data = await response.json();
          setFiles(data);
        }
      } catch (error) {
        console.error('Error al obtener la lista de files:', error);
      }
    };

    fetchFiles();
  }, [idPatient, fileType, sortDate]);  // Volver a ejecutar cuando cambie el filtro

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = await auth.currentUser.getIdToken();

        const response = await fetch(`http://${API_IP}:8000/user_role/?idUser=${idUser}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener el rol del usuario');
        }

        const dataRole = await response.json();
        setUserRole(dataRole.Role);
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    fetchRole();
  }, []);

  const handleDelete = (idFile) => {
    fetch(`http://${API_IP}:8000/delete_file/${idFile}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idFile }),
    })
      .then(response => response.json())
      .then(() => {
        showPopup();
        setFiles(files.filter(file => file.IdFile !== idFile));
      })
      .catch(error => console.error('Error eliminando file:', error));
  };

  const renderFiles = ({ item }) => (
      <View style={styles.fileContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.fileInfo}>{`${item.Name}`}</Text>
          <Text style={styles.fileInfo}>{`${formatDate(item.PublishDate)}`}</Text>
        </View>
        <TouchableOpacity onPress={() => loadFile(item.IdFile)}>
          <Ionicons name="download" size={24} color="black" style={styles.downloadIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.IdFile)}>
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


  const loadFile = async (idFile) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://${API_IP}:8000/file/${idFile}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Error obteniendo detalles del file');
      }
  
      const fileData = await response.json();
      const firebaseUrl = fileData.FilePath;
  
      const cleanFileName = fileData.Name.replace(/[^a-z0-9.]/gi, '_');
      const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;
  
      // Download file
      await FileSystem.downloadAsync(firebaseUrl, fileUri);
  
      // Share the file (this will open the native share/download dialog)
      await Sharing.shareAsync(fileUri);
  
    } catch (error) {
      console.error('Error descargando file:', error);
      Alert.alert('Error', 'No se pudo descargar el file');
    }
  };

  return (
    <View style={styles.container}>
      {userRole === 'Doctor' ? (
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
        <TouchableOpacity onPress={() => navigation.navigate('Cargar Archivo', { idPatient, idUser })}>
          <Ionicons name="add-circle-outline" size={30} color="black" style={styles.addButton} />
        </TouchableOpacity>
      </View>
      <Picker
        selectedValue={fileType}
        onValueChange={(itemValue) => {
          setFileType(itemValue);
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
        data={files}
        renderItem={renderFiles}
        keyExtractor={item => item.IdFile.toString()}
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
