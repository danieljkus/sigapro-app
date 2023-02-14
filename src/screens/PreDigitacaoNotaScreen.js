import React, {Component} from 'react';
import {View, Text, ScrollView, RefreshControl, Platform, Dimensions, SafeAreaView} from 'react-native';
import {Card, Divider} from 'react-native-elements';
import {checkFormIsValid} from '../utils/Validator';

import TextInput from '../components/TextInput';
import moment from 'moment';
import Button from '../components/Button';
import Colors from '../values/Colors';
import axios from 'axios';
import Alert from '../components/Alert';
import {ProgressDialog} from 'react-native-simple-dialogs';
import {getEmpresa} from '../utils/LoginManager';
import HeaderComponent from "../components/HeaderComponent";

const {OS} = Platform;


export default class PreDigitacaoNotaScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            estoq_nfpd_chave: '',
            loading: true,
            salvado: false,
        }
    }

    componentDidMount() {
        getEmpresa().then(empresa => {
            this.setState({empresa});
        })

        const {estoq_nfpd_chave} = this.props.navigation.state.params;
        if (estoq_nfpd_chave) {
            axios.get('/preDigitacaoNotas/show/' + estoq_nfpd_chave, {}).then(response => {
                this.setState({
                    estoq_nfpd_chave: response.data.estoq_nfpd_chave,
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
                    estoq_nfpd_chave: '',
                },
                loading: false,
            })
        }
    }

    onInputChange = (id, value) => {
        this.setState({
            [id]: value
        });
    }

    onSubmitForm = (event) => {
        const {estoq_nfpd_chave} = this.state;
        if ((estoq_nfpd_chave === '') && (String(estoq_nfpd_chave).length !== 44)) {
            Alert.showAlert("Informe uma Chave válida com 44 dígitos.")
            return
        }

        if (checkFormIsValid(this.refs)) {
            Alert.showConfirm("Deseja salvar a Cahve da NFe ?", {
                    text: "Cancelar"
                },
                {
                    text: "OK",
                    onPress: this.onSalvar
                })
        }
    }

    onEscanearPress = () => {
        this.props.navigation.push('BarCodeScreen', {
            onBarCodeRead: this.onBarCodeRead
        })
    }

    onBarCodeRead = event => {
        const {data, rawData, type} = event;
        this.setState({
            estoq_nfpd_chave: data
        })
    }

    onSalvar = () => {
        this.setState({salvado: true});
        const {estoq_nfpd_chave} = this.state;

        const registro = {
            estoq_nfpd_chave
        }

        return axios
            .post('/preDigitacaoNotas/store', registro)
            .then(response => {
                this.props.navigation.goBack(null);
                this.props.navigation.state.params.onRefresh();
            }).catch(ex => {
                const {response} = ex;
                this.setState({salvado: false});

                // console.log(ex.response);

                if (ex.response) {
                    // erro no servidor
                    Alert.showAlert('Não foi possível concluir a solicitação. ' + ex.response.data.estoq_nfpd_chave);
                } else {
                    // sem internet
                    Alert.showAlert('Verifique sua conexão com a internet.');
                }
            })
    }

    render() {
        const {estoq_nfpd_chave, loading, salvado} = this.state;

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'NFEs Pré-Digitadas'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <ScrollView
                    style={{flex: 1}}
                    keyboardShouldPersistTaps="always"
                    refreshControl={(
                        <RefreshControl
                            refreshing={loading}
                        />
                    )}
                >

                    <Card containerStyle={{padding: 0}}>
                        <View
                            style={{
                                margin: 15,
                                marginTop: 30,
                            }}
                        >
                            <TextInput
                                label="Chave da NFe"
                                id="estoq_nfpd_chave"
                                ref="estoq_nfpd_chave"
                                value={estoq_nfpd_chave}
                                keyboardType="numeric" // numeric (inteiro) ou decimal-pad (float)
                                onChange={this.onInputChange}
                                required={true}
                                validator={value => !!value}
                                errorMessage="A Chave é Obrigatória."
                                maxLength={44}
                                fontSize={10}
                            />
                        </View>

                    </Card>


                    <View
                        style={{flex: 1, paddingHorizontal: 16, paddingVertical: 8}}
                    >
                        <Button
                            title="Escanear"
                            buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 8}}
                            onPress={this.onEscanearPress}
                            color={Colors.textOnPrimary}
                            icon={{
                                name: 'barcode',
                                type: 'font-awesome',
                                color: Colors.textOnPrimary
                            }}
                        />

                        <Button
                            title="Salvar"
                            backgroundColor='#4682B4'
                            color={Colors.textOnPrimary}
                            buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                            onPress={this.onSubmitForm}
                            disabled={loading}
                            icon={{
                                name: 'check',
                                type: 'font-awesome',
                                color: Colors.textOnPrimary
                            }}
                        />
                    </View>

                    <ProgressDialog
                        visible={salvado}
                        title="App Nordeste"
                        message="Gravando. Aguarde..."
                    />

                </ScrollView>
            </SafeAreaView>
        )
    }
}
