import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    ActivityIndicator, ScrollView,
    PermissionsAndroid
} from 'react-native';
import { Icon, Card, Divider, CheckBox } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import GetLocation from 'react-native-get-location';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { maskValorMoeda } from '../utils/Maskers';
import Alert from '../components/Alert';

import ItemEstoqueSelect from '../components/ItemEstoqueSelect';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
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

            <View style={{ flexDirection: 'row', paddingLeft: 10, marginTop: 8, fontSize: 20 }}>
                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 16 }} >
                    Movimentação{': '}
                </Text>
                <Text>
                    {registro.estoq_tme_abrev}
                </Text>
            </View>

            <View style={{ paddingLeft: 10, marginBottom: 8, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
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

            <View style={{ flexDirection: 'row', paddingLeft: 10, marginTop: 8 }}>
                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 16 }} >
                    Estoque Atual
                </Text>
            </View>

            <View style={{ paddingLeft: 10, marginBottom: 8, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                <View style={{ flex: 3, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                        Qtde{': '}
                    </Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                        {maskValorMoeda(parseFloat(registro.estoq_mei_qtde_estoque_atual))}
                    </Text>
                </View>
                <View style={{ flex: 3, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        C. Médio{': '}
                    </Text>
                    <Text style={{ fontSize: 12, marginTop: 2 }}>
                        {maskValorMoeda(parseFloat(registro.estoq_mei_custo_medio_estoque))}
                    </Text>
                </View>
                <View style={{ flex: 3, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Total{': '}
                    </Text>
                    <Text>
                        {maskValorMoeda(parseFloat(parseFloat(registro.estoq_mei_qtde_estoque_atual) * parseFloat(registro.estoq_mei_custo_medio_estoque)))}
                    </Text>
                </View>
            </View>
        </Card >
    )
}


export default class FichaEstoqueScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        item_select: null,
        codItem: '',
        estoq_ie_descricao: '',
        qtdeEstoque: 0,
        custo: 0,
    };

    componentDidMount() {

    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeItem = (id, value) => {
        // console.log('onInputChangeItem')
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            // console.log('onInputChangeItem OK ')
            this.setState({
                codItem: value.estoq_ie_codigo,
                estoq_ie_descricao: value.estoq_ie_descricao,
                qtdeEstoque: value.estoq_ef_estoque_atual,
                custo: value.estoq_ef_custo_medio,
                refreshing: true,
            }, () => {
                this.buscaEstoque(value.estoq_ie_codigo)
                this.getListaRegistros()
            });
        } else {
            // console.log('onInputChangeItem NÂO')
            this.setState({
                // codItem: '',
                // estoq_ie_descricao: '',
                qtdeEstoque: 0,
                custo: 0,
                listaRegistros: [],
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistros: [],
            msgErroVeiculo: msgErro,
        })
    }

    buscaEstoque = (codItem) => {
        // console.log('buscaEstoque')

        axios.get('/estoque/buscaEstoque', {
            params: {
                codItem,
            }
        }).then(response => {
            // console.log('buscaEstoque: ', response.data);

            this.setState({
                qtdeEstoque: response.data.qtde,
                custo: response.data.custo,
            });
        }).catch(ex => {
            this.setState({ carregarRegistro: false });
            console.warn(ex);
            console.warn(ex.response);
        });
    }


    getListaRegistros = () => {
        const { item_select, pagina, listaRegistros } = this.state;

        // console.log('getListaRegistros')

        axios.get('/estoque/fichaEstoque', {
            params: {
                page: pagina,
                limite: 10,
                codItem: item_select.estoq_ie_codigo,
            }
        }).then(response => {
            // console.log('getListaRegistros: ', response.data.data)

            const novosRegistros = pagina === 1
                ? response.data.data
                : listaRegistros.concat(response.data.data);
            const total = response.data.total;
            this.setState({
                listaRegistros: novosRegistros,
                refreshing: false,
                carregando: false,
                carregarMais: novosRegistros.length < total
            })
        }).catch(ex => {
            console.warn(ex);
            console.warn(ex.response);
            this.setState({
                refreshing: false,
                carregando: false,
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


    onEscanearPress = () => {
        this.props.navigation.push('BarCodeScreen', {
            onBarCodeRead: this.onBarCodeRead
        })
    }

    onBarCodeRead = event => {
        const { data, rawData, type } = event;
        // console.log('FichaEstoqueScreen.onBarCodeRead: ', data);

        const codBar = String(data).substr(6, 6);
        // console.log('FichaEstoqueScreen.onBarCodeRead: ', codBar);

        this.setState({
            codItem: codBar,
        }, this.buscaItem(codBar));
    }

    buscaItem = (value) => {
        this.setState({ carregando: true });
        // console.log('FichaEstoqueScreen.buscaItem: ', value);
        axios.get('/listaItens', {
            params: {
                codItem: value,
                buscaEstoque: 0,
            }
        }).then(response => {
            const { data } = response;
            // console.log('FichaEstoqueScreen.buscaItem: ', data);
            this.setState({
                carregando: false,
            })
        }).catch(error => {
            console.warn(error);
            console.warn(error.response);
            this.setState({
                carregando: false,
            });
        })
    }


    render() {
        const { listaRegistros, refreshing, carregarRegistro,
            item_select, codItem, qtdeEstoque, custo } = this.state;

        // console.log('FichaEstoqueScreen.this.state: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                <View style={{ margin: 10, marginBottom: -10, padding: 0 }}>

                    <View>
                        <ItemEstoqueSelect
                            label="Item"
                            id="item_select"
                            codItem={codItem}
                            buscaEstoque={0}
                            onChange={this.onInputChangeItem}
                            value={item_select}
                            enabled={true}
                        />
                        <View style={{ float: "right" }}>
                            <Button
                                title=""
                                onPress={this.onEscanearPress}
                                buttonStyle={{ width: 30, height: 30, padding: 0, marginTop: -50, marginLeft: 65 }}
                                backgroundColor={Colors.transparent}
                                icon={{
                                    name: 'barcode',
                                    type: 'font-awesome',
                                    color: Colors.textPrimaryDark
                                }}
                            />
                        </View>
                    </View>

                    {item_select && item_select.estoq_ie_codigo ? (

                        <View style={{ flexDirection: 'row', marginTop: -10, marginBottom: 20, marginLeft: 5 }}>
                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Estoq{': '}
                                </Text>
                                <Text style={{ fontSize: 12, marginTop: 2 }}>
                                    {maskValorMoeda(parseFloat(qtdeEstoque))}
                                </Text>
                            </View>
                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    C Médio{': '}
                                </Text>
                                <Text style={{ fontSize: 12, marginTop: 2 }}>
                                    {maskValorMoeda(parseFloat(custo))}
                                </Text>
                            </View>
                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Total{': '}
                                </Text>
                                <Text>
                                    {maskValorMoeda(parseFloat(qtdeEstoque) * parseFloat(custo))}
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>


                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.estoq_me_idf) + '_' + String(registro.estoq_mei_seq)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />


                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </View >

        )
    }
}