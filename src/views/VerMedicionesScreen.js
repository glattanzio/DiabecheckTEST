import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import HeaderPaciente from '../components/Header/HeaderPaciente';
import HeaderMedico from '../components/Header/HeaderMedico';
import { API_IP } from '../services/apiService';
import { auth } from '../services/firebase';

const VerMedicionesScreen = ({ route, navigation }) => {
  const { idPatient } = route.params;
  const { idUser } = route.params;
  const [mediciones, setMediciones] = useState([]);
  const [userRole, setUserRole] = useState(null); 
  const [openMonth, setOpenMonth] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mes actual
  const [openYear, setOpenYear] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());   // Año actual

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    const formattedDate = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,  // Para formato 24 horas
    });
  
    return `${formattedDate} ${formattedTime} HS`;
  };
  

  const [months, setMonths] = useState([
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ]);

  const [years, setYears] = useState([
    { label: '2022', value: 2022 },
    { label: '2023', value: 2023 },
    { label: '2024', value: 2024 },
    { label: '2025', value: 2025 }
  ]);

  useEffect(() => {
    const fetchMediciones = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`http://${API_IP}:8000/patient_measurements/${idPatient}/?month=${selectedMonth}&year=${selectedYear}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las mediciones');
        }

        const data = await response.json();
        setMediciones(data);
      } catch (error) {
        console.error('Error al obtener las mediciones:', error);
      }
    };

    fetchMediciones();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        console.log('idUser', idUser);
        console.log('PacienteId', idPatient);

        const response = await fetch(`http://${API_IP}:8000/user_role/?idUser=${idUser}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Error al obtener el rol del usuario');
        }
  
        const dataRol = await response.json();
        console.log('Role',dataRol.Role);
        setUserRole(dataRol.Role);
        console.log('Role',userRole);
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };
  
    fetchRole();
  }, []);

  const getGlucoseStatus = (glucose) => {
    if (glucose > 150) {
      return {
        status: '⛔️',
        color: '#FF0000'
      }; // Bad
    } else if (glucose >= 120 && glucose <= 150) {
      return {
        status: '✅',
        color: '#00FF00'
      }; // Good
    } else if (glucose >= 100 && glucose < 120) {
      return {
        status: '⚠️',
        color: '#FFFF00'
      }; // Regular
    } else {
      return {
        status: '⛔️',
        color: '#FF0000'
      }; // Bad
    }
  };
  
  const renderMedicion = ({ item }) => {
    const glucoseStatus = getGlucoseStatus(item.Glucose);
  
    return (
      <View style={styles.medicionContainer}>
        <View style={styles.statusSymbolContainer}>
          <Text style={styles.statusSymbol}>{glucoseStatus.status}</Text>
        </View>
  
        <Text style={styles.fechaHora}>
          {`${formatDateTime(item.MeasureDate)}`}
        </Text>
  
        <View style={styles.row}>
          <Text style={styles.titleMedicion}>GLUCEMIA</Text>
          <Text style={styles.titleMedicion}>INSULINA</Text>
          <Text style={styles.titleMedicion}>CARBOHIDRATOS</Text>
        </View>
  
        <View style={styles.row}>
          <Text style={styles.value}>{item.Glucose} mg/dl</Text>
          <Text style={styles.value}>{item.Insulin} u</Text>
          <Text style={styles.value}>{item.Carbohidrates} g</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {userRole === 'Doctor' ? (
        <HeaderMedico navigation={navigation} />
      ) : (
        <HeaderPaciente navigation={navigation} />
      )}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MEDICIONES</Text>
      </View>
      <View style={styles.filtersContainer}>
        <DropDownPicker
          open={openMonth}
          value={selectedMonth}
          items={months}
          setOpen={setOpenMonth}
          setValue={setSelectedMonth}
          setItems={setMonths}
          containerStyle={[styles.dropdownContainer, openMonth ? { zIndex: 1000 } : { zIndex: 1 }]}
          placeholder="Mes"
        />
        <DropDownPicker
          open={openYear}
          value={selectedYear}
          items={years}
          setOpen={setOpenYear}
          setValue={setSelectedYear}
          setItems={setYears}
          containerStyle={[styles.dropdownContainer, openYear ? { zIndex: 1000 } : { zIndex: 1 }]}
          placeholder="Año"
        />
      </View>

      <FlatList
        data={mediciones}
        renderItem={renderMedicion}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No hay mediciones disponibles</Text>}
        scrollEnabled={!openMonth && !openYear} 
        contentContainerStyle={openMonth || openYear ? { zIndex: -1 } : { zIndex: 0 }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Ver Archivos', { idPatient, idUser })}>
          <Text style={styles.buttonText}>Ver Documentacion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cargar Archivo', { idPatient, idUser })}>
          <Text style={styles.buttonText}>Cargar Documentacion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#d3d3d3',
    },
    medicionesText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 20,
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
      marginLeft: 155,
    },
    titleMedicion: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
        width: '33%',
        textAlign: 'center'
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        width: '33%',
        textAlign: 'center',
    },
    filtersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      zIndex: 1000,  // Asegurar que esté por encima de la lista
    },
    dropdownContainer: {
      width: '45%',  // Para que ocupen 45% cada dropdown en la pantalla
    },
    medicionContainer: {
      backgroundColor: '#e0e0e0',
      padding: 10,
      marginVertical: 5,
      marginHorizontal: 10,
      borderRadius: 10,
      zIndex: -1,
      borderColor: '#000',
      borderWidth: 2,
    },
    fechaHora: {
        color: "#7E7E7E",
        fontSize: 14,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    emptyMessage: {
      textAlign: 'center',
      fontSize: 18,
      marginTop: 20,
      color: '#888',
    },
    buttonContainer: {
      margin: 10,
    },
    button: {
      backgroundColor: '#428f7a',
      padding: 15,
      borderRadius: 10,
      marginVertical: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    statusSymbolContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
    statusSymbol: {
      fontSize: 18,
    },
    medicionContainer: {
      backgroundColor: '#e0e0e0',
      padding: 10,
      marginVertical: 5,
      marginHorizontal: 10,
      borderRadius: 10,
      zIndex: -1,
      borderColor: '#000',
      borderWidth: 2,
      position: 'relative',
    },
  });
  

export default VerMedicionesScreen;
