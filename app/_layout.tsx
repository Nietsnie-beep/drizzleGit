import { Stack } from 'expo-router';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations, migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { UserProvider } from '@/components/UserContext';

export const DATABASE_NAME = 'tasks';

export default function RootLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);

  
  const { success, error } = useMigrations(db, migrations);



  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense>
        <UserProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Tasks' }} />
            <Stack.Screen name="taskList" options={{ title: 'taskList' }} />
          </Stack>
         
            
      
        </UserProvider>
      </SQLiteProvider>
    </Suspense>
  );
}