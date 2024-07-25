import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const firebaseConfig = {
  apiKey: "AIzaSyAQQ7UB9I8nvYwKPToNWZfQgdP6J8kXGnk",
  authDomain: "diabecheck-c8563.firebaseapp.com",
  projectId: "diabecheck-c8563",
  storageBucket: "diabecheck-c8563.appspot.com",
  messagingSenderId: "509919675663",
  appId: "1:509919675663:web:5c98601ae97dcca3c4ea7a",
  measurementId: "G-QG8RYPPN56"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage) 
  });

export { auth };
