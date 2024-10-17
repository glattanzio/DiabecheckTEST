import React, { useState, useEffect } from 'react';
import { storage } from './firebase';
import { styles } from './styles';
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import { View, Text, Image, StyleSheet} from 'react-native';

export const PicsPath = 'ProfilePics/'

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const storageRef = ref(storage, `uploads/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      alert('File uploaded successfully!');
    } catch (error) {
      alert('Error uploading file: ', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export const getFileUrl = async (filePath) => {
  const fileRef = ref(storage, filePath);
  try {
    const url = await getDownloadURL(fileRef);
    console.log('File URL: ', url);
    return url;
  } catch (error) {
    console.error('Error getting file URL: ', error);
    return 'ERROR';
  }
};

export const UserProfileImage = ({ imagePath }) => {
      const [imageUrl, setImageUrl] = useState(null);
      auxImagePath = `${PicsPath}${imagePath}`
      const fileRef = ref(storage, auxImagePath);
      useEffect(() => {
        const loadImage = async () => {
          try {
            const url = await getDownloadURL(fileRef);
            console.log('File URL: ', url);
            setImageUrl(url);
          } catch (error) {
            defaultImagePath = `${PicsPath}0.png`
            const defaultFileRef = ref(storage, auxImagePath);
            const defaultUrl = await getDownloadURL(defaultFileRef);
            console.log('Default File URL: ', defaultUrl);
            setImageUrl(defaultUrl);
          }
        };
        loadImage();
      }, [imagePath]);

      return (
        <View>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.patientPhoto} />
          ) : (
            <Image source={require('../auxImages/loading.png')} style={styles.patientPhoto} />
          )}
        </View>
      );
    };
export default FileUpload;