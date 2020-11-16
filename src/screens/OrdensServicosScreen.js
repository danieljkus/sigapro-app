import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress, onFinalizarPress, onAbrirPress }) => {
    return (
        <Card containerStyle={{ padding: 0, marginLeft: 5, marginRight: 5, marginBottom: 2, marginTop: 3, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.man_os_situacao === 'A' ? 'red' : '#10734a' }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.man_os_idf)}
                // onLongPress={() => onRegistroLongPress(registro.man_os_idf)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Controle {': '}
                            </Text>
                            <Text>
                                {registro.man_osm_controle}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Filial {': '}
                            </Text>
                            <Text>
                                {registro.man_os_filial}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Emissão {': '}
                            </Text>
                            <Text>
                                {moment(registro.man_os_data_inicial).format('DD/MM/YYYY')}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Situação {': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 15, color: registro.man_os_situacao === 'A' ? 'red' : '#10734a' }} >
                                {registro.man_os_situacao_descr}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Previsão {': '}
                            </Text>
                            <Text>
                                {registro.man_os_data_prevista ? moment(registro.man_os_data_prevista).format('DD/MM/YYYY') : ''}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Veículo {': '}
                            </Text>
                            <Text>
                                {registro.man_osm_veiculo}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Encerr {': '}
                            </Text>
                            <Text>
                                {registro.man_os_data_fim ? moment(registro.man_os_data_fim).format('DD/MM/YYYY') : ''}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Valor {': '}
                            </Text>
                            <Text>
                                {parseFloat(registro.man_os_valor).toFixed(2)}
                            </Text>
                        </View>
                    </View>

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
                        <View style={{ width: 150, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='check'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                            <Text style={{ marginLeft: 5 }}>Finalizar O.S</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onAbrirPress(registro)}
                    >
                        <View style={{ width: 150, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='folder-open'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                            <Text style={{ marginLeft: 5 }}>Abrir O.S</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    )
}

export default class OrdensServicosScreen extends Component {

    termoBusca = '';
    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidMount() {
        this.setState({ refreshing: false });
        this.getListaRegistros();
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    getListaRegistros = () => {
        const { buscaCTE, buscaRomaneio, pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/ordemServicos', {
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

    onRegistroPress = (man_os_idf) => {
        // console.log('onRegistroPress: ', man_os_idf);

        this.setState({ carregarRegistro: true });
        axios.get('/ordemServicos/show/' + man_os_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('onRegistroPress: ', response.data);

                this.props.navigation.navigate('OrdemServicoScreen', {
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

        this.props.navigation.navigate('OrdemServicoScreen', {
            registro: {
                man_os_idf: 0,

                filial_select: [],
                codFilial: '',

                cc_select: [],
                codCC: '',
            },
            onRefresh: this.onRefresh
        });
    }

    onRegistroLongPress = (man_os_idf) => {
        Alert.alert("Excluir registro", `Deseja excluir esta O.S?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(man_os_idf),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (man_os_idf) => {
        this.setState({ refreshing: true });
        axios.delete('/ordemServicos/delete/' + man_os_idf)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.man_os_idf === man_os_idf);
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
        Alert.alert("Finalizar", `Deseja FINALIZAR esta O.S?`, [
            { text: "NÃO" },
            {
                text: "SIM",
                onPress: () => this.onSituacaoChange(registro.man_os_idf, 'F'),
                style: "destructive"
            }
        ])
    }

    onAbrirPress = (registro) => {
        Alert.alert("Finalizar", `Deseja ABRIR esta O.S?`, [
            { text: "NÃO" },
            {
                text: "SIM",
                onPress: () => this.onSituacaoChange(registro.man_os_idf, 'G'),
                style: "destructive"
            }
        ])
    }


    onSituacaoChange = (controle, sit) => {
        this.setState({ refreshing: true });

        axios.put('/ordemServicos/mudaSituacao', {
            controle,
            sit,
        }).then(response => {
            const listaRegistros = [...this.state.listaRegistros];
            const registro = listaRegistros.find(registro => registro.man_os_idf === controle);
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
                onAbrirPress={this.onAbrirPress}
            />
        )
    }

    render() {
        const { listaRegistros, refreshing, carregarRegistro } = this.state;
        return (
            <View style={{ flex: 1, }}>
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
                    keyExtractor={registro => String(registro.man_os_idf)}
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

            </View>
        )
    }
}