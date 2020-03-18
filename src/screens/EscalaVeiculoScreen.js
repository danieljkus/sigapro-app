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
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        {moment(registro.pas_via_data_viagem).format("DD/MM/YYYY")}
                    </Text>
                </View>
                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Horário {': '}
                        </Text>
                        <Text>
                            {registro.hora_fim ? registro.hora_ini : registro.hora_ini + ' / ' + registro.hora_fim}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Serviço {': '}
                        </Text>
                        <Text>
                            {registro.pas_via_servico_extra ? registro.pas_via_servico_extra : registro.pas_via_servico}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Veículo {': '}
                        </Text>
                        <Text>
                            {registro.veic1 ? registro.veic1 : registro.veic2}
                        </Text>
                    </View>
                </View>

                <Divider />

                <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                        {registro.desc_sec_ini + ' a ' + registro.desc_sec_fim}
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
            salvando: false,
            carregarRegistro: false,
            man_ev_veiculo_trocar: '',
            qtdeComb: 0,
            dataComb: '',
            filial: 0,
            descFilial: '',
            listaHistorico: [],
            ...props.navigation.state.params.registro,
        }
    }

    componentDidMount() {
        getPermissoes().then(permissoes => {
            this.setState({ permissoes });
        })

        console.log('componentDidMount', this.state);

        const veiculo = this.state.registro.veic2 ? this.state.registro.veic2 : (this.state.registro.veic1 ? this.state.registro.veic1 : '');

        this.setState({
            man_ev_veiculo_trocar: veiculo,
        });

        if ((veiculo) && (veiculo !== '')) {
            this.setState({ carregarRegistro: true });

            axios.get('/escalaVeiculos/show', {
                params: {
                    veiculo,
                    data: this.state.registro.pas_via_data_viagem,
                }
            }).then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('registro: ', response.data);

                this.setState({
                    carregarRegistro: false,
                    qtdeComb: response.data.qtdeComb,
                    dataComb: response.data.dataComb,
                    filial: response.data.filial,
                    descFilial: response.data.descFilial,
                    listaHistorico: response.data.listaHistorico,
                });

            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
        }
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
        if (this.state.man_ev_veiculo_trocar !== '') {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }

    onSalvarRegistro = () => {
        this.setState({ salvando: true });

        const idf = this.state.registro.idf2 ? this.state.registro.idf2 : (this.state.registro.idf1 ? this.state.registro.idf1 : 0);
       
        axios.put('/escalaVeiculos/trocaCarro', {
            idf,
            man_ev_veiculo: this.state.man_ev_veiculo_trocar,
            man_ev_data_ini: this.state.registro.pas_via_data_viagem,
            man_ev_servico: this.state.registro.pas_via_servico,
            man_ev_servico_estra: this.state.registro.pas_via_servico_extra,
        })
            .then(response => {
                console.log('onSalvarRegistro: ', response.data);
                if (response.data === 'OK') {
                    this.props.navigation.goBack(null);
                    if (this.props.navigation.state.params.onRefresh) {
                        this.props.navigation.state.params.onRefresh();
                    }
                } else {
                    this.setState({ salvando: false });
                    Alert.showAlert(response.data);
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


    onAbrirLog = () => {
        this.props.navigation.navigate('EscalaVeiculoLogScreen', {
            man_ev_idf: this.state.registro.man_ev_idf,
        });
    }

    render() {
        const { pas_via_data_viagem, pas_via_servico, pas_serv_linha, pas_via_servico_extra,
            idf1, idf2, veic1, veic2, desc_sec_ini, desc_sec_fim, hora_ini, hora_fim,
        } = this.state.registro;
        const { man_ev_veiculo_trocar, salvando, carregarRegistro } = this.state;

        // console.log('this.state', this.state);

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
                                    loading={salvando}
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
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Data{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {moment(pas_via_data_viagem).format("DD/MM/YYYY")}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Veículo{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {veic2 ? veic2 : veic1}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Serviço{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {pas_via_servico + (pas_via_servico_extra ? ' / ' + pas_via_servico_extra : '')}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Horário{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {hora_ini + ' / ' + hora_fim}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Linha {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                    {desc_sec_ini + ' a ' + desc_sec_fim}
                                </Text>
                            </View>

                        </View>

                        {this.state.filial ? (
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
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                        Data {': '}
                                    </Text>
                                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                        {this.state.dataComb ? moment(this.state.dataComb).format("DD/MM/YYYY hh:mm") : ''}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                        Qtde {': '}
                                    </Text>
                                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                        {this.state.qtdeComb ? maskValorMoeda(parseFloat(this.state.qtdeComb)) + ' Lt' : ''}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5, paddingRight: 5 }}>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                        Filial {': '}
                                    </Text>
                                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                        {this.state.filial ? this.state.filial + ' - ' + this.state.descFilial : ''}
                                    </Text>
                                </View>
                            </View>
                        ) : null}

                    </View>



                    {this.state.listaHistorico && this.state.listaHistorico.length > 0 ? (
                        <View>
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

                            <View style={{ flexDirection: 'row', justifyContent: "center" }} >
                                <Button
                                    title="Log Histórico"
                                    onPress={this.onAbrirLog}
                                    color={Colors.textOnPrimary}
                                    buttonStyle={{ marginBottom: 20, marginTop: 20, width: 200, height: 30, marginRight: 10 }}
                                    icon={{
                                        name: 'file-text-o',
                                        type: 'font-awesome',
                                        color: Colors.textOnPrimary
                                    }}
                                />
                            </View>
                        </View>
                    ) : null}

                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 8 }}>
                        {idf2 ? idf2 : idf1}
                    </Text>

                    <ProgressDialog
                        visible={carregarRegistro}
                        title="SIGA PRO"
                        message="Carregando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}