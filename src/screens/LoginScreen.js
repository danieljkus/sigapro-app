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
            carregandoEmpresa: false,
            loading: false,
            usuario: '',
            senha: '',
            empresa: 0,
            empresaSelect: [{ label: "Selecione uma Empresa", key: 0 }],
        };
    }

    onFormSubmit = (event) => {
        const { empresa } = this.state;
        if ((checkFormIsValid(this.refs)) && empresa) {
            this.postLogin();
        }
    }

    postLogin = () => {
        this.setState({ loading: true });
        const { usuario, senha, empresa } = this.state;

        axios.post("/usuarios/login", {
            usuario,
            senha,
            empresa,
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

    buscaEmpresas = () => {
        const { usuario } = this.state;
        if (usuario) {
            this.setState({ empresaSelect: [], carregandoEmpresa: true });

            axios.get('/listaEmpresasLogin', {
                params: {
                    usuario: usuario
                }
            }).then(response => {
                const { data } = response;
                const empresaSelect = data.map(regList => {
                    return {
                        key: regList.adm_emp_codigo,
                        label: regList.adm_pes_nome
                    }
                });

                if (data.length > 0) {
                    this.setState({
                        empresaSelect,
                        empresa: empresaSelect[0].key,
                        carregandoEmpresa: false
                    })
                } else {
                    this.setState({
                        empresaSelect: [{ label: "Selecione uma Empresa", key: 0 }],
                        carregandoEmpresa: false,
                    });
                }
            }).catch(error => {
                console.warn(error.response);
                this.setState({
                    empresaSelect: [{ label: "Selecione uma Empresa", key: 0 }],
                    carregandoEmpresa: false,
                });
            })
        }
    }

    render() {
        const { usuario, senha, empresa, empresaSelect, loading, carregandoEmpresa } = this.state;

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
                                onBlur={this.buscaEmpresas}
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

                        {/* <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            {carregandoEmpresa
                                ? (
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        <ActivityIndicator
                                            style={{
                                                margin: 10,
                                            }}
                                        />
                                        <Text>
                                            Buscando Empresas
                                        </Text>
                                        <Divider />
                                    </View>
                                )
                                : (
                                    <TextInput
                                        label="Empresa"
                                        type="select"
                                        id="empresa"
                                        ref="empresa"
                                        options={empresaSelect}
                                        onChange={this.onInputChange}
                                        required={true}
                                        errorMessage="Selecione uma Empresa."
                                        value={empresa}
                                    />
                                )
                            }

                        </View> */}

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
