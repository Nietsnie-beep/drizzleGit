import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Touchable, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Link } from 'expo-router';
import { useUserContext } from '@/components/UserContext';
import axios from 'axios';
import { API_HOST } from '@/components/api';
import { eq } from 'drizzle-orm';
import migrations from '@/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { router } from 'expo-router';

interface Task {
  id: number;
  tecnico_nombre: string;
  cliente_nombre: string;
  titulo: string;
  description: string;
  fecha_creacion: string;
  fecha_vencimiento: string | null;
  status: number;
  status_envio: number;
  firma: string | null;
  recibio: string;
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  image_4: string | null;
  image_persona: string | null;
  correo: string | null;
  fotos: string | null;
  notas: string;
  estatus_pago: number;
  estatus_Factura: number;
  no_Factura: string | null;
  no_Factura_nota: string | null;
  porcentaje_de_pago: number | null;
  fecha_pago_nota: string | null;
  costo: number | null;
  precio: number;
  cobrado: number;
  resta: number;
  comision: number | null;
  comisionista: string | null;
  status_cobranza: number | null;
  precio_inicial: number;
  total_comision: number;
  firma_2: string | null;
  image_persona_2: string | null;
  estatus_firma_2: number;
  cliente: number;
  tecnico: number;
}

interface TaskDetailParams {
  title: string;
  author: string;
  duration: string;
  rating: number;
  reviewers: number;
  summary: string;
  imageSource: any; // Usa el tipo específico de la imagen si es posible
  id: number;
}




