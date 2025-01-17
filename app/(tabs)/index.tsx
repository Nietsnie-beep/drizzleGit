import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [taskName, setTaskName] = useState('');
  const [listName, setListName] = useState('');
  const [listId, setListId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      const fetchedTasks = await drizzleDb.query.tasks.findMany();
      const fetchedLists = await drizzleDb.query.lists.findMany();
      setTasks(fetchedTasks);
      setLists(fetchedLists);
    };
    loadData();
  }, []);

  // Agregar una nueva lista
  const addList = async () => {
    if (!listName) return alert('List name cannot be empty');
    await drizzleDb.insert(schema.lists).values({ name: listName });
    const updatedLists = await drizzleDb.query.lists.findMany();
    setLists(updatedLists);
    setListName('');
  };

  // Agregar una nueva tarea
  const addTask = async () => {
    if (!taskName || !listId) return alert('Task name and List ID are required');
    await drizzleDb.insert(schema.tasks).values({ name: taskName, list_id: Number(listId) });
    const updatedTasks = await drizzleDb.query.tasks.findMany();
    setTasks(updatedTasks);
    setTaskName('');
    setListId('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New List</Text>
      <TextInput
        style={styles.input}
        placeholder="List Name"
        value={listName}
        onChangeText={setListName}
      />
      <Button title="Add List" onPress={addList} />

      <Text style={styles.title}>Add New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
      />
      <TextInput
        style={styles.input}
        placeholder="List ID"
        value={listId}
        onChangeText={setListId}
        keyboardType="numeric"
      />
      <Button title="Add Task" onPress={addTask} />

      <Text style={styles.title}>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.id}: {item.name} (List ID: {item.list_id})
          </Text>
        )}
      />

      <Text style={styles.title}>Lists</Text>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.id}: {item.name}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
