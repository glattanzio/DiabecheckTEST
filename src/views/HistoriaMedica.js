import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HistoriaMedica = () => {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Historia Medica</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f4f4',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  export default HistoriaMedica;
  