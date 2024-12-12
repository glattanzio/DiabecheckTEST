import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Image, StyleSheet, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker'; // Para seleccionar imágenes desde el dispositivo o tomar fotos
import DateTimePicker from '@react-native-community/datetimepicker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase'; // Asegúrate de que tu archivo firebase esté correctamente configurado
import HeaderMedico from '../components/Header/HeaderMedico';
import HeaderPaciente from '../components/Header';
import { API_IP } from '../services/apiService';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../services/firebase';
import { FilesPath } from '../services/storage';
import * as FileSystem from 'expo-file-system';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';



const CargarArchivo = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { userId } = route.params;
  const [fecha, setFecha] = useState(new Date());
  const [tipo, setTipo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [tiposArchivo, setTipoArchivo] = useState([]);
  const [urlArchivo, setUrlArchivo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [fileName, setfileName] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);


  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fecha;
    setShowDatePicker(Platform.OS === 'ios');
    setFecha(currentDate);
  };

  const seleccionarArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'], // Solo permitir estos tipos de archivo
        copyToCacheDirectory: true, // Asegura que el archivo esté accesible en el sistema
      });
  

      if (!result.canceled) {
        const { uri, mimeType } = result.assets[0];
  
        // Validar el tipo MIME
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(mimeType)) {
          Alert.alert('Archivo no permitido', 'Solo se pueden subir archivos PDF, JPG o PNG.');
          return;
        }

        // Validar el tamaño del archivo
        if (result.assets[0].size > 25 * 1024 * 1024) { // 25 MB en bytes
          Alert.alert('Archivo demasiado grande', 'El archivo no puede superar los 25 MB.');
          return;
        }
  
        // Validar el formato del URI
        if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
          Alert.alert('Error en el archivo', 'No se pudo procesar el archivo seleccionado.');
          return;
        }
  
        setArchivo(uri);
      }
    } catch (error) {
      console.error('Error al seleccionar el archivo:', error);
      Alert.alert('Error al seleccionar el archivo');
    }
  };
  
  
  const seleccionarImagen = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      alert('Se requiere permiso para acceder a la galería!');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Limitar a imágenes
      allowsEditing: false,
      quality: 0,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
  
      // Validar extensión de archivo
      if (!selectedAsset.uri.match(/\.(jpg|jpeg|png)$/)) {
        Alert.alert('Archivo no permitido', 'Solo se pueden subir imágenes JPG o PNG.');
        return;
      }
  
      setArchivo(selectedAsset.uri);
    }
  };
  
  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso para acceder a la cámara es necesario');
      return;
    }
  
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
  
      // Validar extensión de archivo
      if (!selectedAsset.uri.match(/\.(jpg|jpeg|png)$/)) {
        Alert.alert('Archivo no permitido', 'Solo se pueden subir imágenes JPG o PNG.');
        return;
      }
  
      setArchivo(selectedAsset.uri);
    }
  };  

  const showPopup = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2000); // Ocultar automáticamente después de 2 segundos
  };

  const handleUpload = async () => {
    if (!archivo) {
      alert('No se ha seleccionado ningún archivo');
      return;
    }
  
    try {
      // Leer el archivo como blob usando FileSystem
      const fileInfo = await FileSystem.getInfoAsync(archivo);

      if (!fileInfo.exists) {
        alert('El archivo seleccionado no existe.');
        return;
      }
      // Subir el archivo a Firebase
      const response = await fetch(archivo);
      //console.log('response', response);
      const blob = await response.blob();
      //console.log('blob', blob);
      const archivoRef = ref(storage, `${FilesPath}${patientId}/${new Date().toISOString()}`);
      //console.log('archivoRef', archivoRef);
      await uploadBytes(archivoRef, blob); //pincha aca
      const downloadURL = await getDownloadURL(archivoRef);
      //console.log('downloadURL', downloadURL);
      setUrlArchivo(downloadURL);
      //console.log('nombre',fileName);
     
      // Preparar los datos para enviar al backend
      const archivoData = {
        id_paciente: patientId,
        nombre: fileName,
        ruta_archivo: downloadURL,  // URL del archivo en Firebase
        fecha_publicacion: new Date().toISOString(),  // Fecha actual
        id_usuario: userId,  // El ID del usuario que carga el archivo (autenticado)
        id_tipoarchivo: tipo // El id del tipo de archivo (planilla, estudio, etc)
      };
  

      // Enviar los datos al backend
      const responseBackend = await fetch(`http://${API_IP}:8000/archivos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(archivoData),
      });
  
      if (responseBackend.ok) {
        const jsonResponse = await responseBackend.json();
        ('Archivo registrado en la base de datos:', jsonResponse);
        showPopup();
      } else {
        alert('Error al registrar el archivo en la base de datos');
      }
  
      // Limpiar el formulario después de la subida
      setArchivo(null);
      setTipo('');
      setfileName('');
      setFecha(new Date());
    } catch (error) {
      console.log('Error en la subida:', error);
      alert('Error al subir el archivo: ' + error);
    }
  };

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

  useEffect(() => {
    const obtenerTiposArchivo = async () => {
      try {
        const response = await fetch(`http://${API_IP}:8000/tipoarchivo/`);
        const data = await response.json();
        const formattedData = data.map((item) => ({
          label: item.descripcion,
          value: item.idtipoArchivo
        }));
  
        setTipoArchivo(formattedData);
      } catch (error) {
        console.error('Error al obtener tipos de archivo:', error);
      }
    };

    obtenerTiposArchivo();
  }, []);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await fetch(`http://${API_IP}:8000/api/time`);
        const data = await response.json();
        setFecha(new Date(data.serverTime));
      } catch (error) {
        console.error('Error al obtener la hora del servidor:', error);
      }
    };
  
    fetchServerTime();
  }, []);
  

  return (
    <View style={styles.container}>
      {userRole === 'Medico' ? (
        <HeaderMedico navigation={navigation} />
      ) : (
        <HeaderPaciente navigation={navigation} />
      )}
      <View style={styles.header}>
          <Text style={styles.headerTitle}>CARGAR DOCUMENTACION</Text>
      </View>

      <View style={styles.container2}>

        {/* Fecha */}
        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text>{`${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      {/* Nombre de documento  */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
              style={styles.input}
              placeholder="Nombre del archivo"
              placeholderTextColor="#999"
              value={fileName}
              onChangeText={(text) => setfileName(text)}
            />
      {/* Tipo de documento - Dropdown */}
      <Text style={styles.label}>Tipo</Text>
      <DropDownPicker
        open={open}
        value={tipo}
        items={tiposArchivo}
        setOpen={setOpen}
        setValue={setTipo}
        setItems={setTipoArchivo}
        placeholder="Selecciona un tipo"
        containerStyle={{ height: 40, marginBottom: 20 }}
        style={{ backgroundColor: '#fafafa' }}
        dropDownStyle={{ backgroundColor: '#fafafa' }}
      />

        {/* Subir archivo */}
        <Text style={styles.label}>Archivo</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={tomarFoto}>
            <Text>Tomar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={seleccionarArchivo}>
            <Text>Seleccionar</Text>
            <Text>Archivo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={seleccionarImagen}>
            <Text>Seleccionar</Text>
            <Text>Imagen</Text>
          </TouchableOpacity>
        </View>

        {archivo && (
        <View style={styles.selectedFileContainer}>
          <Text style={styles.fileNameText}>
            Archivo seleccionado correctamente
          </Text>
          <TouchableOpacity onPress={() => setArchivo(null)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      )}

        {/* Botón de guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleUpload}>
          <Text style={styles.saveButtonText}>GUARDAR</Text>
        </TouchableOpacity>
        <Modal
        isVisible={isModalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
        onBackdropPress={() => setModalVisible(false)}
        >
        <View style={styles.modalContent}>
          <Icon name="check-circle" size={60} color="#428f7a" />
          <Text style={styles.modalText}>Archivo subido con éxito</Text>
        </View>
      </Modal>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
  },
  container2: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#edf1f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 120,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#b0c4de',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center', // Centramos el contenido verticalmente
    width: '30%', // Ocupa el 30% del ancho de la pantalla
    marginBottom: 10, // Espacio inferior entre botones
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#428f7a',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center', // Centramos el contenido verticalmente
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileNameText: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#333', // Color del texto
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#428f7a',
  },
});

export default CargarArchivo;
