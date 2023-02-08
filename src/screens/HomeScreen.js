import React, {Component} from 'react';
import {View, Image, SafeAreaView, Pressable} from 'react-native';
import {Header, Icon, Text} from 'react-native-elements';
import Colors from '../values/Colors';
import StatusBar from '../components/StatusBar';
import {getUsuario} from '../utils/LoginManager';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import HeaderComponent from "../components/HeaderComponent";

export default class HomeScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            netStatus: 1,
        };

        NetInfo.addEventListener(state => {
            this.onNetEvento(state)
        });
    }

    onNetEvento = (info) => {
        let state = this.state;
        // console.log('onNetEvento: ', info)
        if (info.isConnected) {
            state.netStatus = 1;
        } else {
            state.netStatus = 0;
        }
        this.setState(state);
    }

    async UNSAFE_componentWillMount() {
        const usuario = await getUsuario();
        this.setState({usuario});
    }

    render() {
        const {usuario} = this.state;

        if (!usuario) return null;

        return (
            <SafeAreaView style={{backgroundColor: '#1F829C', flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Home'}
                    pressLeftComponen={() => this.props.navigation.openDrawer()}
                    iconLeftComponen={'menu'}
                />

                <View style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    backgroundColor: 'white'
                }}>

                    <StatusBar/>

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

                        {this.state.netStatus ? null : (
                            <Text style={{textAlign: 'center', color: '#d50000', marginTop: 10}}>
                                Dispositivo sem conexão
                            </Text>
                        )}
                    </View>

                    {/* <Text
                    style={{
                        fontSize: 30,
                        textAlign: 'center'
                    }}>
                    Olá, bem vindo ao APP SIGA PRO.
                </Text> */}

                </View>

            </SafeAreaView>
        )
    }
}