import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { SearchBar, Icon, Card, Divider, CheckBox } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { maskDate } from '../utils/Maskers';

import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onRegistroPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro)}
            >
                <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            #{registro.rhrest_codigo}
                        </Text>
                    </View>
                    {/* <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text>
                                {registro.rhrest_codigo}
                            </Text>
                        </View> */}
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 13 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Nome{': '}
                    </Text>
                    <Text>
                        {registro.adm_pes_nome}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 13, marginBottom: 7 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Cidade{': '}
                    </Text>
                    <Text>
                        {registro.ceps_loc_descricao} + ' - ' + {registro.ceps_loc_uf}
                    </Text>
                </View>

            </TouchableOpacity>
        </Card >
    )
}



export default class RestaurantesScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        busca_nome: '',
        onClick: false,

    };

    componentDidMount() {
        this.setState({ refreshing: true });
        this.getListaRegistros();
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeData = (id, value) => {
        // console.log('onInputChangeData')
        const state = {};
        state[id] = value;
        this.setState(state);
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }



    getListaRegistros = () => {
        const { buscaNome, pagina, listaRegistros } = this.state;
        this.setState({ refreshing: true, onClick: false });

        // console.log('getListaRegistros')

        axios.get('/listaRestaurantes', {
            params: {
                page: pagina,
                limite: 10,
                nome: buscaNome,
            }
        }).then(response => {
            const novosRegistros = pagina === 1
                ? response.data.data
                : listaRegistros.concat(response.data.data);
            const total = response.data.total;
            // console.log('getListaRegistros: ', novosRegistros)

            this.setState({
                listaRegistros: novosRegistros,
                refreshing: false,
                carregando: false,
                carregarMais: novosRegistros.length < total,
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
        // console.log('onRefresh')
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    carregarMaisRegistros = () => {
        // console.log('carregarMaisRegistros')
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
        // console.log('onRefreshPress')
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }


    onBuscaNomeChange = (text) => {
        clearTimeout(this.buscaTimeout);
        this.setState({
            pagina: 1,
            buscaNome: text,
        })
        this.buscaTimeout = setTimeout(() => {
            this.getListaRegistros();
        }, 800);
    }


    onRegistroPress = async (registro) => {
        if (!this.state.onClick) {
            this.setState({ onClick: true });
            this.props.navigation.goBack(null);
            if (this.props.navigation.state.params.onMostraRestaurante) {
                this.props.navigation.state.params.onMostraRestaurante(
                    registro = {
                        rhrest_codigo: registro.rhrest_codigo,
                        adm_pes_nome: registro.adm_pes_nome,
                        ceps_loc_descricao: registro.ceps_loc_descricao,
                        ceps_loc_uf: registro.ceps_loc_uf,
                        rhrest_hora_ini_cafe: registro.rhrest_hora_ini_cafe,
                        rhrest_hora_fim_cafe: registro.rhrest_hora_fim_cafe,
                        rhrest_hora_ini_almoco: registro.rhrest_hora_ini_almoco,
                        rhrest_hora_fim_almoco: registro.rhrest_hora_fim_almoco,
                        rhrest_hora_ini_janta: registro.rhrest_hora_ini_janta,
                        rhrest_hora_fim_janta: registro.rhrest_hora_fim_janta,
                        rhrest_hora_ini_marmita: registro.rhrest_hora_ini_marmita,
                        rhrest_hora_fim_marmita: registro.rhrest_hora_fim_marmita,
                        rhrest_vlr_cafe: registro.rhrest_vlr_cafe,
                        rhrest_vlr_almoco: registro.rhrest_vlr_almoco,
                        rhrest_vlr_janta: registro.rhrest_vlr_janta,
                        rhrest_vlr_marmita: registro.rhrest_vlr_marmita,
                    }
                );
            }
        }
    }




    render() {
        const { listaRegistros, refreshing, carregarRegistro } = this.state;

        // console.log('rhrest_codigo: ', this.state.rhrest_codigo);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                <SearchBar
                    placeholder="Pesquisar"
                    lightTheme={true}
                    onChangeText={this.onBuscaNomeChange}
                    inputStyle={{ backgroundColor: 'white' }}
                    containerStyle={{ backgroundColor: Colors.primaryLight }}
                    clearIcon={true}
                />

                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.rhrest_codigo)}
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