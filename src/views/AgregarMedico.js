import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_IP } from '../services/apiService';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderPaciente from '../components/Header/HeaderPaciente';


const AgregarMedico = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [doctorLicense, setDoctorLicense] = useState('');
  const [medico, setMedico] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const showPopup = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2000); // Ocultar automáticamente después de 2 segundos
  };


  const buscarMedico = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://${API_IP}:8000/search_doctor/${doctorLicense}`, {
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

      const response = await fetch(`http://${API_IP}:8000/doctor_connection_request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorLicense: parseInt(doctorLicense),
          paciente_id: parseInt(patientId),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la solicitud');
      }

      const data = await response.json();
      setMensaje('Solicitud enviada con éxito');
      showPopup();
      //Alert.alert('Éxito', 'Solicitud enviada con éxito');
      setDoctorLicense('');
      setMedico(null);
      setMensaje('');
    } catch (error) {
      console.error(error);
      setMensaje('Error al enviar la solicitud');
      Alert.alert('Error', 'Error al enviar la solicitud');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPaciente navigation={navigation} />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Nuevo Médico</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="#428f7a" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ingresar Matrícula Médica"
            placeholderTextColor="#8e8e8e"
            value={doctorLicense}
            onChangeText={setDoctorLicense}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.searchButton} onPress={buscarMedico}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3498db" style={styles.loadingIndicator} />
        ) : medico ? (
          <View style={styles.medicoInfoContainer}>
            <View style={styles.medicoAvatarContainer}>
              <Ionicons name="person-circle-outline" size={60} color="#428f7a" />
            </View>
            <View style={styles.medicoDetailsContainer}>
              <Text style={styles.medicoName}>{`Dr. ${medico.Nombre} ${medico.Apellido}`}</Text>
              <Text style={styles.medicoMatricula}>Matrícula: {doctorLicense}</Text>
            </View>
          </View>
        ) : mensaje ? (
          <Text style={styles.errorText}>{mensaje}</Text>
        ) : null}

        <TouchableOpacity 
          style={[
            styles.modernButton, 
            (!medico || loading) && styles.modernButtonDisabled
          ]}
          onPress={enviarSolicitud}
          disabled={!medico || loading}
        >
          <Text style={styles.modernButtonText}>Enviar Solicitud</Text>
        </TouchableOpacity>

        {mensaje && <Text style={styles.mensajeText}>{mensaje}</Text>}
      </View>
      <Modal
        isVisible={isModalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Icon name="check-circle" size={60} color="#428f7a" />
          <Text style={styles.modalText}>Solicitud enviada correctamente</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f7',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  searchIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  searchButton: {
    backgroundColor: '#428f7a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  medicoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicoAvatarContainer: {
    marginRight: 15,
  },
  medicoDetailsContainer: {
    flex: 1,
  },
  medicoName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  medicoMatricula: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modernButton: {
    backgroundColor: '#428f7a',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modernButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  modernButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  mensajeText: {
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  loadingIndicator: {
    marginVertical: 20,
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

export default AgregarMedico;