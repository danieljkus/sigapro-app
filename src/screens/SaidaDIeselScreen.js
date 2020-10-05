import React, { Component } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform, Dimensions } from 'react-native';
import { Card, Divider } from 'react-native-elements';
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


export default class SaidaDIeselScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            registro: {
                estoq_tam_idf: '0',
                estoq_tam_qtde_medida: '0,00',
                estoq_tam_qtde_sistema: '0',
                qtde_diferenca: '0',
            },
            loading: true,
            salvado: false,
            calculando: false,
        }
    }

    componentDidMount() {
        getEmpresa().then(empresa => {
            this.setState({ empresa });
        })

        const { estoq_tam_idf } = this.props.navigation.state.params;
        if (estoq_tam_idf) {
            axios.get('/medicaoTanqueArla/show/' + estoq_tam_idf, {
            }).then(response => {
                this.setState({
                    registro: {
                        ...
                        response.data,
                        estoq_tam_qtde_medida: parseFloat(response.data.estoq_tam_qtde_medida),
                        estoq_tam_qtde_sistema: parseFloat(response.data.estoq_tam_qtde_sistema),
                        // qtde_diferenca: response.data.qtde_diferenca,
                        qtde_diferenca: parseFloat(parseFloat(response.data.estoq_tam_qtde_medida) - parseFloat(response.data.estoq_tam_qtde_sistema)),
                    },
                    loading: false,
                })
            }).catch(ex => {
                console.warn('Erro Localizar: ', ex);
                this.setState({
                    loading: false,
                })
            });
        } else {
            this.setState({
                registro: {
                    estoq_tam_idf: '0',
                    estoq_tam_qtde_medida: '0,00',
                    estoq_tam_qtde_sistema: '0',
                    qtde_diferenca: '0',
                },
                loading: false,
            })
        }
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
        if (registro.estoq_tam_qtde_medida === '0') {
            Alert.showAlert("Informe a quantidade para Salvar.")
            return
        }

        if (checkFormIsValid(this.refs)) {
            Alert.showConfirm("Deseja salvar os dados da medição?", {
                text: "Cancelar"
            },
                {
                    text: "OK",
                    onPress: this.onSalvar
                })
        } else {
            Alert.showAlert("Informe a quantidade para Salvar.")
            return
        }
    }

    onSalvar = () => {
        this.setState({ salvado: true });
        const { registro } = this.state;

        registro.estoq_tam_qtde_medida = vlrStringParaFloat(registro.estoq_tam_qtde_medida);

        return axios
            .post('/medicaoTanqueArla/store', registro)
            .then(response => {
                this.props.navigation.goBack(null);
                this.props.navigation.state.params.onRefresh();
            }).catch(ex => {
                const { response } = ex;
                this.setState({ salvado: false });

                if (ex.response) {
                    // erro no servidor
                    Alert.showAlert('Não foi possível concluir a solicitação.');
                } else {
                    // sem internet
                    Alert.showAlert('Verifique sua conexão com a internet.');
                }
            })
    }

    onSubmitCalcular = (event) => {
        // const { registro } = this.state;
        // if (!vlrStringParaFloat(registro.estoq_tam_qtde_medida)) {
        //     Alert.showAlert("Informe a Altura Medida no Tanque.")
        //     return
        // }

        // if (checkFormIsValid(this.refs)) {
        //     this.onCalcularVolume();
        // } else {
        //     Alert.showAlert("Informe a Altura Medida no Tanque.")
        //     return
        // }
    }

    onCalcularVolume = () => {
        // const { registro, empresa } = this.state;
        // this.setState({ calculando: true });

        // axios
        //     .get('/medicaoTanqueArla/calcularVolume', {
        //         params: {
        //             empresa,
        //             estoq_tam_qtde_medida: vlrStringParaFloat(registro.estoq_tam_qtde_medida)
        //         }
        //     })
        //     .then(response => {
        //         const { data } = response;

        //         this.setState({
        //             calculando: false,
        //             registro: {
        //                 ...registro,
        //                 estoq_tam_qtde_medida: data.estoq_tam_qtde_medida,
        //                 estoq_tam_qtde_sistema: data.estoq_tam_qtde_sistema,
        //                 qtde_diferenca: data.qtde_diferenca,
        //                 // qtde_diferenca: parseFloat(parseFloat(data.estoq_tam_qtde_medida) - parseFloat(data.estoq_tam_qtde_sistema)).toFixed(2),
        //             }
        //         })

        //     }).catch(error => {
        //         console.warn(error);
        //         this.setState({
        //             calculando: false,
        //         })
        //     })
    }



    renderQtdeMedida = (estoq_tam_qtde_medida) => {
        return (
            <Text> {maskValorMoeda(estoq_tam_qtde_medida)} </Text>
        );
    };

    renderQtdeSistema = (estoq_tam_qtde_sistema) => {
        return (
            <Text> {maskValorMoeda(estoq_tam_qtde_sistema)} </Text>
        );
    };

    renderQtdeDiferenca = (qtde_diferenca) => {
        return (
            <Text style={{ color: 'red', fontSize: 40 }} > {maskValorMoeda(qtde_diferenca)} </Text>
        );
    };



    render() {
        const { loading, registro, salvado, calculando } = this.state;
        const { estoq_tam_idf, estoq_tam_data, estoq_tam_alt_medida, estoq_tam_qtde_medida,
            estoq_tam_qtde_sistema, qtde_diferenca } = registro;

        return (
            <ScrollView
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="always"
                refreshControl={(
                    <RefreshControl
                        refreshing={loading}
                    />
                )}
            >

                <Card containerStyle={{ padding: 0 }}>
                    {estoq_tam_idf !== '0' ? (
                        <View
                            style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row' }}
                        >
                            <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, marginTop: 5 }} >
                                Emissão: {moment(estoq_tam_data).format('DD/MM/YYYY [às] HH:mm')}
                            </Text>

                        </View>
                    ) : null}

                    <Divider />

                    <View
                        style={{
                            margin: 15,
                        }}
                    >
                        <TextInput
                            label="Quantidade Medida (Lt)"
                            id="estoq_tam_qtde_medida"
                            ref="estoq_tam_qtde_medida"
                            masker={maskDigitarVlrMoeda}
                            value={String(estoq_tam_qtde_medida)}
                            onChange={this.onInputChange}
                            maxLength={9}
                            keyboardType="decimal-pad"
                            errorMessage="A quantidade é obrigatória"
                            required={true}
                        />
                    </View>

                    {estoq_tam_idf === 0 ? (

                        <View
                            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                        >
                            <View
                                style={{ flexDirection: 'row' }}
                            >
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, flex: 1, fontWeight: 'bold' }}>
                                    Quantidade Medida: {' '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, marginTop: 5 }} >
                                    {this.renderQtdeMedida(estoq_tam_qtde_medida)}
                                </Text>
                            </View>

                            <View
                                style={{ flexDirection: 'row' }}
                            >
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, flex: 1, fontWeight: 'bold' }}>
                                    Quantidade Sistema: {' '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, marginTop: 5 }} >
                                    {this.renderQtdeMedida(estoq_tam_qtde_sistema)}
                                </Text>
                            </View>

                            <View
                                style={{ flexDirection: 'row' }}
                            >
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, flex: 1, fontWeight: 'bold' }}>
                                    Diferença do Estoque: {' '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18, marginTop: 5 }} >
                                    {this.renderQtdeMedida(qtde_diferenca)}
                                </Text>
                            </View>

                        </View>
                    ) : null}

                </Card>




                <View
                    style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}
                >

                    {/* {estoq_tam_idf === '0' ?
                        <Button
                            title="Calcular Volume"
                            backgroundColor='#ccc'
                            color={Colors.textOnPrimary}
                            buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 20, marginTop: 15 }}
                            onPress={this.onSubmitCalcular}
                            disabled={loading}
                            icon={{
                                name: 'calculator',
                                type: 'font-awesome',
                                color: Colors.textOnPrimary
                            }}
                        />
                        : null
                    } */}

                    {estoq_tam_idf === '0' ?
                        <Button
                            title="Salvar"
                            backgroundColor='#4682B4'
                            color={Colors.textOnPrimary}
                            buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                            onPress={this.onSubmitForm}
                            disabled={loading}
                            visible={estoq_tam_idf}
                            icon={{
                                name: 'check',
                                type: 'font-awesome',
                                color: Colors.textOnPrimary
                            }}
                        />
                        : null
                    }


                </View>

                <ProgressDialog
                    visible={salvado}
                    title="SIGA PRO"
                    message="Gravando. Aguarde..."
                />

                <ProgressDialog
                    visible={calculando}
                    title="SIGA PRO"
                    message="Calculando Volume. Aguarde..."
                />

            </ScrollView >
        )
    }
}