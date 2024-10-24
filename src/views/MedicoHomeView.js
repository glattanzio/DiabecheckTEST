import React, { useState, useEffect } from 'react';
import { View, Text, Image, Grid,TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, storage } from '../services/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import HeaderMedico from '../components/Header/HeaderMedico';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_IP } from '../services/apiService';
import { UserProfileImage } from '../services/storage';

const MedicoHomeView = ({ navigation }) => {
  const [medicoId, setMedicoId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMedicoId = async () => {
      try {
        const storedMedicoId = await AsyncStorage.getItem('IdUsuario');
        if (storedMedicoId) {
          setMedicoId(parseInt(storedMedicoId));
        }
      } catch (error) {
        console.error('Error al obtener el medicoId almacenado:', error);
      }
    };

    fetchMedicoId();
  }, []);
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        if (medicoId) {
          const response = await fetch(`http://${API_IP}:8000/listado_pacientes/${medicoId}/?search_query=${encodeURIComponent(searchQuery)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Error al obtener la lista de pacientes');
          }

          const data = await response.json();
          setPatients(data);
        }
      } catch (error) {
        console.error('Error al obtener la lista de pacientes:', error);
      }
    };
    fetchPatients();
  }, [medicoId, searchQuery]);
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

  const renderPatient = ({ item }) => (
    <View style={styles.patientContainer}>
      <UserProfileImage imagePath = {item.RutaFoto} />
      <View style={styles.infoContainer}>
          <Text style={styles.patientName}>{`${item.Apellido} ${item.Nombre}`}</Text>
          <Text style={styles.patientInfo}>{`${calculateAge(item.FechaNacimiento)} AÑOS`}</Text>
          <Text style={styles.patientInfo}>{item.coberturaMedica}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Historia Medica', { patientId: item.IdUsuario, userId: medicoId })} style={styles.arrowContainer}>
        <Text style={styles.arrow}>&gt;</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <HeaderMedico navigation={navigation} />
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar paciente por apellido o DNI"
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={item => item.IdUsuario.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
  },
  searchBar: {
    margin: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  patientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoContainer: {
      flex:1,
    },
  patientName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  patientInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  patientPhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
    },
  arrowContainer: {
    justifyContent: 'center', 
  },
  arrow: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MedicoHomeView;
