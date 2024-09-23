//export const API_IP = '10.0.2.16'; // Para emulador de Android
export const API_IP = '192.168.0.7'; // Para emulador de Android


export const getData = async () => {
  try {
    const response = await fetch(`http://${API_IP}:8000/mediciones/data`);
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
    const response = await fetch(`http://${API_IP}:8000/mediciones/`, {
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
