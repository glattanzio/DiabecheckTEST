import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { API_IP } from '../services/apiService';
import { auth } from '../services/firebase';
import HeaderMedico from '../components/Header/HeaderMedico';

const HistoriaMedicaScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`http://${API_IP}:8000/detalles_pacientes/${patientId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener la historia médica');
        }

        const data = await response.json();
        setPatientData(data);
      } catch (error) {
        console.error('Error al obtener la historia médica:', error);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (!patientData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando información del paciente...</Text>
      </View>
    );
  }

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

  console.log(patientData);

  return (
    <View style={styles.wrapper}>
      <HeaderMedico navigation={navigation} />

      <View style={styles.container}>
        <Text style={styles.title}>Historia Medica</Text>
        <Text style={styles.patientName}>{`${patientData.Apellido} ${patientData.Nombre}`}</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>DNI: {patientData.NroDocumento}</Text>
          <Text style={styles.infoText}>Edad: {calculateAge(patientData.FechaNacimiento)} Años</Text>
          <Text style={styles.infoText}>Diagnostico: {patientData.diagnostico}</Text>
          <Text style={styles.infoText}>Cobertura: {patientData.coberturaMedica}</Text>
          <Text style={styles.infoText}>Altura: {patientData.Altura} cm</Text>
          <Text style={styles.infoText}>Peso: {patientData.Peso} kg</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => {/* Acción para editar la historia médica */}}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Ver Mediciones', { patientId: patientData.IdPacientesInfoAdicional })}
        >
          <Text style={styles.buttonText}>Ver Mediciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Ver Documentación', { patientId: patientData.IdPacientesInfoAdicional })}
        >
          <Text style={styles.buttonText}>Ver Documentación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Cargar Documentación', { patientId: patientData.IdPacientesInfoAdicional })}
        >
          <Text style={styles.buttonText}>Cargar Documentación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  patientName: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderColor: '#000',
    borderWidth: 2,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginLeft: 100,
    marginRight: 100,
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 2,
  },
  editButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#428f7a',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoriaMedicaScreen;
