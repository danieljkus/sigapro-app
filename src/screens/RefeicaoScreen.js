import React, { Component } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform, Dimensions } from 'react-native';
import { Card, Divider, CheckBox } from 'react-native-elements';
import { checkFormIsValid } from '../utils/Validator';

import TextInput from '../components/TextInput';
import moment from 'moment';
import Button from '../components/Button';
import Colors from '../values/Colors';
import axios from 'axios';
import Alert from '../components/Alert';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { maskValorMoeda, maskDigitarVlrMoeda, vlrStringParaFloat } from "../utils/Maskers";
import { getEmpresa } from '../utils/LoginManager';

const { OS } = Platform;


export default class RefeicaoScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rhref_cod_rest: 0,
            restaurante: [],
            tipoRefeicao: 'CAF',
            checkedCafe: true,
            checkedAlmoço: false,
            checkedJanta: false,
            checkedMarmita: false,

            registro: {
                rhref_idf: 0,
                rhref_cod_rest: 0,
                rhref_localizacao: '',
                rhref_obs: '',
                rhref_tipo_refeicao: 'ALM',
            },
            salvado: false,
        }
    }

    componentDidMount() {
        getEmpresa().then(empresa => {
            this.setState({ empresa });
        })
    }

    onInputChange = (id, value) => {
        const { registro } = this.state;
        this.setState({
            registro: {
                ...registro,
                [id]: value
            }
        });
    }

    onSubmitForm = (event) => {
        const { registro } = this.state;
        if (registro.rhref_cod_rest === '0') {
            Alert.showAlert("Informe o Restaurante")
            return
        }

        Alert.showConfirm("Deseja salvar essa Refeição?", {
            text: "Cancelar"
        },
            {
                text: "OK",
                onPress: this.onSalvar
            })
    }

    onSalvar = () => {
        this.setState({ salvado: true });
        const { registro } = this.state;

        registro.rhref_cod_rest = this.state.rhref_cod_rest;
        registro.rhref_tipo_refeicao = this.state.tipoRefeicao;

        // console.log('RefeicaoScreen.onSalvar: ', registro);

        return axios
            .post('/refeicoes/store', registro)
            .then(response => {
                this.props.navigation.goBack(null);
                this.props.navigation.state.params.onRefresh();
            }).catch(ex => {
                const { response } = ex;
                this.setState({ salvado: false });

                // console.log('RefeicaoScreen.onSalvar.ERROR: ', ex.response);

                if (ex.response) {
                    // erro no servidor
                    Alert.showAlert('Não foi possível gravar. ' + ex.response.data);
                } else {
                    // sem internet
                    Alert.showAlert('Não foi possível gravar. Verifique sua conexão com a internet');
                }
            })
    }


    onEscanearPress = () => {
        this.props.navigation.push('BarCodeScreen', {
            onBarCodeRead: this.onBarCodeRead
        })
    }

    onBarCodeRead = event => {
        const { data, rawData, type } = event;
        // console.log('RefeicaoScreen.onBarCodeRead: ', data);

        this.setState({
            rhref_cod_rest: data,
            restaurante: [],
        },
            this.buscaRestaurante(data)
        );
    }

    buscaRestaurante = (value) => {
        this.setState({ carregando: true });
        // console.log('RefeicaoScreen.buscaRestaurante: ', value);

        axios.get('/buscaRestaurante', {
            params: {
                codRestaurante: value
            }
        }).then(response => {
            const { data } = response;
            // console.log('RefeicaoScreen.buscaRestaurante: ', response.data[0]);

            let checkedCafe = true;
            let checkedAlmoço = false;
            let checkedJanta = false;
            let checkedMarmita = false;

            if (parseFloat(data[0].rhrest_vlr_cafe)) {
                checkedCafe = true;
                checkedAlmoço = false;
                checkedJanta = false;
                checkedMarmita = false;
            } else if (parseFloat(data[0].rhrest_vlr_almoco)) {
                checkedCafe = false;
                checkedAlmoço = true;
                checkedJanta = false;
                checkedMarmita = false;
            } else if (parseFloat(data[0].rhrest_vlr_janta)) {
                checkedCafe = false;
                checkedAlmoço = false;
                checkedJanta = true;
                checkedMarmita = false;
            } else if (parseFloat(data[0].rhrest_vlr_marmita)) {
                checkedCafe = false;
                checkedAlmoço = false;
                checkedJanta = false;
                checkedMarmita = true;
            }

            this.setState({
                checkedCafe,
                checkedAlmoço,
                checkedJanta,
                checkedMarmita,

                restaurante: {
                    rhrest_codigo: data[0].rhrest_codigo,
                    adm_pes_nome: data[0].adm_pes_nome,
                    ceps_loc_descricao: data[0].ceps_loc_descricao,
                    ceps_loc_uf: data[0].ceps_loc_uf,
                    rhrest_hora_ini_cafe: parseInt(data[0].rhrest_hora_ini_cafe),
                    rhrest_hora_fim_cafe: parseInt(data[0].rhrest_hora_fim_cafe),
                    rhrest_hora_ini_almoco: parseInt(data[0].rhrest_hora_ini_almoco),
                    rhrest_hora_fim_almoco: parseInt(data[0].rhrest_hora_fim_almoco),
                    rhrest_hora_ini_janta: parseInt(data[0].rhrest_hora_ini_janta),
                    rhrest_hora_fim_janta: parseInt(data[0].rhrest_hora_fim_janta),
                    rhrest_hora_ini_marmita: parseInt(data[0].rhrest_hora_ini_marmita),
                    rhrest_hora_fim_marmita: parseInt(data[0].rhrest_hora_fim_marmita),
                    rhrest_vlr_cafe: parseFloat(data[0].rhrest_vlr_cafe),
                    rhrest_vlr_almoco: parseFloat(data[0].rhrest_vlr_almoco),
                    rhrest_vlr_janta: parseFloat(data[0].rhrest_vlr_janta),
                    rhrest_vlr_marmita: parseFloat(data[0].rhrest_vlr_marmita),
                },

                carregando: false,
            })
        }).catch(error => {
            console.warn(error);
            console.warn(error.response);
            this.setState({
                carregando: false,
            });
        })
    }


    onAbrirBuscaModal = () => {
        this.props.navigation.navigate('RestaurantesScreen', {
            onMostraRestaurante: this.onMostraRestaurante
        });
    }

    onMostraRestaurante = (registro) => {
        // console.log('onMostraRestaurante: ', registro)

        let checkedCafe = true;
        let checkedAlmoço = false;
        let checkedJanta = false;
        let checkedMarmita = false;

        if (parseFloat(registro.rhrest_vlr_cafe)) {
            checkedCafe = true;
            checkedAlmoço = false;
            checkedJanta = false;
            checkedMarmita = false;
        } else if (parseFloat(registro.rhrest_vlr_almoco)) {
            checkedCafe = false;
            checkedAlmoço = true;
            checkedJanta = false;
            checkedMarmita = false;
        } else if (parseFloat(registro.rhrest_vlr_janta)) {
            checkedCafe = false;
            checkedAlmoço = false;
            checkedJanta = true;
            checkedMarmita = false;
        } else if (parseFloat(registro.rhrest_vlr_marmita)) {
            checkedCafe = false;
            checkedAlmoço = false;
            checkedJanta = false;
            checkedMarmita = true;
        }

        this.setState({

            checkedCafe,
            checkedAlmoço,
            checkedJanta,
            checkedMarmita,

            restaurante: {
                rhrest_codigo: registro.rhrest_codigo,
                adm_pes_nome: registro.adm_pes_nome,
                ceps_loc_descricao: registro.ceps_loc_descricao,
                ceps_loc_uf: registro.ceps_loc_uf,
                rhrest_hora_ini_cafe: parseInt(registro.rhrest_hora_ini_cafe),
                rhrest_hora_fim_cafe: parseInt(registro.rhrest_hora_fim_cafe),
                rhrest_hora_ini_almoco: parseInt(registro.rhrest_hora_ini_almoco),
                rhrest_hora_fim_almoco: parseInt(registro.rhrest_hora_fim_almoco),
                rhrest_hora_ini_janta: parseInt(registro.rhrest_hora_ini_janta),
                rhrest_hora_fim_janta: parseInt(registro.rhrest_hora_fim_janta),
                rhrest_hora_ini_marmita: parseInt(registro.rhrest_hora_ini_marmita),
                rhrest_hora_fim_marmita: parseInt(registro.rhrest_hora_fim_marmita),
                rhrest_vlr_cafe: parseFloat(registro.rhrest_vlr_cafe),
                rhrest_vlr_almoco: parseFloat(registro.rhrest_vlr_almoco),
                rhrest_vlr_janta: parseFloat(registro.rhrest_vlr_janta),
                rhrest_vlr_marmita: parseFloat(registro.rhrest_vlr_marmita),
            }
        });
    }







    render() {
        const { registro, restaurante, checkedCafe, checkedAlmoço, checkedJanta, checkedMarmita, salvado, carregando } = this.state;
        const { rhref_obs } = registro;

        // console.log('STATE: ', this.state)

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <ScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="always"
                >


                    <Card containerStyle={{ padding: 0, paddingVertical: 5, margin: 5, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 25, flex: 1, fontWeight: 'bold', marginLeft: 5, color: Colors.primary }}>
                            Restaurante
                        </Text>

                        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                            <View style={{ flexDirection: 'row', marginVertical: 2 }}>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, fontWeight: 'bold' }}>
                                    Código: {' '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }} >
                                    {restaurante.rhrest_codigo}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginVertical: 2 }}>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, fontWeight: 'bold' }}>
                                    Nome: {' '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }} >
                                    {restaurante.adm_pes_nome}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginVertical: 2 }}>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, fontWeight: 'bold' }}>
                                    Cidade: {' '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }} >
                                    {restaurante.ceps_loc_descricao} - {restaurante.ceps_loc_uf}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: "center", marginHorizontal: 20 }} >
                            <View style={{ flex: 2, marginRight: 2 }}>
                                <Button
                                    title="ESCANEAR"
                                    backgroundColor={Colors.primaryLight}
                                    color={Colors.textOnPrimary}
                                    buttonStyle={{ margin: 5, marginTop: 10 }}
                                    onPress={this.onEscanearPress}
                                    icon={{
                                        name: 'qrcode',
                                        type: 'font-awesome',
                                        color: Colors.textOnPrimary
                                    }}
                                />
                            </View>
                            <View style={{ flex: 2, marginLeft: 2 }}>
                                <Button
                                    title="BUSCAR"
                                    backgroundColor={Colors.primaryLight}
                                    color={Colors.textOnPrimary}
                                    buttonStyle={{ margin: 5, marginTop: 10 }}
                                    onPress={() => { this.onAbrirBuscaModal() }}
                                    icon={{
                                        name: 'search',
                                        type: 'font-awesome',
                                        color: Colors.textOnPrimary
                                    }}
                                />
                            </View>
                        </View>
                    </Card>





                    <Card containerStyle={{ padding: 0, paddingVertical: 5, margin: 5, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 25, flex: 1, fontWeight: 'bold', marginLeft: 5, color: Colors.primary }}>
                            Refeição
                        </Text>

                        <View style={{ paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row' }}>
                            <CheckBox
                                center
                                title='Café'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedCafe}
                                checkedColor={Colors.primaryLight}
                                disabled={restaurante.rhrest_vlr_cafe ? false : true}
                                onPress={() => this.setState({
                                    tipoRefeicao: 'CAF',
                                    checkedCafe: true,
                                    checkedAlmoço: false,
                                    checkedJanta: false,
                                    checkedMarmita: false,
                                })}
                                containerStyle={{ padding: 0, margin: 0, flex: 1, alignItems: 'flex-start', backgroundColor: 'transparent' }}
                            />
                            <CheckBox
                                center
                                title='Almoço'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedAlmoço}
                                checkedColor={Colors.primaryLight}
                                disabled={restaurante.rhrest_vlr_almoco ? false : true}
                                onPress={() => this.setState({
                                    tipoRefeicao: 'ALM',
                                    checkedCafe: false,
                                    checkedAlmoço: true,
                                    checkedJanta: false,
                                    checkedMarmita: false,
                                })}
                                containerStyle={{ padding: 0, margin: 0, flex: 1, alignItems: 'flex-start', backgroundColor: 'transparent' }}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row' }}>
                            <CheckBox
                                center
                                title='Jantar'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedJanta}
                                checkedColor={Colors.primaryLight}
                                disabled={restaurante.rhrest_vlr_janta ? false : true}
                                onPress={() => this.setState({
                                    tipoRefeicao: 'JAN',
                                    checkedCafe: false,
                                    checkedAlmoço: false,
                                    checkedJanta: true,
                                    checkedMarmita: false,
                                })}
                                containerStyle={{ padding: 0, margin: 0, flex: 1, alignItems: 'flex-start', backgroundColor: 'transparent' }}
                            />
                            <CheckBox
                                center
                                title='Marmita'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedMarmita}
                                checkedColor={Colors.primaryLight}
                                disabled={restaurante.rhrest_vlr_marmita ? false : true}
                                onPress={() => this.setState({
                                    tipoRefeicao: 'MAR',
                                    checkedCafe: false,
                                    checkedAlmoço: false,
                                    checkedJanta: false,
                                    checkedMarmita: true,
                                })}
                                containerStyle={{ padding: 0, margin: 0, flex: 1, alignItems: 'flex-start', backgroundColor: 'transparent' }}
                            />
                        </View>

                    </Card>
                    <Card containerStyle={{ padding: 0, paddingVertical: 5, margin: 5, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 25, flex: 1, fontWeight: 'bold', marginLeft: 5, color: Colors.primary }}>
                            Observação
                        </Text>
                        <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                            <TextInput
                                label=""
                                id="rhref_obs"
                                ref="rhref_obs"
                                value={rhref_obs}
                                onChange={this.onInputChange}
                                multiline={true}
                                style={{ height: 70, }}
                            />
                        </View>
                    </Card>




                </ScrollView >

                <Button
                    title="Salvar"
                    backgroundColor='#4682B4'
                    color={Colors.textOnPrimary}
                    buttonStyle={{ margin: 5, marginTop: 10 }}
                    onPress={this.onSubmitForm}
                    icon={{
                        name: 'check',
                        type: 'font-awesome',
                        color: Colors.textOnPrimary
                    }}
                />

                <ProgressDialog
                    visible={salvado}
                    title="SIGA PRO"
                    message="Gravando. Aguarde..."
                />

                <ProgressDialog
                    visible={carregando}
                    title="SIGA PRO"
                    message="Carregando..."
                />

            </View>
        )
    }
}