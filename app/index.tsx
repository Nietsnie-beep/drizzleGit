    import * as React from 'react';
    import { Image, Alert, TextInput, View, Text, TouchableOpacity, ScrollView } from 'react-native';
    import axios from 'axios';

    // import Images from '@/assets/images/dsi.png'
    import { API_HOST } from '@/components/api';
    import { useUserContext } from '@/components/UserContext';
    import { router } from 'expo-router';


    const Verify: React.FC = () => {
    
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

    const { setUserId } = useUserContext();

    const handleLogin = async () => {
        try {
        const response = await axios.get(`${API_HOST}/usuario_login/${password}/${email}/`);
        setIsAuthenticated(true);
        console.log(`${API_HOST}/usuario_login/${password}/${email}/`);
        console.log(response.data.id);

        setUserId(response.data.id);
        router.replace('/(tabs)');
        } catch (error) {
        Alert.alert("Error", "Identificadores Erróneos");
        console.log(error);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ alignItems: 'center', marginBottom: 100, marginTop: 100 }}>
            <Image
            source={require('@/assets/images/dsi.png')}
            style={{ width: 270, height: 100 }}
            />
        </View>
        
        <Text style={{ fontSize: 32, marginBottom: 16, textAlign: 'center' }}>Login</Text>
        <Text style={{ fontSize: 16, color: '#888', marginBottom: 32, textAlign: 'center' }}>Introduce tus credenciales para continuar</Text>
        
        {/* Email input field */}
        <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{
            height: 50,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 16,
            paddingLeft: 10,
            }}
        />
        
        {/* Password input field */}
        <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
            height: 50,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 16,
            paddingLeft: 10,
            }}
        />

        {/* Countdown (if needed) */}
        {/* <Text style={{ fontSize: 14, color: '#007bff' }}>
            Expira en {time}
        </Text> */}

        {/* Confirm button */}
        <TouchableOpacity
            onPress={handleLogin}
            style={{
            backgroundColor: '#007bff',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            }}
        >
            <Text style={{ color: '#fff', fontSize: 16 }}>Confirmar</Text>
        </TouchableOpacity>
        </ScrollView>
    );
    };

    export default Verify;
