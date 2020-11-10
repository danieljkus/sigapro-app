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
                        <Text>
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
        console.log('onRegistroPress: ', estoq_sf_controle);

        this.setState({ carregarRegistro: true });
        axios.get('/solicitacoesEstoqueFiliais/show/' + estoq_sf_controle)
            .then(response => {
                this.setState({ carregarRegistro: false });

                console.log('onRegistroPress: ', response.data);

                // let tipo_destino = '';
                // let codVeiculo = '';
                // let codFilial = '';
                // let codCC = '';
                // let controleOS = '';
                // let estoq_mei_ordem_servico = '';
                // let cod_destino = '';
                // let cod_ccdestino = '';

                // if ((response.data.listaItens[0].estoq_mei_ordem_servico !== '') && (response.data.listaItens[0].estoq_mei_ordem_servico !== null)) {
                //     tipo_destino = 'OS';
                //     cod_destino = response.data.listaItens[0].estoq_mei_ordem_servico;
                //     estoq_mei_ordem_servico = response.data.listaItens[0].estoq_mei_ordem_servico;
                //     controleOS = response.data.listaItens[0].man_osm_controle;
                // } else if ((response.data.listaItens[0].estoq_mei_veic_dest !== '') && (response.data.listaItens[0].estoq_mei_veic_dest !== null)) {
                //     tipo_destino = 'VEIC';
                //     codVeiculo = response.data.listaItens[0].estoq_mei_veic_dest;
                //     cod_destino = response.data.listaItens[0].estoq_mei_veic_dest;
                // } else if ((response.data.listaItens[0].estoq_mei_cc_dest !== '') && (response.data.listaItens[0].estoq_mei_cc_dest !== null)) {
                //     tipo_destino = 'CC';
                //     codFilial = response.data.listaItens[0].estoq_mei_fil_dest;
                //     cod_destino = response.data.listaItens[0].estoq_mei_fil_dest;
                //     codCC = response.data.listaItens[0].estoq_mei_cc_dest;
                //     cod_ccdestino = response.data.listaItens[0].estoq_mei_cc_dest;
                // }

                this.props.navigation.navigate('SaidaEstoqueScreen', {
                    registro: {
                        ...response.data,
                        // checkedVeiculo: response.data.listaItens[0].estoq_mei_veic_dest ? true : false,
                        // checkedFilial: response.data.listaItens[0].estoq_mei_cc_dest ? true : false,
                        // checkedOS: response.data.listaItens[0].estoq_mei_ordem_servico ? true : false,

                        // tipo_destino,
                        // codVeiculo,
                        // codFilial,
                        // codCC,
                        // codOS: '',
                        // controleOS,
                        // descricaoOS: '',
                        // estoq_mei_ordem_servico,
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
        console.log('onAddPress');

        this.props.navigation.navigate('SaidaEstoqueScreen', {
            registro: {
                // estoq_me_idf: 0,
                // estoq_me_data: '', //moment(new Date()).format('DD/MM/YYYY'),
                // estoq_me_numero: '0',
                // estoq_me_obs: 'BAIXA SIGAPRO',

                // estoq_mei_seq: 0,
                // estoq_mei_item: 0,
                // estoq_mei_qtde_mov: 0,
                // estoq_mei_valor_unit: 0,
                // estoq_mei_total_mov: 0,
                // estoq_mei_obs: '',

                // checkedVeiculo: true,
                // checkedFilial: false,
                // checkedOS: false,

                // tipo_destino: 'VEIC',
                // descr_destino: '',

                // veiculo_select: [],
                // codVeiculo: '',

                // filial_select: [],
                // codFilial: '',

                // cc_select: [],
                // codCC: '',

                // codOS: '',
                // controleOS: '',
                // descricaoOS: '',
                // estoq_mei_ordem_servico: '',
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

            </View>
        )
    }
}