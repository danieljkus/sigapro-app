import React, { Component } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import { getPermissoes } from '../utils/LoginManager';


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
        getPermissoes().then(permissoes => {
            this.setState({ permissoes });
        })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    temPermissao = (permissao) => {
        if ((this.state.permissoes) && (this.state.permissoes.length > 0)) {
            const iIndItem = this.state.permissoes.findIndex(registro => registro.adm_fsp_nome === permissao);
            return iIndItem >= 0 ? true : false; 
        }
        return false; 
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

        axios.put('/escalaVeiculos/update/' + registro.man_ev_veiculo, registro)
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
        const { man_ev_veiculo, man_ev_grupo, man_ev_seq_grupo, man_eg_descricao,
            pas_serv_linha, man_ev_servico, pas_serv_sentido, sec1, sec2, hora1, hora2,
            loading, salvado } = this.state;

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

                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginVertical: 20 }}
                    >
                        <View style={{ marginBottom: 30 }}>
                            <Text style={{
                                color: Colors.textSecondaryDark,
                                fontWeight: 'bold',
                                fontSize: 20,
                                marginBottom: 15,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Dados da Viagem
                            </Text>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Veículo {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {man_ev_veiculo}
                                </Text>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    {'      '} Horário {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {pas_serv_sentido === 'I' ? hora1 : hora2}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Serviço {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {man_ev_servico}
                                </Text>

                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    {'      '} Linha {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {pas_serv_linha}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Linha {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {pas_serv_sentido === 'I' ? (sec1 + ' a ' + sec2) : (sec2 + ' a ' + sec1)}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Grupo {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {man_eg_descricao}
                                </Text>
                            </View>

                        </View>

                        {this.temPermissao('ESCALAVEICULOSTROCARVEICSCREEN') ? (
                            <View>
                                <TextInput
                                    label="Trocar Veículo"
                                    id="man_ev_veiculo"
                                    ref="man_ev_veiculo"
                                    value={man_ev_veiculo}
                                    maxLength={4}
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
                        ) : null}


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