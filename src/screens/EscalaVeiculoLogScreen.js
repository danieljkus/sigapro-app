import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView, SafeAreaView
} from 'react-native';
import { Icon, Card, Divider } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { maskDate } from '../utils/Maskers';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onAtivaChange, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                <View style={{ flex: 3, flexDirection: 'row' }}>
                    <Text>
                        {moment(registro.man_evl_data).format("DD/MM/YYYY HH:mm")}
                    </Text>
                </View>
                <View style={{ flex: 3, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Usuário {': '}
                    </Text>
                    <Text>
                        {registro.man_evl_usuario}
                    </Text>
                </View>
            </View>

            <Divider />

            <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                    {registro.man_evl_descricao}
                </Text>
            </View>
        </Card>
    )
}

export default class EscalaVeiculoLogScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listaRegistros: [],
            refreshing: false,
            carregarRegistro: false,
            carregando: false,
            carregarMais: false,
            pagina: 1,

            man_ev_idf: props.navigation.state.params.man_ev_idf,
        };
    }


    componentDidMount() {
        this.setState({ refreshing: true });
        this.getListaRegistros();
    }


    getListaRegistros = () => {
        const { man_ev_idf, pagina, listaRegistros } = this.state;

        // console.log('man_ev_idf: ', man_ev_idf)

        axios.get('/escalaVeiculos/log', {
            params: {
                page: pagina,
                limite: 10,
                controle: man_ev_idf,
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


    render() {
        const { listaRegistros, refreshing, carregarRegistro, } = this.state;

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Log das Alterações'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.man_evl_idf)}
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

            </SafeAreaView >

        )
    }
}
