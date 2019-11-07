import React, { Component } from 'react';
import { View, ScrollView, RefreshControl, Card, Text, Divider } from 'react-native';
import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';


export default class EscalaVeiculoScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,
            ...props.navigation.state.params.registro,
        }
    }

    componentDidMount() {

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

    onSalvarRegistro = () => {
        this.setState({ salvado: true });
        const registro = this.state;

        axios.put('/escalaVeiculos/update/' + registro.grupo, registro)
            .then(response => {
                this.props.navigation.goBack(null);
                if (this.props.navigation.state.params.onRefresh) {
                    this.props.navigation.state.params.onRefresh();
                }
            }).catch(ex => {
                this.setState({ salvado: false });
                console.warn(ex);
                console.warn(ex.response);
            })
    }





    render() {
        const { man_ev_veiculo, loading, salvado } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                    refreshControl={(
                        <RefreshControl
                            refreshing={loading}
                        />
                    )}
                >

                    {/* <View containerStyle={{ padding: 0 }}>
                        <View
                            style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row' }}
                        >
                            <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, marginTop: 5 }} >
                                Emissão: {moment(estoq_tcm_data).format('DD/MM/YYYY [às] HH:mm')}
                            </Text>

                        </View>

                        <Divider />
                        
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
                                    {this.renderQtdeMedida(estoq_tcm_qtde_medida)}
                                </Text>
                            </View>

                        </View>

                    </View> */}

                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                    >

                        <TextInput
                            label="Veículo"
                            id="man_ev_veiculo"
                            ref="man_ev_veiculo"
                            value={man_ev_veiculo}
                            maxLength={20}
                            onChange={this.onInputChange}
                            required={true}
                            errorMessage="Informe o Veículo"
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
                        title="SIGA PRO"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}