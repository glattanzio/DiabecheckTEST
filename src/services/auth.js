import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const config = {
  expoClientId: '122952403313-6qoigrhkr5vltjfvvr33nv4enh7dtace.apps.googleusercontent.com',
  iosClientId: '',
  androidClientId: '122952403313-hpo5dunu9fbui0aebt8asffs4uuje1m9.apps.googleusercontent.com',
  webClientId: '122952403313-6qoigrhkr5vltjfvvr33nv4enh7dtace.apps.googleusercontent.com',
};

export const useGoogleAuthentication = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: config.expoClientId,
    redirectUri: 'https://auth.expo.io/@martincosta/diabecheckapp',
  });

  useEffect(() => {
    console.log('Request:', request);
    console.log('Response:', response);
  }, [request, response]);

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('Authentication response received:', response);
      const { id_token } = response.params;
      console.log('ID Token:', id_token);
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          console.log('Successfully signed in');
        })
        .catch((error) => {
          console.error('Error signing in with credential:', error);
        });
    } else if (response?.type === 'error') {
      console.error('Authentication error:', response.params.error);
    }
  }, [response]);

  return { promptAsync };
};
