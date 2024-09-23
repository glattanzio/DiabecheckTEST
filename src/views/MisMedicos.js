import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../services/firebase';
import { Ionicons, FontAwesome } from '@expo/vector-icons'; // Asegúrate de tener estas librerías instaladas
import { API_IP } from '../services/apiService';
import HeaderPaciente from '../components/Header/HeaderPaciente';

const MisMedicos = ({ route, navigation }) => {
  const { patientId } = route.params;
  const [medicos, setMedicos] = useState([]);

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        if (patientId) {
          const response = await fetch(`http://${API_IP}:8000/listado_medicos/${patientId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Error al obtener la lista de médicos');
          }

          const data = await response.json();
          setMedicos(data);
        }
      } catch (error) {
        console.error('Error al obtener la lista de médicos:', error);
      }
    };

    fetchMedicos();
  }, [patientId]);

  const renderMedico = ({ item }) => (
    <View style={styles.medicoContainer}>
      <FontAwesome name="user-circle-o" size={40} color="gray" style={styles.medicoIcon} />
      <Text style={styles.medicoName}>{`${item.Apellido} ${item.Nombre}`}</Text>
      <TouchableOpacity onPress={() => eliminarMedico(item.IdUsuario)}>
        <Ionicons name="trash" size={24} color="black" style={styles.deleteIcon} />
      </TouchableOpacity>
    </View>
  );

  const eliminarMedico = (idMedico) => {
    // Lógica para eliminar el médico aquí
    console.log(`Eliminar médico con id: ${idMedico}`);
  };

  return (
    <View style={styles.container}>
      <HeaderPaciente navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MIS MEDICOS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Agregar Medico', { patientId })}>
          <Ionicons name="add-circle-outline" size={30} color="black" style={styles.addButton} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={medicos}
        renderItem={renderMedico}
        keyExtractor={item => item.IdUsuario.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "center",
    marginLeft: 115,
  },
  addButton: {
    marginRight: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  medicoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  medicoIcon: {
    marginRight: 15,
  },
  medicoName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteIcon: {
    marginLeft: 10,
  },
});

export default MisMedicos;
