// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import HomeScreen from './src/views/HomeScreen';
import SignInScreen from './src/views/SignInScreen';
import SignUpScreen from './src/views/SignUpScreen';
import CargarMedicion from './src/views/CargarMedicion';
import MedicoHomeView from './src/views/MedicoHomeView';
import HistoriaMedicaScreen from './src/views/HistoriaMedicaScreen';
import VerMedicionesScreen from './src/views/VerMedicionesScreen';
import MisMedicos from './src/views/MisMedicos';
import AgregarMedico from './src/views/AgregarMedico';


const Stack = createStackNavigator();


const App = () => {
  const [initialRoute, setInitialRoute] = useState('Home');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setInitialRoute('Cargar Medicion');
      } else {
        setInitialRoute('Home');
      }
    });

    return () => unsubscribe();
  }, []);



  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Cargar Medicion" component={CargarMedicion} />
        <Stack.Screen name="Medico Home View" component={MedicoHomeView} />
        <Stack.Screen name="Historia Medica" component={HistoriaMedicaScreen} />
        <Stack.Screen name="Ver Mediciones" component={VerMedicionesScreen} />
        <Stack.Screen name="Mis Medicos" component={MisMedicos} />
        <Stack.Screen name="Agregar Medico" component={AgregarMedico} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
