import React, { Component } from 'react';
import { View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, Divider } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import axios from 'axios';
import Icon from "react-native-vector-icons/FontAwesome";

import Colors from '../values/Colors';
import StatusBar from '../components/StatusBar';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { validateSenha, checkFormIsValid, validateSelect } from '../utils/Validator';
import { saveToken } from '../utils/LoginManager';
import DeviceInfo from 'react-native-device-info';

export default class LoginScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            usuario: '',
            senha: '',
        };
    }

    onFormSubmit = (event) => {
        if (checkFormIsValid(this.refs)) {
            this.postLogin();
        }
    }

    postLogin = () => {
        this.setState({ loading: true });
        const { usuario, senha } = this.state;

        axios.post("/usuarios/login", {
            usuario,
            senha,
            tipoAcesso: 'SIGAPRO'
        }).then(async response => {
            await saveToken(response.data.token);
            this.goToHome()
        }).catch(error => {
            console.warn('Erro Login: ', error);
            this.setState({ loading: false });
            if (error.response) {
                if (error.response.status === 401) {
                    alert("Usuário ou Senha Incorreto");
                } else {
                    alert("Entre em contato com o suporte do sistema.");
                }
            } else {
                alert('Não foi possível se comunicar com o servidor, verifique sua conexão com a Internet.');
            }
        })
    }

    goToHome = () => {
        // FECHA A TELA DE LOGIN E ABRE A TELA DE HOME
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: "HomeScreen" })
            ]
        })

        this.props.navigation.dispatch(resetAction);
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    render() {
        const { usuario, senha, loading } = this.state;

        return (
            <View style={{ flex: 1, }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="handled"
                >


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


                    <View style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16 }}>

                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                label="Usuário"
                                id="usuario"
                                ref="usuario"
                                value={usuario}
                                onChange={this.onInputChange}
                                validator={text => Boolean(text)} // verifica se o campo está vazio ou válido
                                required={true}
                                errorMessage="Informe o usuário de acesso."
                                autoCapitalize="none"
                                style={{
                                    width: '90%',
                                    marginLeft: 10,
                                    marginRight: 10,
                                }}
                            />
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                label="Senha"
                                id="senha"
                                ref="senha"
                                value={senha}
                                onChange={this.onInputChange}
                                secureTextEntry={true}
                                validator={validateSenha}
                                required={true}
                                errorMessage="Informe a Senha de acesso."
                                style={{
                                    width: '90%',
                                    marginLeft: 10,
                                    marginRight: 10,
                                }}
                            />
                        </View>

                        <Divider />

                        <Button
                            title="ENTRAR"
                            loading={loading}
                            onPress={this.onFormSubmit}
                            color={Colors.textOnPrimary}
                            icon={{
                                name: 'sign-in',
                                type: 'font-awesome',
                                color: Colors.textOnPrimary
                            }}
                        />

                    </View>

                </ScrollView>
            </View>
        )
    }
}
