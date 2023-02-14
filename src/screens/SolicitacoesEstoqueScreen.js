import React, { Component } from 'react';
import {View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView} from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import HeaderComponent from "../components/HeaderComponent";

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress, onFinalizarPress, onPendentePress, onAbrirPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.estoq_sf_situacao_descr === 'GERADA' ? 'red' : registro.estoq_sf_situacao_descr === 'PENDENTE' ? '#fbc02d' : registro.estoq_sf_situacao_descr === 'FECHADA' ? '#10734a' : Colors.accentDark }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.estoq_sf_controle)}
                // onLongPress={() => onRegistroLongPress(registro.estoq_sf_controle)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Controle {': '}
                            </Text>
                            <Text>
                                {registro.estoq_sf_controle}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Data {': '}
                            </Text>
                            <Text>
                                {moment(registro.estoq_sf_data).format('DD/MM/YYYY')}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Filial Solicitada {': '}
                            </Text>
                            <Text>
                                {registro.estoq_sf_filial_solicitada} {registro.estoq_sf_setor_solicitada ? ' / ' + registro.estoq_sf_setor_solicitada : ''}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Situação {': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 15, color: registro.estoq_sf_situacao_descr === 'GERADA' ? 'red' : registro.estoq_sf_situacao_descr === 'PENDENTE' ? '#fbc02d' : registro.estoq_sf_situacao_descr === 'FECHADA' ? '#10734a' : Colors.accentDark }} >
                                {registro.estoq_sf_situacao_descr}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 10, paddingBottom: 5 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Tipo Solicitação {': '}
                        </Text>
                        <Text style={{ marginRight: 50 }}>
                            {registro.compras_sugtip_descricao}
                        </Text>
                    </View>

                    {registro.estoq_sf_obs ? (
                        <View style={{ flexDirection: 'row', paddingLeft: 10, paddingBottom: 5 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                OBS {': '}
                            </Text>
                            <Text style={{ marginRight: 50 }}>
                                {registro.estoq_sf_obs}
                            </Text>
                        </View>
                    ) : null}
                </TouchableOpacity>

                <View
                    style={{
                        flex: 1,
                        margin: 0,
                        marginTop: 5,
                        height: 35,
                        borderTopWidth: 1,
                        borderColor: Colors.dividerDark,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => onFinalizarPress(registro)}
                    >
                        <View style={{ width: 80, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='check'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onPendentePress(registro)}
                    >
                        <View style={{ width: 80, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='hourglass-start'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onAbrirPress(registro)}
                    >
                        <View style={{ width: 80, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='folder-open'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    )
}

export default class SolicitacoesEstoqueScreen extends Component {

    termoBusca = '';
    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidMount() {
        this.setState({ refreshing: true });
        this.getListaRegistros();
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    getListaRegistros = () => {
        const { pagina, listaRegistros } = this.state;
        axios.get('/solicitacoesEstoqueFiliais', {
            params: {
                tipoDig: 2,
                page: pagina,
                limite: 10,
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
                carregarMais: novosRegistros.length < total
            })
        }).catch(ex => {
            console.warn('Erro Busca:', ex);
            this.setState({
                refreshing: false,
                carregando: false,
            });
        })
    }

    onRegistroPress = (estoq_sf_controle) => {
        // console.log('onRegistroPress: ', estoq_sf_controle);

        this.setState({ carregarRegistro: true });
        axios.get('/solicitacoesEstoqueFiliais/show/' + estoq_sf_controle)
            .then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('onRegistroPress: ', response.data);

                this.props.navigation.navigate('SolicitacaoEstoqueScreen', {
                    registro: {
                        ...response.data,
                    },
                    onRefresh: this.onRefresh
                });
            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
    }

    onAddPress = () => {
        // console.log('onAddPress');

        this.props.navigation.navigate('SolicitacaoEstoqueScreen', {
            registro: {
                estoq_sf_controle: 0,

                filial_select: [],
                codFilial: '',

                cc_select: [],
                codCC: '',
            },
            onRefresh: this.onRefresh
        });
    }

    onRegistroLongPress = (estoq_sf_controle) => {
        Alert.alert("Excluir registro", `Deseja excluir este Registro?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(estoq_sf_controle),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (estoq_sf_controle) => {
        this.setState({ refreshing: true });
        axios.delete('/solicitacoesEstoqueFiliais/delete/' + estoq_sf_controle)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.estoq_sf_controle === estoq_sf_controle);
                listaRegistros.splice(index, 1);
                this.setState({
                    listaRegistros,
                    refreshing: false
                });
            }).catch(ex => {
                console.warn(ex);
                console.warn(ex.response);
                this.setState({ refreshing: false });
            })
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

    onFinalizarPress = (registro) => {
        Alert.alert("Finalizar", `Deseja FINALIZAR esta solicitação?`, [
            { text: "NÃO" },
            {
                text: "SIM",
                onPress: () => this.onSituacaoChange(registro.estoq_sf_controle, 'F'),
                style: "destructive"
            }
        ])
    }

    onPendentePress = (registro) => {
        Alert.alert("Finalizar", `Deseja alterar para situação PENDENTE?`, [
            { text: "NÃO" },
            {
                text: "SIM",
                onPress: () => this.onSituacaoChange(registro.estoq_sf_controle, 'P'),
                style: "destructive"
            }
        ])
    }

    onAbrirPress = (registro) => {
        Alert.alert("Finalizar", `Deseja ABRIR esta solicitação?`, [
            { text: "NÃO" },
            {
                text: "SIM",
                onPress: () => this.onSituacaoChange(registro.estoq_sf_controle, 'G'),
                style: "destructive"
            }
        ])
    }


    onSituacaoChange = (controle, sit) => {
        this.setState({ refreshing: true });

        axios.put('/solicitacoesEstoqueFiliais/mudaSituacao', {
            controle,
            sit,
        }).then(response => {
            const listaRegistros = [...this.state.listaRegistros];
            const registro = listaRegistros.find(registro => registro.estoq_sf_controle === controle);
            registro.estoq_sf_situacao_descr = sit === 'G' ? 'GERADA' : sit === 'F' ? 'FECHADA' : sit === 'P' ? 'PENDENTE' : sit === 'F' ? 'FECHADA' : sit === 'C' ? 'CANCELADA' : '';
            this.setState({
                listaRegistros,
                refreshing: false,
            });
        }).catch(ex => {
            console.warn(ex, ex.response);
            this.setState({ refreshing: false });
        })
    }

    renderItem = ({ item }) => {
        return (
            <CardViewItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
                onRegistroLongPress={this.onRegistroLongPress}
                onFinalizarPress={this.onFinalizarPress}
                onPendentePress={this.onPendentePress}
                onAbrirPress={this.onAbrirPress}
            />
        )
    }

    render() {
        const { listaRegistros, refreshing, carregarRegistro } = this.state;
        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Solicitações Filiais'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
                    keyExtractor={registro => String(registro.estoq_sf_controle)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />

                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="add"
                    iconColor={Colors.textOnAccent}
                    onPress={this.onAddPress}
                    backgroundColor={Colors.primary}
                />

                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </SafeAreaView>
        )
    }
}
