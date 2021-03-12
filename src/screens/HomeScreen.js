import React, { Component } from 'react';
import { View, Image } from 'react-native';
import { Text } from 'react-native-elements';
import Colors from '../values/Colors';
import StatusBar from '../components/StatusBar';
import { getUsuario } from '../utils/LoginManager';
import DeviceInfo from 'react-native-device-info';

export default class HomeScreen extends Component {

    state = {};

    async UNSAFE_componentWillMount() {
        const usuario = await getUsuario();
        this.setState({ usuario });
    }

    render() {
        const { usuario } = this.state;

        if (!usuario) return null;

        return (
            <View style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, justifyContent: 'center' }}>

                <StatusBar />

                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingHorizontal: 20,
                        paddingVertical: 20,
                    }}
                >
                    <Image
                        style={{
                            width: '100%',
                        }}
                        resizeMode="contain"
                        source={require('../drawables/logo_pequeno.png')}
                    />

                    <Text
                        style={{
                            color: Colors.textSecondaryDark,
                            fontSize: 14,
                            flex: 1,
                        }}
                    >
                        Versão: {DeviceInfo.getVersion()}
                    </Text>
                </View>

                {/* <Text
                    style={{
                        fontSize: 30,
                        textAlign: 'center'
                    }}>
                    Olá, bem vindo ao APP SIGA PRO.
                </Text> */}

            </View>
        )
    }
}