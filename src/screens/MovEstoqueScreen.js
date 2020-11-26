import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Icon, Card, Divider, CheckBox } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { maskDate, maskValorMoeda } from '../utils/Maskers';
import { getFilial } from '../utils/LoginManager';
import FiliaisSelect from '../components/FiliaisSelect';
import ItemEstoqueSelect from '../components/ItemEstoqueSelect';

import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 3, borderRadius: 5, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <View style={{ paddingLeft: 10, marginBottom: 8, marginTop: 10, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Data{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {moment(registro.estoq_me_data).format("DD/MM/YYYY")}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            IDF{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.estoq_me_idf}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Nº{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.estoq_me_numero}
                        </Text>
                    </View>
                </View>

                <Divider />

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 8, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Filial{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {registro.estoq_mei_filial}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Tipo{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.estoq_tme_abrev}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.tipo_mov}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 3, marginBottom: 3, fontSize: 20 }}>
                    <Text>
                        {registro.descr_origem_destino}
                    </Text>
                </View>

                {/* <Divider /> */}

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Item {': '}
                    </Text>
                    <Text>
                        {registro.estoq_mei_item}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 3, marginBottom: 8, fontSize: 20, marginRight: 50 }}>
                    <Text>
                        {registro.estoq_ie_descricao}
                    </Text>
                </View>

                <Divider />

                <View style={{ paddingLeft: 10, marginBottom: 10, marginTop: 8, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Qtde{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {maskValorMoeda(parseFloat(registro.estoq_mei_qtde_mov))}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            C. Médio{': '}
                        </Text>
                        <Text style={{ fontSize: 12, marginTop: 2 }}>
                            {maskValorMoeda(parseFloat(registro.estoq_mei_valor_unit))}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Total{': '}
                        </Text>
                        <Text>
                            {maskValorMoeda(parseFloat(registro.estoq_mei_total_mov))}
                        </Text>
                    </View>
                </View>

                <Divider />

            </View >
        </Card >
    )
}


export default class MovEstoqueScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        empresa: '',
        dataIni: moment(new Date()).format(DATE_FORMAT),
        dataFim: moment(new Date()).format(DATE_FORMAT),
        estoq_mei_filial: '',
        estoq_mei_item: '',
        estoq_me_idf: '',
        estoq_me_numero: '',

        filialSelect: null,

        temFiltro: false,
        modalFiltrosVisible: false,
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({
                refreshing: true,
                estoq_mei_filial: filial
            });

            if (filial) {
                axios.get('/listaFiliais', {
                    params: {
                        codFilial: filial
                    }
                }).then(response => {
                    const { data } = response;
                    // console.log('FiliaisSelect.componentDidMount: ', data);
                    this.setState({
                        filialSelect: {
                            adm_fil_codigo: filial,
                            adm_fil_descricao: data[0].adm_fil_descricao
                        },
                    },
                        this.getListaRegistros()
                    );
                });
            } else {
                this.getListaRegistros();
            }
        })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeFilial = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        // console.log('onInputChangeFilial: ', state);
        if (value) {
            this.setState({
                estoq_mei_filial: value.adm_fil_codigo
            });
        }
    }

    onInputChangeItem = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        // console.log('onInputChangeItem: ', state);
        if (value) {
            this.setState({
                estoq_mei_item: value.estoq_ie_codigo
            });
        }
    }


    getListaRegistros = () => {
        const { estoq_mei_item, estoq_mei_filial, dataIni, dataFim, estoq_me_idf, estoq_me_numero,
            pagina, listaRegistros } = this.state;

        const temFiltro = estoq_mei_item !== '' || estoq_mei_filial !== '' || estoq_me_idf !== '' || estoq_me_numero !== '';

        axios.get('/estoque/movEstoque', {
            params: {
                page: pagina,
                limite: 10,
                filial: estoq_mei_filial,
                codItem: estoq_mei_item,
                idf: estoq_me_idf,
                numero: estoq_me_numero,
                dtIni: moment(dataIni, DATE_FORMAT).format("YYYY-MM-DD"),
                dtFim: moment(dataFim, DATE_FORMAT).format("YYYY-MM-DD"),
            }
        }).then(response => {
            const novosRegistros = pagina === 1
                ? response.data.data
                : listaRegistros.concat(response.data.data);
            const total = response.data.total;
            this.setState({
                listaRegistros: novosRegistros,
                refreshing: false,
                carregando: false,
                carregarMais: novosRegistros.length < total,
                temFiltro
            })
        }).catch(ex => {
            console.warn(ex);
            console.warn(ex.response);
            this.setState({
                refreshing: false,
                carregando: false,
                temFiltro
            });
        })
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    carregarMaisRegistros = () => {
        const { carregarMais, refreshing, carregando, pagina } = this.state;
        if (carregarMais && !refreshing && !carregando) {
            this.setState({
                carregando: true,
                pagina: pagina + 1,
            }, this.getListaRegistros);
        }
    }


    renderListFooter = () => {
        const { carregando } = this.state;
        if (carregando) {
            return (
                <View style={{ marginTop: 8 }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        return null;
    }

    renderItem = ({ item, index }) => {
        return (
            <RegistroItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
            />
        )
    }

    onRefreshPress = (visible) => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onSearchPress = (visible) => {
        this.setState({ modalFiltrosVisible: visible });
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onClosePress = (visible) => {
        this.setState({ modalFiltrosVisible: visible });
    }

    onClearSearchPress = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
            temFiltro: false,
            empresa: '',
            dataIni: moment(new Date()).format(DATE_FORMAT),
            dataFim: moment(new Date()).format(DATE_FORMAT),
            estoq_mei_item: '',
            estoq_me_idf: '',
            estoq_me_numero: '',
        }, this.getListaRegistros);
    }







    render() {
        const { listaRegistros, refreshing, carregarRegistro, temFiltro,
            dataIni, dataFim, estoq_mei_item, estoq_mei_filial, estoq_me_idf, estoq_me_numero,
            filialSelect, item_select } = this.state;

        // console.log('MovEstoqueScreen.this.state: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>


                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.estoq_me_idf) + '_' + String(registro.estoq_mei_seq)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />




                {/* ----------------------------- */}
                {/* MODAL PARA FILTROS            */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalFiltrosVisible}
                    onRequestClose={() => { console.log("Modal FILTROS FECHOU.") }}
                    animationType={"slide"}
                    transparent={true}
                >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                        <View style={{
                            flex: 1,
                            width: "90%",
                            paddingTop: 10,
                        }} >
                            <View style={{
                                paddingVertical: 15,
                                paddingHorizontal: 15,
                                backgroundColor: Colors.background,
                                borderRadius: 5,
                            }}>

                                <View style={{ backgroundColor: Colors.primary, flexDirection: 'row' }}>
                                    <Text style={{
                                        color: Colors.textOnPrimary,
                                        marginTop: 15,
                                        marginBottom: 15,
                                        marginLeft: 16,
                                        textAlign: 'center',
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                    }}>Filtrar</Text>
                                </View>

                                <View style={{ marginTop: 4, paddingVertical: 10 }}>

                                    <ScrollView style={{ height: 50, width: "100%", marginBottom: 10 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ width: "47%", marginRight: 20 }}>
                                                <TextInput
                                                    type="date"
                                                    label="Data Início"
                                                    id="dataIni"
                                                    ref="dataIni"
                                                    value={dataIni}
                                                    masker={maskDate}
                                                    dateFormat={DATE_FORMAT}
                                                    onChange={this.onInputChange}
                                                    validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                                    fontSize={12}
                                                />
                                            </View>
                                            <View style={{ width: "47%" }}>
                                                <TextInput
                                                    type="date"
                                                    label="Data Fim"
                                                    id="dataFim"
                                                    ref="dataFim"
                                                    value={dataFim}
                                                    masker={maskDate}
                                                    dateFormat={DATE_FORMAT}
                                                    onChange={this.onInputChange}
                                                    validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                                    fontSize={12}
                                                />
                                            </View>
                                        </View>
                                    </ScrollView>

                                    <FiliaisSelect
                                        label="Filial"
                                        id="filialSelect"
                                        codFilial={estoq_mei_filial}
                                        onChange={this.onInputChangeFilial}
                                        value={filialSelect}
                                    />

                                    <ItemEstoqueSelect
                                        label="Produto"
                                        id="item_select"
                                        codItem={estoq_mei_item}
                                        buscaEstoque={1}
                                        onChange={this.onInputChangeItem}
                                        value={item_select}
                                        enabled={true}
                                    />

                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: "47%", marginRight: 20 }}>
                                            <TextInput
                                                label="IDF"
                                                id="estoq_me_idf"
                                                ref="estoq_me_idf"
                                                value={estoq_me_idf}
                                                maxLength={10}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ width: "47%" }}>
                                            <TextInput
                                                label="Número"
                                                id="estoq_me_numero"
                                                ref="estoq_me_numero"
                                                value={estoq_me_numero}
                                                maxLength={10}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>



                                    <Button
                                        title="FILTRAR"
                                        onPress={() => { this.onSearchPress(!this.state.modalFiltrosVisible) }}
                                        buttonStyle={{ marginTop: 15, height: 35 }}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'filter',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />
                                    <Button
                                        title="FECHAR"
                                        onPress={() => { this.onClosePress(!this.state.modalFiltrosVisible) }}
                                        buttonStyle={{ marginTop: 10, height: 35 }}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'close',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>


                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="search"
                    iconColor={Colors.textOnPrimary}
                    onPress={() => { this.onSearchPress(true) }}
                    backgroundColor={Colors.primary}
                    marginRight={10}
                />

                {/* {temFiltro ? (
                    <FloatActionButton
                        iconFamily="MaterialIcons"
                        iconName="clear"
                        iconColor={Colors.textOnPrimary}
                        onPress={this.onClearSearchPress}
                        backgroundColor={Colors.primary}
                        marginRight={60}
                    />
                ) : null} */}

                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />


            </View >

        )
    }
}