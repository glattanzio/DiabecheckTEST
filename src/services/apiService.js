//const API_URL = 'http://10.0.2.2:8000/mediciones/'; // Para emulador de Android
const API_URL = 'http://192.168.0.119:8000/mediciones/'; // Para emulador de Android


export const getData = async () => {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const postData = async (medicion) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicion),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};
