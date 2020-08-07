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


export default class AutorizacaoDespesaScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,
            registro: props.navigation.state.params.registro,
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onFormSubmit = (event) => {
        if (checkFormIsValid(this.refs)) {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }


    onSalvar = () => {
        this.setState({ salvado: true });

        const registro = this.state;

        console.log('onSalvar: ', registro)

        let axiosMethod;
        if (registro.fin_ad_documento) {
            axiosMethod = axios.put('/autorzacaoDespesas/update/' + registro.fin_ad_documento, registro);
        } else {
            axiosMethod = axios.post('/autorzacaoDespesas/store', registro);
        }
        axiosMethod.then(response => {
            this.props.navigation.goBack(null);
            if (this.props.navigation.state.params.onRefresh) {
                this.props.navigation.state.params.onRefresh();
            }
        }).catch(ex => {
            this.setState({ salvado: false });
            console.warn(ex);
        })
    }




    render() {
        const { loading, salvado } = this.state;
        const { fin_ad_documento } = this.state.registro;

        console.log('AutorizacaoDespesaScreen: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                    refreshControl={(
                        <RefreshControl
                            refreshing={loading}
                        />
                    )}
                >
                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                    >

                        <TextInput
                            label="Documento"
                            id="fin_ad_documento"
                            ref="fin_ad_documento"
                            value={fin_ad_documento}
                            maxLength={30}
                            onChange={this.onInputChange}
                        />


                        <Button
                            title="SALVAR"
                            loading={loading}
                            onPress={this.onFormSubmit}
                            color={Colors.textOnPrimary}
                            buttonStyle={{ marginBottom: 20, marginTop: 20 }}
                            icon={{
                                name: 'check',
                                type: 'font-awesome',
                                color: Colors.textOnPrimary
                            }}
                        />

                    </View>

                    <ProgressDialog
                        visible={salvado}
                        title="P7 Força de Vendas"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}