import React, { Component } from 'react';
import { View, ScrollView, RefreshControl, Text, FlatList } from 'react-native';
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
import { maskValorMoeda } from '../utils/Maskers';
import moment from 'moment';

const RegistroItem = ({ registro }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            {moment(registro.man_ev_data_ini).format("DD/MM/YYYY")}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Horário {': '}
                        </Text>
                        <Text>
                            {registro.pas_serv_sentido === 'I' ? registro.hora1 : registro.hora2}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Serviço {': '}
                        </Text>
                        <Text>
                            {registro.man_ev_servico}
                        </Text>
                    </View>
                </View>

                <Divider />

                <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                        {registro.pas_serv_sentido === 'I' ? (registro.sec1 + ' a ' + registro.sec2) : (registro.sec2 + ' a ' + registro.sec1)}
                    </Text>
                </View>

                <Divider />

                <View style={{ paddingLeft: 15, paddingVertical: 3, paddingBottom: 5 }}>
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 10 }}>
                        Grupo: {registro.man_ev_grupo}   {registro.man_eg_descricao}
                    </Text>
                </View>
            </View>
        </Card>
    )
}

export default class EscalaVeiculoScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvando: false,
            man_ev_veiculo_trocar: '',
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
        if (this.state.registro.man_ev_veiculo_trocar !== '') {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }

    onSalvarRegistro = () => {
        this.setState({ salvando: true });
        axios.put('/escalaVeiculos/trocaCarro/' + this.state.registro.man_ev_idf, {
            man_ev_veiculo: this.state.man_ev_veiculo_trocar
        })
            .then(response => {
                if (response.data === 'OK') {
                    this.props.navigation.goBack(null);
                    if (this.props.navigation.state.params.onRefresh) {
                        this.props.navigation.state.params.onRefresh();
                    }
                } else {
                    this.setState({ salvando: false });
                    Alert.showAlert(response);
                }
            }).catch(ex => {
                this.setState({ salvando: false });
                console.warn(ex);
                console.warn(ex.response);
                Alert.showAlert(ex);
            })
    }



    renderItem = ({ item, index }) => {
        return (
            <RegistroItem
                registro={item}
            />
        )
    }



    render() {
        const { man_ev_veiculo, man_ev_veiculo_trocar, man_ev_grupo, man_ev_seq_grupo, man_eg_descricao,
            pas_serv_linha, man_ev_servico, pas_serv_sentido, sec1, sec2, hora1, hora2,
            loading } = this.state.registro;

        console.log('this.state', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginVertical: 20 }}
                    >
                        {this.temPermissao('ESCALAVEICULOSTROCARVEICSCREEN') ? (
                            <View>
                                <TextInput
                                    label="Trocar Veículo"
                                    id="man_ev_veiculo_trocar"
                                    ref="man_ev_veiculo_trocar"
                                    value={man_ev_veiculo_trocar}
                                    maxLength={4}
                                    onChange={this.onInputChange}
                                    keyboardType="numeric"
                                />

                                <Button
                                    title="TROCAR VEÍCULO"
                                    loading={this.state.salvando}
                                    onPress={this.onFormSubmit}
                                    color={Colors.textOnPrimary}
                                    buttonStyle={{ marginBottom: 30, marginTop: 10 }}
                                    icon={{
                                        name: 'check',
                                        type: 'font-awesome',
                                        color: Colors.textOnPrimary
                                    }}
                                />
                            </View>
                        ) : null}



                        <View style={{ marginBottom: 30 }}>
                            <Text style={{
                                color: Colors.textSecondaryDark,
                                fontWeight: 'bold',
                                fontSize: 20,
                                marginBottom: 15,
                                marginTop: 20,
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

                        <View style={{ marginBottom: 30 }}>
                            <Text style={{
                                color: Colors.textSecondaryDark,
                                fontWeight: 'bold',
                                fontSize: 20,
                                marginBottom: 10,
                                marginRight: 5,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Último Abastecimento
                            </Text>
                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Data {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {this.state.dataComb ? moment(this.state.dataComb).format("DD/MM/YYYY hh:mm") : ''}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Qtde {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {maskValorMoeda(parseFloat(this.state.qtdeComb))} Lt
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5, paddingRight: 5 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Filial {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 18 }}>
                                    {this.state.filial} - { this.state.descFilial }
                                </Text>
                            </View>
                        </View>

                    </View>



                    <View style={{ marginBottom: 30 }}>
                        <Text style={{
                            color: Colors.textSecondaryDark,
                            fontWeight: 'bold',
                            fontSize: 20,
                            marginBottom: 15,
                            paddingLeft: 16,
                            borderBottomWidth: 2,
                            borderColor: Colors.dividerDark,
                        }}>
                            Histórico das Viagens
                        </Text>

                        <FlatList
                            data={this.state.listaHistorico}
                            renderItem={this.renderItem}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            keyExtractor={registro => String(registro.man_ev_idf)}
                            ListFooterComponent={this.renderListFooter}
                        />
                    </View>

                    <ProgressDialog
                        visible={this.state.salvando}
                        title="SIGA PRO"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}