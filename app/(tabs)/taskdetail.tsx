import * as React from 'react';
import { ActivityIndicator, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
//import { encode as base64Encode } from 'base-64';


import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';


import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';


interface id {
  id: number;
}


export default function form2() {

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

   const {id} = useLocalSearchParams();

  const [paths, setPaths] = React.useState<string[]>([]); // Lista de caminos (paths) de la firma
  const [currentPath, setCurrentPath] = React.useState<string>(''); // Camino (path) actual
  const signatureRef = React.useRef<Svg>(null);

  const [facing, setFacing] = React.useState<CameraType>('front');
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [cliente, setCliente] = React.useState<string>('');
  const [correo, setCorreo] = React.useState<string>('');
  const [notas, setNotas] = React.useState<string>('');

  const [clienteError, setClienteError] = React.useState<string>('');
  const [correoError, setCorreoError] = React.useState<string>('');

  const [loading, setLoading] = React.useState(false);

  const cameraRef = React.useRef<any>(null);



  const [images, setImages] = React.useState<Array<string | null>>([null, null, null, null]);

  const handleTouchStart = (event: any) => {
    // Inicializa el nuevo path en `currentPath` al empezar a dibujar
    const { nativeEvent } = event;
    const { locationX, locationY } = nativeEvent;
    setCurrentPath((prevPath) => `${prevPath}M${locationX} ${locationY}`);

  };

  const handleTouchMove = (event: any) => {
    // Agrega puntos al path actual
    const { nativeEvent } = event;
    const { locationX, locationY } = nativeEvent;
    setCurrentPath((prevPath) => `${prevPath} L${locationX} ${locationY}`);
  };

  const handleTouchEnd = () => {
    // Agrega el path actual a la lista de paths y reinicia `currentPath`
    // setPaths((prevPaths) => [...prevPaths, currentPath]);
    // setCurrentPath('');
  };

  const clearSignature = () => {
    // Limpia la firma

    setCurrentPath('');
  };

  const getBase64FromUri = async (uri: any) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return `${base64}`;
      }
    } catch (error) {
      console.error('Error al obtener el código base64:', error);
    }
    return null; // Devuelve null en caso de error
  };

  const handleSubmit = async () => {

    console.log("entre");
    setLoading(true);

    console.log("entre2");

    // Procesa la firma (si existe)
    let firmaBase64 = '';
    if (signatureRef.current) {
      try {
        const uri = await captureRef(signatureRef, {
          format: 'png',
          quality: 1,
        });

        const base64Firma = await getBase64FromUri(uri);
        if (base64Firma) {
          firmaBase64 = base64Firma;
        }
      } catch (error) {
        console.error('Error al capturar la firma:', error);
      }
    }

    console.log("entre3");

    let cameraImageBase64 = '';
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        //const photo = await CameraView.captureAsync(); // Supón que `captureAsync` es el método
        setPhotoUri(photo.uri);
        // Convierte la foto a base64 inmediatamente
        const base64 = await FileSystem.readAsStringAsync(photo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        cameraImageBase64 = `${base64}`;
      }

    } catch (error) {
      console.error('Error al capturar la foto:', error);
    }

    console.log("entre4");

    const data = {
      firma_2: firmaBase64,
      image_persona_2: cameraImageBase64,
      marca: 0,
    };

    console.log("hola");

    try {
      // Actualizar el registro donde el id coincida
      await drizzleDb.update(schema.tasks)
        .set(data)
        .where(eq(schema.tasks.id,parseInt(id.toString()))); // Asegúrate de usar el id correcto
  
      console.log('Datos actualizados correctamente:', data);
      // Aquí puedes realizar alguna acción después de la actualización, como navegar o mostrar un mensaje
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
    }


  if (permission) {
    if (!permission.granted) {
      // Camera permissions are not granted yet.
      return (
        <View style={styles.container}>
          <View style={{height:100}}></View>
        <Text>Necesitamos permiso para acceder a la cámara</Text>
        <Button onPress={requestPermission} title="Otorgar Permiso" />
      </View>
      );
    }
  }





  return (
    <View style={styles.container}>
      <Text style={styles.header}>Segundo Formularioo</Text>

      {/* Firma electrónica */}
      <View style={styles.signatureContainer}>
        <Text style={styles.sectionHeader}>Firma Electrónica:</Text>
        <View style={styles.signatureCanvas}>
          <Svg
            height="200"
            width="300"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            ref={signatureRef}
          >
            {paths.map((pathData, index) => (
              <Path key={index} d={pathData} fill="none" stroke="black" strokeWidth="2" />
            ))}
            <Path d={currentPath} fill="none" stroke="black" strokeWidth="2" />
          </Svg>
          <TouchableOpacity style={styles.clearButton} onPress={clearSignature}>
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vista previa de la cámara */}
      <View style={styles.cameraContainer}>
        <CameraView facing='front' style={styles.cameraPreview} ref={cameraRef} />
      </View>

      {/* Indicador de carga o botón de envío */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Enviando datos...</Text>
        </View>
      ) : (
        <Button title="Enviar" onPress={handleSubmit} />
      )}
    </View>
  );
}};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  signatureContainer: {
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: 18,
    marginBottom: 8,
  },
  signatureCanvas: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#ff4d4d',
    padding: 8,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
  },
  cameraContainer: {
    marginVertical: 16,
    height: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cameraPreview: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
});

