import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import HeaderPaciente from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { postData } from '../../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CargarMedicion = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [glucose, setGlucose] = useState('');
  const [insulin, setInsulin] = useState('');
  const [carbs, setCarbs] = useState('');

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowTimePicker(false);
    setDate(currentDate);
  };

  const formatDate = (date) => {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}/${year}`;
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  const handleSubmit = async () => {
    if (!glucose && !insulin && !carbs) {
      Alert.alert('Error', 'Debe completar al menos uno de los campos de medición');
      return;
    }

    try {
      const IdUsuario = await AsyncStorage.getItem('IdUsuario');
      const newMedicion = {
        Fecha: date.toISOString(),
        Glucosa: glucose ? parseFloat(glucose) : null,
        Insulina: insulin ? parseFloat(insulin) : null,
        Carbohidratos: carbs ? parseFloat(carbs) : null,
        IdPaciente: parseInt(IdUsuario, 10)
      };
      await postData(newMedicion);
      Alert.alert('Éxito', "Medición guardada correctamente");
      setGlucose('');
      setInsulin('');
      setCarbs('');

    } catch (error) {
      console.error('Error al enviar los datos:', error);
      Alert.alert('Error', 'Hubo un problema al guardar la medición');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderPaciente navigation={navigation} />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CARGAR MEDICIÓN</Text>
        </View>
        <View style={styles.container2}>
          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>FECHA</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text>{formatDate(date)}</Text>
                <Icon name="calendar" size={20} color="#000" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>HORA</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateInput}>
                <Text>{formatTime(date)}</Text>
                <Icon name="clock-o" size={20} color="#000" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>MEDICIÓN DE GLUCEMIA</Text>
          <TextInput
            style={styles.input}
            value={glucose}
            onChangeText={setGlucose}
            placeholder="mg/dl"
            keyboardType="numeric"
            placeholderTextColor="#000" 
          />

          <Text style={styles.label}>UNIDADES DE INSULINA</Text>
          <TextInput
            style={styles.input}
            value={insulin}
            onChangeText={setInsulin}
            placeholder="unidades"
            keyboardType="numeric"
            placeholderTextColor="#000" 
          />

          <Text style={styles.label}>CANTIDAD DE CARBOHIDRATOS</Text>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            placeholder="gramos"
            keyboardType="numeric"
            placeholderTextColor="#000" 
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>GUARDAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 15
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
    marginLeft: 130,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  button: {
    backgroundColor: '#428f7a',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default CargarMedicion;
