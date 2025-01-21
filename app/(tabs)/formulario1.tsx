import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Touchable, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';


interface Task {
  id: number;
  cliente: string;
  correo: string;
  notas: string | null;
  imagen1: string | null;
  imagen2: string | null;
  imagen3: string | null;
  imagen4: string | null;
  firma: string | null;
  foto: string | null;
  list_id: number;
}


interface Task2 {
  id: number;
  cliente: string;
  
}

export default function HomeScreen() {
  const {id, title, fecha_fin } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });


  const [cliente, setCliente] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [firma, setFirma] = useState<string>('');
  const [foto, setFoto] = useState<string>('');
  const [listId, setListId] = useState<string>('');
  const [tasks, setTasks] = useState<Task2[]>([]);
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);

  const [paths, setPaths] = React.useState<string[]>([]); // Lista de caminos (paths) de la firma
  const [currentPath, setCurrentPath] = React.useState<string>(''); // Camino (path) actual
  const signatureRef = React.useRef<Svg>(null);

  const [images, setImages] = React.useState<Array<string | null>>([null, null, null, null]);

  const cameraRef = React.useRef<any>(null);

  const [idNumero, setIdNumero] = useState<number>(0);



  // Cargar datos al iniciar
    useEffect(() => {
    const loadData = async () => {
      const fetchedTasks = await drizzleDb.query.tasks.findMany({
        columns: {
          id: true,
          cliente: true,
          marca: true
        },
      });
      setTasks(fetchedTasks);
    };
    loadData();

    console.log("id " + id);
    

    setIdNumero(parseInt(id.toString(), 10))
  }, []);


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

  const captureSignature = async () => {
    try {
      if (signatureRef.current) {
        const uri = await captureRef(signatureRef, {
          format: 'png',
          quality: 1,
        });
        const base64Firma = await getBase64FromUri(uri);
        return base64Firma;
      }
    } catch (error) {
      console.error('Error al capturar la firma:', error);
    }
    return null;
  };

  const handleTouchStart = (event: any) => {
    // Inicializa el nuevo path en `currentPath` al empezar a dibujar
    //setScrollEnabled(false);
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
    //setScrollEnabled(true); // Reactivar scroll
    // Agrega el path actual a la lista de paths y reinicia `currentPath`
    // setPaths((prevPaths) => [...prevPaths, currentPath]);
    // setCurrentPath('');
  };

  const clearSignature = () => {
    // Limpia la firma

    setCurrentPath('');
  };

  const handleImagePicker = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      console.error('Permiso denegado para acceder a la biblioteca de medios.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;  // Acceder al URI de la imagen
      setImages(newImages);
    }
  };


  const addTask = async () => {
    if (!cliente || !correo ) {
      return alert('Cliente, Correo y List ID son obligatorios');
    }
  
    // Capturamos la firma en base64
    const firmaBase64 = await captureSignature();

    const imageBase64Array: string[] = [];
    for (const image of images) {
      if (image) {
        try {
          const imageInfo = await FileSystem.getInfoAsync(image);
          if (imageInfo.exists) {
            const base64 = await FileSystem.readAsStringAsync(image, {
              encoding: FileSystem.EncodingType.Base64,
            });
            imageBase64Array.push(`${base64}`);
          }
        } catch (error) {
          console.error('Error al convertir la imagen a base64:', error);
        }
      }
    }

    while (imageBase64Array.length < 4) {
      imageBase64Array.push(''); // Si no hay suficientes imágenes, agrega valores vacíos
    }

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

    const data = {
        taskId:idNumero,
        titulo: title.toString(),
        fecha_vencimiento: fecha_fin.toString(),
        image_1_base64: imageBase64Array[0],
        image_2_base64: imageBase64Array[1],
        image_3_base64: imageBase64Array[2],
        image_4_base64: imageBase64Array[3],
        firma_base64: firmaBase64,
        status_envio: 1,
        cliente: cliente,
        correo: correo,
        foto: cameraImageBase64,
        notas: notas,
        marca: 1,
        // status: 3,
      };

      try {
        await drizzleDb.insert(schema.tasks).values(data);
        console.log('Datos guardados localmente:', data);
        // Redirigir o mostrar un mensaje según sea necesario
        router.push(`/(tabs)`)
      } catch (error) {
        console.error('Error al guardar los datos localmente:', error);
      }


  
    // Insertamos los datos en la base de datos
    // await drizzleDb.insert(schema.tasks).values({
    //   cliente,
    //   correo,
    //   notas,
    //   imagen1: imageBase64Array[0],
    //   imagen2: imageBase64Array[1],
    //   imagen3: imageBase64Array[2],
    //   imagen4: imageBase64Array[3],
    //   firma: firmaBase64,  // Guardamos la firma en base64
    //   foto: cameraImageBase64,
    //   list_id: Number(listId),
    // });
  
    // Actualizamos la lista de tareas
    // const fetchedTasks = await drizzleDb.query.tasks.findMany({
    //   columns: {
    //     id: true,
    //     cliente: true,
    //   },
    // });
    // setTasks(fetchedTasks);
  
    // // Limpiamos el formulario
    // setCliente('');
    // setCorreo('');
    // setNotas('');
    // setImages([null, null, null, null]);
    // setFirma('');
    // setFoto('');
    // setListId('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agregar Nuevo Registro</Text>
      <TextInput
        style={styles.input}
        placeholder="Cliente"
        value={cliente}
        onChangeText={setCliente}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Notas"
        value={notas}
        onChangeText={setNotas}
      />
        <View>
            <View style={styles.imageRow}>
              {images.slice(0, 2).map((image, index) => (
                <View key={index} style={styles.imagePickerContainer}>
                  <TouchableOpacity
                    style={styles.largeImagePickerButton}
                    onPress={() => handleImagePicker(index)}
                  >
                    {image ? (
                      <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                      <Text>Elegir Imagen {index + 1}</Text>
                    )}
                  </TouchableOpacity>
                  <Text>Imagen {index + 1}</Text>
                </View>
              ))}
            </View>
            <View style={styles.imageRow}>
              {images.slice(2, 4).map((image, index) => (
                <View key={index + 2} style={styles.imagePickerContainer}>
                  <TouchableOpacity
                    style={styles.largeImagePickerButton}
                    onPress={() => handleImagePicker(index + 2)}
                  >
                    {image ? (
                      <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                      <Text>Elegir Imagen {index + 3}</Text>
                    )}
                  </TouchableOpacity>
                  <Text>Imagen {index + 3}</Text>
                </View>
              ))}
            </View>
          </View>
     <View style={styles.signatureContainer}>
  <Text>Firma Electrónica:</Text>
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
        <Path
          key={index}
          d={pathData}
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
      ))}
      <Path d={currentPath} fill="none" stroke="black" strokeWidth="2" />
    </Svg>
    <TouchableOpacity style={styles.clearButton} onPress={clearSignature}>
      <Text>Limpiar</Text>
    </TouchableOpacity>
  </View>
</View>
<View style={styles.cameraContainer}>
            <CameraView
              facing='front'
              style={styles.cameraPreview}
              ref={cameraRef}
            >
              <View style={{ height: 300 }}></View>
            </CameraView>
          </View>

    
      {/* <Link href="/explore" asChild> */}
      <Button title="Agregar Registro" onPress={addTask} />
    
      <View style={{height:100}}>
        </View>
     </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  signatureContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  imagePickerContainer: {
    alignItems: 'center',
  },  
  largeImagePickerButton: {
    width: 100,
    height: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  signatureCanvas: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPreview: {
    width: '100%',
    height: '100%',
  },
});