import React, {Component} from 'react';
import {View, ScrollView, Image, ActivityIndicator} from 'react-native';
import {Text, Divider} from 'react-native-elements';
import {NavigationActions, SafeAreaView, StackActions} from 'react-navigation';
import axios from 'axios';
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-community/async-storage';

import Colors from '../values/Colors';
import StatusBar from '../components/StatusBar';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import {validateSenha, checkFormIsValid, savePermissoes} from '../utils/Validator';
import {saveToken} from '../utils/LoginManager';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import HeaderComponent from "../components/HeaderComponent";
import {maskCPF} from "../utils/Maskers";

export default class LoginScreen extends Component {

    static navigationOptions = {
        headerShown: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            usuario: '',
            senha: '',
            empresa: 0,
            empresaSelect: [],
            netStatus: 1,
        };

        NetInfo.addEventListener(state => {
            this.onNetEvento(state)
        });
    }

    onNetEvento = (info) => {
        let state = this.state;
        if (info.isConnected) {
            state.netStatus = 1;
        } else {
            state.netStatus = 0;
        }
        this.setState(state);
    }


    componentDidMount() {

    }

    onFormSubmit = (event) => {
        if (checkFormIsValid(this.refs)) {
            this.postLogin();
        }
    }

    postLogin = () => {
        this.setState({loading: true});
        const {usuario, senha, empresa} = this.state;

        if (this.state.netStatus) {
            axios.post("/usuarios/login", {
                usuario,
                senha,
                empresa,
                tipoAcesso: 'SIGAPRO'
            }).then(async response => {

                // console.log('postLogin: ', response.data);

                await saveToken(response.data.token);
                AsyncStorage.setItem('SIGAPRO-permissoes', JSON.stringify(response.data.permissoes))
                this.goToHome()
            }).catch(error => {
                console.warn('Erro Login: ', error);
                this.setState({loading: false});
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
        } else {
            if ((usuarioAux) && (usuarioAux.usu_cpf === usuario) && (senhaAux === senha)) {
                getTokenAux().then(tokenAux => {
                    saveToken(tokenAux);
                    saveSenha(senha);
                    this.goToHome()
                })
            } else {
                this.setState({loading: false});
                Alert.showAlert('Senha Incorreta');
            }
        }
    }

    goToHome = () => {
        // FECHA A TELA DE LOGIN E ABRE A TELA DE HOME
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({routeName: "HomeScreen", props: this.props})
            ]
        });

        this.props.navigation.dispatch(resetAction);
    };

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    buscaEmpresas = () => {
        const {usuario} = this.state;
        if (usuario) {
            this.setState({empresaSelect: [], carregandoEmpresa: true});

            axios.get('/listaEmpresasLogin', {
                params: {
                    usuario: usuario,
                    app: 'SIGAPRO',
                }
            }).then(response => {
                const {data} = response;
                const empresaSelect = data.map(regList => {
                    return {
                        key: regList.adm_emp_codigo,
                        label: regList.adm_pes_nome
                    }
                });

                this.setState({
                    empresaSelect,
                    empresa: empresaSelect.length > 0 ? empresaSelect[0].key : 0,
                    carregandoEmpresa: false
                })
            }).catch(error => {
                console.warn(error.response);
                this.setState({
                    carregandoEmpresa: false,
                });
            })
        }
    }


    render() {
        const {usuario, senha, empresa, empresaSelect, loading} = this.state;
        return (
            <SafeAreaView style={{backgroundColor: 'white', flex: 1, justifyContent: 'center'}}>
                <StatusBar/>
                <View style={{backgroundColor: 'white', flex: 1, justifyContent: 'center'}}>


                    <View
                        style={{
                            // flex: 1,
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
                                color: Colors.mediumGray,
                                fontSize: 14,
                                // flex: 1,
                            }}
                        >
                            Versão: {DeviceInfo.getVersion()}
                        </Text>

                        {this.state.netStatus
                            ? null : (
                                <Text style={{textAlign: 'center', color: '#d50000'}}> Dispositivo sem
                                    conexão </Text>
                            )}
                    </View>


                    <View style={{paddingVertical: 8, paddingHorizontal: 16}}>

                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <TextInput
                                label="Usuário"
                                id="usuario"
                                ref="usuario"
                                value={usuario}
                                onChange={this.onInputChange}
                                onBlur={this.buscaEmpresas}
                                validator={text => Boolean(text)} // verifica se o campo está vazio ou válido
                                keyboardType="numeric"
                                required={true}
                                errorMessage="Informe o usuário de acesso."
                                autoCapitalize="none"
                                enabled={this.state.netStatus ? true : false}
                                style={{
                                    width: '90%',
                                    // marginLeft: 10,
                                    // marginRight: 10,
                                }}
                            />
                        </View>

                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <TextInput
                                label="Senha"
                                id="senha"
                                ref="senha"
                                value={senha}
                                onChange={this.onInputChange}
                                secureTextEntry={true}
                                validator={validateSenha}
                                keyboardType="numeric"
                                required={true}
                                errorMessage="Informe a Senha de acesso."
                                style={{
                                    width: '90%',
                                    // marginLeft: 10,
                                    // marginRight: 10,
                                }}
                            />
                        </View>

                        {empresaSelect.length > 0 ? (
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                            </View>
                        ) : null}


                        {(this.state.netStatus) ?
                            (
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
                            ) : null}

                    </View>
                </View>
            </SafeAreaView>
        )
    }
}
