


import * as React from 'react';
import { ActivityIndicator, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
//import { encode as base64Encode } from 'base-64';


import { CameraType, useCameraPermissions, CameraView } from 'expo-camera';



import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export default function taskdeail() {

    const {id, title, summary, fecha_fin, segundaFirma} = useLocalSearchParams();
  const router = useRouter();

  
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema });
  
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
          setLoading(false);
          router.push({pathname: '/(tabs)'})
          // Aquí puedes realizar alguna acción después de la actualización, como navegar o mostrar un mensaje
        } catch (error) {
          console.error('Error al actualizar los datos:', error);
        }
      }


  if (segundaFirma) {
    if (permission) {
      if (!permission.granted) {
        // Mostrar mensaje de permisos no otorgados
        return (
          <View style={styles.container}>
            <View style={{ height: 100 }}></View>
            <Text>Necesitamos permiso para acceder a la cámara</Text>
            <Button onPress={requestPermission} title="Otorgar Permiso" />
          </View>
        );
      }
    }
  }

  return (
    <>
    {segundaFirma ? (
       <View style={styles.container}>
            <Text style={styles.header}>Segundo Formulario</Text>
      
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
    ):(
      <View style={styles.container}>
      <View style={styles.header}>
        
      </View>
      
      {/* <Image 
        source={imageSource} 
        style={styles.image} 
        resizeMode="cover"
      /> */}

      <View style={styles.content}>
      <Image
          borderRadius={8}
          source={require('../../assets/images/firma-digital.png')}
          //@ts-ignore
          style={[styles.image, { width: 200, height: 200 }]}
        />
        
        <View style={[styles.textSection, {paddingTop:20}]}>
          <Text style={styles.title}>{title}</Text>
   
        </View>
        
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Descripción:</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>

        <View style={{height:50}}></View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/formulario1',
              params: {
                id: id,
                title: title,
                fecha_fin: fecha_fin,
              },
            })
          }
        >
          <Text style={styles.buttonText}>Firmar</Text>
        </TouchableOpacity>

      </View>
    </View>
    )}
    </>
   
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
  },
 
  content: {
    flex: 1,
  },
  button: {
    backgroundColor: '#007bff', // Color de fondo (verde)
    paddingVertical: 12, // Espaciado vertical
    paddingHorizontal: 24, // Espaciado horizontal
    borderRadius: 8, // Bordes redondeados
    alignItems: 'center', // Centra el texto horizontalmente
    justifyContent: 'center', // Centra el contenido verticalmente
    margin: 10, // Margen alrededor del botón
    shadowColor: '#000', // Sombra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Para sombras en Android
    
  },
  buttonText: {
    color: '#FFF', // Color del texto
    fontSize: 16, // Tamaño de fuente
    fontWeight: 'bold', // Negrita
  },
  textSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 16,
    color: 'gray',
  },
  tecnico: {
    fontSize: 16,
    color: 'gray',
  },
  descriptionSection: {
    marginTop: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: 'gray',
  },
  image: {
    alignSelf: 'center',
    marginTop: 24,
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

