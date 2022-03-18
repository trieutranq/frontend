import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';
// cho vinh ngu
// https://youtu.be/Y8OEWhO1qoI

export default function App() {
  // cấp quyền camera cho app
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image_uri, setImageURI] = useState(null);
  const [image_base64, setImageB64] = useState(null);
  const [base64_code, setBase64] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []);
  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }



  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync({ quality: 0.5, base64: true })
      setImageURI(data.uri);
      setImageB64(data.base64);
      const formdata = new FormData()
      formdata.append('uri', data.uri)
      formdata.append('base64', data.base64)

      const res = await fetch("http://192.168.1.10:8000/", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formdata
      })
        .then(res => { console.log("Sent") })
        .catch(res => { console.log('Error') })


    }
  }
  const Generate = async () => {

    const res = await fetch('http://192.168.1.10:8000/predict', {
      method: 'GET',
      headers: {
        'Accept': 'application/string',
        'Content-Type': 'application/string',
      },
    })
      .then((response) => {
        return response.text();
      }).then((data) => {
        // console.log(JSON.parse(data))\
        setBase64(data)

      })

  }

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={ref => setCamera(ref)}
          style={styles.fixedRatio}
          type={type}
          ratio={'1:1'} />
      </View>
      <Button
        title="Flip Image"
        onPress={() => {
          setType(
            type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
          );
        }}>
      </Button>
      <Button title="Take Picture" onPress={() => takePicture()} />
      <Button title="Generate" onPress={() => Generate()} />
      {/* image_uri && */}
      {<Image source={{ uri: 'data:image/png;base64,' + base64_code }} style={{ flex: 1 }} />}

    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1
  }
});