export default function HomeScreen() {

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const {userId } = useUserContext();

  const [selectedTab, setSelectedTab] = React.useState<null | number>(null);
  const [data, setData] = React.useState<Task[]>([]);
  const [filteredData, setFilteredData] = React.useState<Task[]>([]);
  const [searchText, setSearchText] = React.useState('');
  const [lista2daFirma, setlista2daFirma] = React.useState<any[]>([]);
  const [lista3, setlista3] = React.useState<any[]>([]);

  const [sistema, setSistema] = React.useState<string>("");
  const [refreshFlag, setRefreshFlag] = React.useState(false);

 
  const [selectedIndex, setSelectedIndex] = useState(null);

  
  


  React.useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await axios.get<Task[]>(
          `${API_HOST}/tareas_tecnico/${userId}`
        );

        const remoteData = response.data;
        
       
        console.log('Data:', userId);


        const localData1 = await drizzleDb
          .select()
          .from(schema.tasks)
          .where(eq(schema.tasks.marca, 1));

          setlista2daFirma(localData1)
        const localData2 = await drizzleDb
          .select()
          .from(schema.tasks)
          .where(eq(schema.tasks.marca, 0));

          setlista3(localData2)

        const localTaskIds = [
          ...localData1.map((task) => task.taskId),
          ...localData2.map((task) => task.taskId),
        ];
        
        const filteredData = remoteData.filter((task) => !localTaskIds.includes(task.id));
        setData(filteredData);

        // Filtro inicial: Solo tareas con `status === 1`
        setFilteredData(response.data.filter((task) => task.status === 1));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
      

     

     
    };
    fetchData();
  }, [refreshFlag]); // Solo se ejecuta al cargar la pantalla

  const applyFilters = () => {
    let updatedData = [...data];

    // Filtro de búsqueda por texto
    if (searchText) {
      updatedData = updatedData.filter(
        (task) =>
          task.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
          task.cliente_nombre.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(updatedData);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchText, data]);

  const handleNavigateToDetail = (task: Task) => {
    router.push({
      pathname: '/(tabs)/explore', // Ruta de destino
      params: {
        id: task.id,
        title: task.titulo,
        tecnico_nombre: task.tecnico_nombre,
        fecha_fin: task.fecha_vencimiento,
        summary: task.description,
      },
    });

  };

  const handleSendTaskAsync = async (task: any) => {
    // Crear un objeto con solo los campos válidos
    const dataToSend = {
      cliente: task.cliente,
      correo: task.correo,
      notas: task.notas,
      image_1_base64: task.image_1_base64,
      image_2_base64: task.image_2_base64,
      image_3_base64: task.image_3_base64,
      image_4_base64: task.image_4_base64,
      firma_base64: task.firma_base64,
      firma_2: task.firma_2,
      image_persona_2: task.image_persona_2,
      foto: task.foto_base64,
      status_envio: 1,
      status: 2,
      status_firma_2:3,
      marca: task.marca,

    };

    const dataToSend2 = {
      status:2,
      status_envio: 1,
    }

    console.log("onformacion trata de enviar: " + task.cliente);
    console.log("onformacion trata de enviar: " + task.correo);
    console.log("onformacion trata de enviar: " + task.notas);


    
  
    // Ahora puedes enviar el objeto con los datos al servidor
    try {
      const response = await axios.put(`${API_HOST}/update/${task.taskId}/`, dataToSend);
      console.log('Respuesta del servidor:', response.data);

      try {
        const deleteResult = await drizzleDb
          .delete(schema.tasks)
          .where(eq(schema.tasks.id, task.id));
        setlista3((prevLista) => prevLista.filter((item) => item.id !== task.id));
        console.log('Registro eliminado de la base de datos local:', deleteResult);
      } catch (deleteError) {
        console.error('Error al eliminar el registro de la base de datos local:', deleteError);
      }

      // const response2 = await axios.put(`${API_HOST}/update/${task.taskId}/`, dataToSend2);
      // console.log('Respuesta del servidor2:', response2.data);
     
      //navigation.navigate('taskList') 
      Alert.alert('Éxito', 'Tarea enviada correctamente.');
    } catch (error) {
      console.error('Error al enviar los datos al servidor:', error);
      // Manejo de errores, como mostrar un mensaje de error
      Alert.alert('Error', 'No se pudo enviar la tarea. Por favor, intenta de nuevo.');

    }
  };

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    if (index === 0) {
      // Tab "Primera Firma": Filtrar tareas finalizadas
      setFilteredData(data.filter((task) => task.status === 1));
    } else if (index === 1) {
      // Tab "Segunda Firma": Filtrar tareas activas
      setFilteredData(data.filter((task) => task.status === 3));
    }
  };
  const simulateApiCall = (item: any) => {
    console.log('Simulated API call with data:', JSON.stringify(item, null, 2));
    //
    // Alert.alert('Simulación de envío', 'Datos enviados a la API simulada.');
  };

  const getColorByDate = (fechaVencimiento:any) => {
    const today = new Date();
    const expirationDate = new Date(fechaVencimiento);

    // Calcula la diferencia en días (ajustando las horas a 0)
    const differenceInTime = expirationDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

    console.log("diferencia" + differenceInDays);
    

    if (differenceInDays >= 1) return 'green'; // Más de 1 día
    if (differenceInDays === 0) return 'yellow'; // Mismo día
    return 'red'; // Fecha vencida o mañana
  };


  const handleDeleteTask = async (item:any) => {
    try {
      await drizzleDb.delete(schema.tasks).where(eq(schema.tasks.taskId, item.taskId));
      console.log(`Tarea con ID ${item.taskId} eliminada`);
      // Opcional: Actualiza la lista local si es necesario
      setlista3((prevLista) => prevLista.filter((task) => task.taskId !== item.taskId));
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
    }
  };

  

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
    <Text style={styles.title}>ID: {item.id}</Text>
    <Text>Cliente: {item.cliente}</Text>
    <Text>Correo: {item.correo}</Text>
    <Text>Notas: {item.notas}</Text>
    <TouchableOpacity
      style={styles.button}
      onPress={() => simulateApiCall(item)}
    >
      <Text style={styles.buttonText}>Enviar a API</Text>
    </TouchableOpacity>
  </View>
  );



  return (
    <SafeAreaView style={styles.container}>
    {/* Header */}
    <View style={[styles.header, { paddingTop: 20+ 4 }]}>
      {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
        <Text style={styles.navButtonText}>Atrás</Text>
      </TouchableOpacity> */}
      <Text style={styles.title}>Hola!</Text>
    </View>

    {/* Tab Bar */}
    <View style={styles.tabBar}>
      {['Primera', 'Segunda', 'Pendientes'].map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tab, selectedTab === index && styles.activeTab]}
          onPress={() => handleTabChange(index)}
        >
          <Text style={[styles.tabText, selectedTab === index && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <View>
      
    </View>

  

    {/* Content */}
    <FlatList
      data={
        selectedTab === 0
          ? filteredData
          : selectedTab === 1
          ? lista2daFirma
          : lista3
      }
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {/* <Image source={getStatusImage(item.fecha_vencimiento)} style={styles.smallImage} /> */}
            <Text style={styles.cardTitle}>
              {item.titulo}
            </Text>
          </View>
          <View style={styles.cardDetails}>
          <View
        style={[
          styles.circle,
          { backgroundColor: getColorByDate(item.fecha_vencimiento) }, // Cambia el color dinámicamente
        ]}
      />
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{item.fecha_vencimiento}</Text>
          
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (selectedTab === 0) {
                handleNavigateToDetail(item);
              } else if (selectedTab === 1) {
                //navigation.navigate('FormFirma2', { id: item.id });
                router.push({
                  pathname: '/(tabs)/explore', // Ruta de destino
                  params: {
                    id: item.id,
                    segundaFirma: 1
                  },
                });
            
              } else {
                handleSendTaskAsync(item);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {selectedTab === 0 ? 'Ver Detalle' : selectedTab === 1 ? 'Firmar' : 'Enviar'}
            </Text>
          </TouchableOpacity>

          {selectedTab === 2 && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]} // Agrega un estilo diferente para el botón de eliminar
              onPress={() => handleDeleteTask(item)}
            >
              <Text style={styles.buttonText}>Eliminar {item.notas}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  </SafeAreaView>
    
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
  circle: {
    width: 24, // Ancho del círculo
    height: 24, // Alto del círculo
    borderRadius: 12, // Hace que sea perfectamente circular
    marginLeft: 5, // Espacio entre el texto y el círculo
    marginRight:10
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2, // Para sombra en Android
    shadowColor: '#000', // Para sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  button: {
    marginTop: 16,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
 
  header: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    marginRight: 16,
  },
  navButtonText: {
    fontSize: 16,
    color: '#007BFF',
  },
 
  deleteButton: {
    marginTop: 16,
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    color: '#007BFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#555',
  },
  search: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  content: {
    paddingHorizontal: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  value: {
    color: '#555',
  },
});