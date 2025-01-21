import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const TaskDetail = () => {
    const { id, title, tecnico_nombre, fecha_fin } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Go Back"
          onPress={() => router.back()} // Usando router para navegar hacia atrás
        />
      </View>
      
      {/* <Image 
        source={imageSource} 
        style={styles.image} 
        resizeMode="cover"
      /> */}

      <View style={styles.content}>
        <Button
          title="Firmar"
          onPress={() => router.push({
            pathname: `/(tabs)/formulario1`,
            params: {
              id: id,
              title: title,
              fecha_fin: fecha_fin,
            },
          })} // Usando router.push() para navegar a otra página
        />
        
        <View style={styles.textSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.author}>Cliente: {author}</Text>
          <Text style={styles.tecnico}>Técnico: {tecnico_nombre}</Text>
        </View>
        
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Descripción:</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
      </View>
    </View>
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    flex: 1,
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
});

export default TaskDetail;