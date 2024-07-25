import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a Diabecheck</Text>
      </View>
      <View style={styles.body}>
        <Button style={styles.button}
          title="Iniciar Sesión"
          onPress={() => navigation.navigate('SignIn')}
          color="#428f7a"
        />
      </View>
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
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  body: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
