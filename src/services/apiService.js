//export const API_IP = '10.0.2.16'; // Para emulador de Android
export const API_IP = '192.168.0.113'; // Para emulador de Android


export const getData = async () => {
  try {
    const response = await fetch(`http://${API_IP}:8000/measurements/data`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const postData = async (measurement) => {
  try {
    const response = await fetch(`http://${API_IP}:8000/measurements/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(measurement),
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
