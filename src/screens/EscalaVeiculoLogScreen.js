import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView
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
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onAtivaChange, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <TouchableOpacity
                    // onPress={() => onRegistroPress(registro.man_ev_idf)}
                    // onLongPress={() => onRegistroLongPress(registro.man_ev_idf)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text>
                                {moment(registro.adm_hist_data).format("DD/MM/YYYY")}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Usuário {': '}
                            </Text>
                            <Text>
                                {registro.adm_hist_usuario}
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                        <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                            {registro.adm_hist_descricao}
                        </Text>
                    </View>

                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class EscalaVeiculoLogScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidMount() {
        this.setState({ refreshing: true });
        this.getListaRegistros();
    }


    getListaRegistros = () => {
        const { adm_hist_controle, pagina, listaRegistros } = this.state;

        // console.log('getListaRegistros: ', man_ev_veiculo);

        axios.get('/escalaVeiculos/log', {
            params: {
                page: pagina,
                limite: 10,
                controle: adm_hist_controle,
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
                // onAtivaChange={this.onAtivaChange}
                // onRegistroPress={this.onRegistroPress}
                // onRegistroLongPress={this.onRegistroLongPress}
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

        // console.log('man_ev_data_ini: ', man_ev_data_ini);
        // console.log('man_ev_data_ini: ', moment(man_ev_data_ini).format("YYYY-MM-DD"));

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.adm_hist_controle)}
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