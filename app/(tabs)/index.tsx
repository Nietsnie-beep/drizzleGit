import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Touchable, TouchableOpacity, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

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

export default function HomeScreen() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [cliente, setCliente] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [imagen1, setImagen1] = useState<string>('');
  const [imagen2, setImagen2] = useState<string>('');
  const [imagen3, setImagen3] = useState<string>('');
  const [imagen4, setImagen4] = useState<string>('');
  const [firma, setFirma] = useState<string>('');
  const [foto, setFoto] = useState<string>('');
  const [listId, setListId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);

  const [paths, setPaths] = React.useState<string[]>([]); // Lista de caminos (paths) de la firma
  const [currentPath, setCurrentPath] = React.useState<string>(''); // Camino (path) actual
  const signatureRef = React.useRef<Svg>(null);

  // Cargar datos al iniciar
    useEffect(() => {
    const loadData = async () => {
      const fetchedTasks = await drizzleDb.query.tasks.findMany();
      setTasks(fetchedTasks);
    };
    loadData();
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


  const addTask = async () => {
    if (!cliente || !correo || !listId) {
      return alert('Cliente, Correo y List ID son obligatorios');
    }
  
    // Capturamos la firma en base64
    const firmaBase64 = await captureSignature();
  
    // Insertamos los datos en la base de datos
    await drizzleDb.insert(schema.tasks).values({
      cliente,
      correo,
      notas,
      imagen1,
      imagen2,
      imagen3,
      imagen4,
      firma: firmaBase64,  // Guardamos la firma en base64
      foto,
      list_id: Number(listId),
    });
  
    // Actualizamos la lista de tareas
    const updatedTasks = await drizzleDb.query.tasks.findMany();
    setTasks(updatedTasks);
  
    // Limpiamos el formulario
    setCliente('');
    setCorreo('');
    setNotas('');
    setImagen1('');
    setImagen2('');
    setImagen3('');
    setImagen4('');
    setFirma('');
    setFoto('');
    setListId('');
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
      <TextInput
        style={styles.input}
        placeholder="Imagen 1"
        value={imagen1}
        onChangeText={setImagen1}
      />
      <TextInput
        style={styles.input}
        placeholder="Imagen 2"
        value={imagen2}
        onChangeText={setImagen2}
      />
      <TextInput
        style={styles.input}
        placeholder="Imagen 3"
        value={imagen3}
        onChangeText={setImagen3}
      />
      <TextInput
        style={styles.input}
        placeholder="Imagen 4"
        value={imagen4}
        onChangeText={setImagen4}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Foto"
        value={foto}
        onChangeText={setFoto}
      />
      <TextInput
        style={styles.input}
        placeholder="List ID"
        value={listId}
        onChangeText={setListId}
        keyboardType="numeric"
      />
      <Button title="Agregar Registro" onPress={addTask} />

      <Text style={styles.title}>Registros</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>
            ID: {item.firma}, Cliente: {item.cliente}, Correo: {item.correo}, List ID: {item.list_id}
          </Text>
        )}
      />
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
});