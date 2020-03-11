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
import { maskDate } from '../utils/Maskers';

import VeiculosSelect from '../components/VeiculosSelect';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onRegistroPress }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.pneus_mov_idf)}
                >
                    <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                Pneu{': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                {registro.pneus_mov_pneu}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Posição{': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                {registro.pneus_mov_posicao}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Eixo{': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                {registro.pneus_mov_eixo}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Marca{': '}
                        </Text>
                        <Text>
                            {registro.pneus_mar_descricao}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Modelo{': '}
                        </Text>
                        <Text>
                            {registro.pneus_mod_descricao}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Dimenssão{': '}
                        </Text>
                        <Text>
                            {registro.pneus_dim_descricao}
                        </Text>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                Data{': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                                {moment(registro.pneus_mov_data).format("DD/MM/YYYY")}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Vida{': '}
                            </Text>
                            <Text style={{ fontSize: 12, marginTop: 2 }}>
                                {registro.pneus_vd_vida === "0" ? 'NOVO' : registro.pneus_vd_vida + 'º VIDA'}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Km Vida{': '}
                            </Text>
                            <Text>
                                {registro.pneus_vd_km_vida}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View >
        </Card >
    )
}


export default class PneusVeiculosScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        veiculo_select: null,
        codVeiculo: '',
    };

    componentDidMount() {

    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeVeiculo = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codVeiculo: value.codVeic,
                refreshing: true,
            }, this.getListaRegistros());
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistros: [],
            msgErroVeiculo: msgErro,
        })
    }


    getListaRegistros = () => {
        const { veiculo_select, pagina, listaRegistros } = this.state;

        console.log('veiculo_select: ', veiculo_select);

        axios.get('/pneus/listaVeiculo', {
            params: {
                veiculo: veiculo_select.codVeic,
            }
        }).then(response => {

            this.setState({
                listaRegistros: response.data,
                refreshing: false,
                carregando: false,
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

    onRegistroPress = (pneus_mov_idf) => {
        this.setState({ carregarRegistro: true });

        axios.get('/pneus/showMovPneu/' + pneus_mov_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });

                console.log('registro: ', response.data);

                response.data.registro.tipoTela = 'VEIC';

                this.props.navigation.navigate('PneusTrocaScreen', {
                    registro: {
                        registro: response.data.registro,
                        // qtdeComb: response.data.qtdeComb,
                        // dataComb: response.data.dataComb,
                        // filial: response.data.filial,
                        // descFilial: response.data.descFilial,
                        // listaHistorico: response.data.listaHistorico,
                    },
                    onRefresh: this.onRefresh,
                });
            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
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


    render() {
        const { listaRegistros, refreshing, carregarRegistro,
            veiculo_select, codVeiculo } = this.state;

        // console.log('codVeiculo: ', this.state.codVeiculo);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                <View style={{ margin: 10, marginBottom: 0, padding: 0 }}>
                    <VeiculosSelect
                        label="Veículo"
                        id="veiculo_select"
                        value={veiculo_select}
                        codVeiculo={codVeiculo}
                        onChange={this.onInputChangeVeiculo}
                        onErro={this.onErroChange}
                        tipo=""
                    />
                </View>

                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.pneus_mov_pneu)}
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