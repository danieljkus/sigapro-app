import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, marginLeft: 5, marginRight: 5, marginBottom: 2, marginTop: 3, borderRadius: 2, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.estoq_me_idf)}
                onLongPress={() => onRegistroLongPress(registro.estoq_me_idf)}
            >

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Data {': '}
                        </Text>
                        <Text>
                            {moment(registro.estoq_me_data).format('DD/MM/YYYY')}
                        </Text>
                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Usuário {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_usuario}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            IDF {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_idf} / {(registro.estoq_mei_item === '19' || registro.estoq_mei_item === 24) ? 'D' : 'A'}
                        </Text>
                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Número {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_numero}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Qtde {': '}
                        </Text>
                        <Text>
                            {maskValorMoeda(parseFloat(registro.estoq_mei_qtde_mov))}
                        </Text>
                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            OBS {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_obs}
                        </Text>
                    </View>
                </View>

                {/* {registro.estoq_me_obs ? (
                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                        <Text>
                            {registro.estoq_me_obs}
                        </Text>
                    </View>
                ) : null} */}
            </TouchableOpacity>

        </Card>
    )
}

export default class MedicoesTanqueArlaScreen extends Component {

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

        axios.get('/saidasEstoque', {
            params: {
                tipoDig: 2,
                tipoTela: 'COMB',
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

    onRegistroPress = (estoq_me_idf) => {
        // console.log('onRegistroPress: ', estoq_me_idf);

        this.setState({ carregarRegistro: true });
        axios.get('/saidasEstoque/show/' + estoq_me_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('onRegistroPress: ', response.data);

                this.props.navigation.navigate('SaidaDieselScreen', {
                    registro: {
                        ...response.data,
                        checkedDiesel: true,
                        checkedArla: false,
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

        this.props.navigation.navigate('SaidaDieselScreen', {
            registro: {
                estoq_me_idf: 0,
                estoq_me_data: '', //moment(new Date()).format('DD/MM/YYYY'),
                estoq_me_numero: '0',
                estoq_me_obs: 'BAIXA SIGAPRO',

                estoq_mei_seq: 0,
                estoq_mei_item: 0,
                estoq_mei_qtde_mov: 0,
                estoq_mei_valor_unit: 0,
                estoq_mei_total_mov: 0,
                estoq_mei_obs: '',

                estoq_me_tipo_saida: 'D',
                checkedDiesel: true,
                checkedArla: false,

                veiculo_select: null,
                codVeiculo: '',
            },
            onRefresh: this.onRefresh
        });
    }

    onRegistroLongPress = (estoq_me_idf) => {
        Alert.alert("Excluir registro", `Deseja excluir este Registro?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(estoq_me_idf),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (estoq_me_idf) => {
        this.setState({ refreshing: true });
        axios.delete('/saidasEstoque/delete/' + estoq_me_idf)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.estoq_me_idf === estoq_me_idf);
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

    renderItem = ({ item }) => {
        return (
            <CardViewItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
                onRegistroLongPress={this.onRegistroLongPress}
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
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.estoq_me_idf)}
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