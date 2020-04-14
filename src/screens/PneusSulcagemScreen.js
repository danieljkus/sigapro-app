import React, { Component } from 'react';
import {
    View, ScrollView, RefreshControl, Text,
    FlatList, TouchableOpacity
} from 'react-native';
import { Card, Divider } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import moment from 'moment';

const RegistroItem = ({ registro, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <TouchableOpacity
                    onLongPress={() => onRegistroLongPress(registro.pneus_sul_idf)}
                >
                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Data {': '}
                            </Text>
                            <Text>
                                {moment(registro.pneus_sul_data).format("DD/MM/YYYY HH:mm")}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Vida {': '}
                            </Text>
                            <Text>
                                {registro.pneus_sul_vida === '0' ? 'NOVO' : registro.pneus_sul_vida + 'º VIDA'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Veículo {': '}
                            </Text>
                            <Text>
                                {registro.pneus_sul_veiculo}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Posição {': '}
                            </Text>
                            <Text>
                                {registro.pneus_sul_pos_veic}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Km {': '}
                            </Text>
                            <Text>
                                {registro.pneus_sul_km}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Sulcagem {': '}
                            </Text>
                            <Text>
                                {registro.pneus_sul_sulco1 + '/' + registro.pneus_sul_sulco2 + '/' + registro.pneus_sul_sulco3 + '/' + registro.pneus_sul_sulco4}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Libras Aferida {': '}
                            </Text>
                            <Text>
                                {registro.pneus_sul_libras}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Libras Corrigida {': '}
                            </Text>
                            <Text>
                                {registro.pneus_sul_libras_atual}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </Card >
    )
}

export default class PneusSulcagemScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            salvando: false,
            carregarRegistro: false,

            tipoTela: props.navigation.state.params.tipoTela,
            pneus_sul_pneu: props.navigation.state.params.pneus_sul_pneu,
            pneus_sul_vida: props.navigation.state.params.pneus_sul_vida,
            pneus_sul_pos_veic: props.navigation.state.params.pneus_sul_pos_veic,
            pneus_sul_veiculo: props.navigation.state.params.pneus_sul_veiculo,
            pneus_sul_km: '',
            pneus_sul_libras: '',
            pneus_sul_libras_atual: '',
            pneus_sul_sulco1: '',
            pneus_sul_sulco2: '',
            pneus_sul_sulco3: '',
            pneus_sul_sulco4: '',
            listaHistorico: props.navigation.state.params.listaHistorico,
        }
    }

    componentDidMount() {

    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onSalvarRegistro = () => {
        if (checkFormIsValid(this.refs)) {
            this.setState({ salvando: true });

            axios.put('/pneus/gravarSulcagem', {
                pneus_sul_pneu: this.state.pneus_sul_pneu,
                pneus_sul_vida: this.state.pneus_sul_vida,
                pneus_sul_veiculo: this.state.pneus_sul_veiculo,
                pneus_sul_pos_veic: this.state.pneus_sul_pos_veic,
                pneus_sul_km: this.state.pneus_sul_km,
                pneus_sul_libras: this.state.pneus_sul_libras,
                pneus_sul_libras_atual: this.state.pneus_sul_libras_atual,
                pneus_sul_sulco1: this.state.pneus_sul_sulco1,
                pneus_sul_sulco2: this.state.pneus_sul_sulco2,
                pneus_sul_sulco3: this.state.pneus_sul_sulco3,
                pneus_sul_sulco4: this.state.pneus_sul_sulco4,
                pneus_sul_obs: '',
            })
                .then(response => {
                    this.props.navigation.goBack(null);
                    if (this.props.navigation.state.params.onRefresh) {
                        this.props.navigation.state.params.onRefresh();
                    }
                }).catch(ex => {
                    this.setState({ salvando: false });
                    console.warn(ex);
                    console.warn(ex.response);
                    Alert.showAlert(ex);
                })
        } else {
            Alert.showAlert('Preencha todos os campos');
        }
    }


    onRegistroLongPress = (pneus_sul_idf) => {
        if (!this.state.parSinc) {
            Alert.showConfirm("Deseja excluir este registro?",
                { text: "Cancelar" },
                {
                    text: "Excluir",
                    onPress: () => this.onExcluirRegistro(pneus_sul_idf),
                    style: "destructive"
                }
            )
        }
    }

    onExcluirRegistro = (pneus_sul_idf) => {
        this.setState({ carregarRegistro: true });
        axios.delete('/pneus/deleteSulcagem/' + pneus_sul_idf)
            .then(response => {

                const listaHistorico = [...this.state.listaHistorico];
                const index = listaHistorico.findIndex(registro => registro.pneus_sul_idf === pneus_sul_idf);
                listaHistorico.splice(index, 1);
                this.setState({
                    listaHistorico,
                    carregarRegistro: false
                });

            }).catch(ex => {
                console.warn(ex);
                this.setState({ carregarRegistro: false });
            })
    }



    renderItem = ({ item, index }) => {
        return (
            <RegistroItem
                registro={item}
                onRegistroLongPress={this.onRegistroLongPress}
            />
        )
    }


    render() {
        const { pneus_sul_pneu, pneus_sul_vida, pneus_sul_pos_veic, pneus_sul_veiculo,
            pneus_sul_libras, pneus_sul_libras_atual,
            pneus_sul_sulco1, pneus_sul_sulco2, pneus_sul_sulco3, pneus_sul_sulco4,
            salvando, carregarRegistro } = this.state;

        // console.log('PneusSulcagemScreen.this.state', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16 }}
                    >

                        <View style={{
                            marginBottom: 30,
                            paddingBottom: 15,
                            color: Colors.textSecondaryDark,
                            borderBottomWidth: 2,
                            borderColor: Colors.dividerDark,
                        }}>
                            <Text style={{
                                color: Colors.textSecondaryDark,
                                fontWeight: 'bold',
                                fontSize: 20,
                                marginBottom: 15,
                                marginTop: 20,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Dados do Pneu
                            </Text>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Pneu{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {pneus_sul_pneu}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Vida{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {pneus_sul_vida === '0' ? 'NOVO' : pneus_sul_vida + 'º VIDA'}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Veículo{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {pneus_sul_veiculo}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Posição{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {pneus_sul_pos_veic}
                                    </Text>
                                </View>
                            </View>
                        </View>



                        <View>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: "47%", marginRight: 20 }}>
                                    <TextInput
                                        label="Libras Aferidas"
                                        id="pneus_sul_libras"
                                        ref="pneus_sul_libras"
                                        value={pneus_sul_libras}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                                <View style={{ width: "47%" }}>
                                    <TextInput
                                        label="Libras Corrigidas"
                                        id="pneus_sul_libras_atual"
                                        ref="pneus_sul_libras_atual"
                                        value={pneus_sul_libras_atual}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                            </View>


                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: "23%", marginRight: 10 }}>
                                    <TextInput
                                        label="Sulco 1"
                                        id="pneus_sul_sulco1"
                                        ref="pneus_sul_sulco1"
                                        value={pneus_sul_sulco1}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                                <View style={{ width: "23%", marginRight: 10 }}>
                                    <TextInput
                                        label="Sulco 2"
                                        id="pneus_sul_sulco2"
                                        ref="pneus_sul_sulco2"
                                        value={pneus_sul_sulco2}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                                <View style={{ width: "23%", marginRight: 10 }}>
                                    <TextInput
                                        label="Sulco 3"
                                        id="pneus_sul_sulco3"
                                        ref="pneus_sul_sulco3"
                                        value={pneus_sul_sulco3}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                                <View style={{ width: "22%" }}>
                                    <TextInput
                                        label="Sulco 4"
                                        id="pneus_sul_sulco4"
                                        ref="pneus_sul_sulco4"
                                        value={pneus_sul_sulco4}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                            </View>

                            <Button
                                title="Gravar"
                                loading={salvando}
                                onPress={this.onSalvarRegistro}
                                color={Colors.textOnPrimary}
                                buttonStyle={{ marginBottom: 30, marginTop: 10 }}
                                icon={{
                                    name: 'check',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />
                        </View>





                        {/* {this.state.filial ? (
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
                        ) : null} */}

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
                                    Histórico das Sulcagens
                                </Text>

                                <FlatList
                                    data={this.state.listaHistorico}
                                    renderItem={this.renderItem}
                                    contentContainerStyle={{ paddingBottom: 50 }}
                                    keyExtractor={registro => String(registro.pneus_sul_idf)}
                                    ListFooterComponent={this.renderListFooter}
                                />
                            </View>
                        </View>
                    ) : null}

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