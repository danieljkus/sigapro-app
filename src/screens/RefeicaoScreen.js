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


export default class RefeicaoScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
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

        return axios
            .post('/refeicoes/store', registro)
            .then(response => {
                this.props.navigation.goBack(null);
                this.props.navigation.state.params.onRefresh();
            }).catch(ex => {
                const { response } = ex;
                this.setState({ salvado: false });

                if (ex.response) {
                    // erro no servidor
                    Alert.showAlert('Não foi possível concluir.');
                } else {
                    // sem internet
                    Alert.showAlert('Verifique sua conexão com a internet.');
                }
            })
    }




    render() {
        const { registro, salvado } = this.state;
        const { rhref_cod_rest } = registro;

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <ScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="always"
                >

                    <View
                        style={{
                            margin: 15,
                        }}
                    >
                        <TextInput
                            label="Restaurante"
                            id="rhref_cod_rest"
                            ref="rhref_cod_rest"
                            value={rhref_cod_rest}
                            maxLength={6}
                            keyboardType="numeric"
                            onChange={this.onInputChange}
                        />
                    </View>

                    <ProgressDialog
                        visible={salvado}
                        title="SIGA PRO"
                        message="Gravando. Aguarde..."
                    />

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

            </View>
        )
    }
}