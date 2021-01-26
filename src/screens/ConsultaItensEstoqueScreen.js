import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { Icon, Card, Divider } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { maskDate, maskValorMoeda } from '../utils/Maskers';
import FloatActionButton from '../components/FloatActionButton';
import Alert from '../components/Alert';
import { getFilial } from '../utils/LoginManager';

import ItemEstoqueSelect from '../components/ItemEstoqueSelect';
import FiliaisSelect from '../components/FiliaisSelect';

import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

export const combolistas = [
    {
        key: 'FIL',
        label: 'Estoque das Filiais'
    },
    {
        key: 'SAI',
        label: 'Saídas do Item'
    },
    {
        key: 'COM',
        label: 'Compras'
    },
    {
        key: 'CPEN',
        label: 'Compras Pendentes'
    },
    {
        key: 'NF',
        label: 'Notas Fiscais'
    },
    {
        key: 'FOR',
        label: 'Fornecedores'
    },
]


const RegistroItemFiliais = ({ registro }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Filial {': '}
                    </Text>
                    <Text>
                        {registro.estoq_ef_filial}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 3, marginBottom: 8, fontSize: 20, marginRight: 50 }}>
                    <Text>
                        {registro.adm_fil_descricao}
                    </Text>
                </View>

                <Divider />

                <View style={{ paddingLeft: 10, marginBottom: 8, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Qtde Est{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {maskValorMoeda(parseFloat(registro.estoq_ef_estoque_atual))}
                        </Text>
                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Custo Médio{': '}
                        </Text>
                        <Text style={{ fontSize: 12, marginTop: 2 }}>
                            {maskValorMoeda(parseFloat(registro.estoq_ef_custo_medio))}
                        </Text>
                    </View>
                </View>

            </View >
        </Card >
    )
}

const RegistroItemSaidas = ({ registro }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
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

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Filial{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {registro.estoq_mei_filial}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Usuário {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_usuario}
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
                </View>

                <Divider />

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 8, fontSize: 13, flexDirection: 'row' }}>
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

                <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 3, marginBottom: 3, fontSize: 20 }}>
                    <Text>
                        {registro.descr_origem_destino}
                    </Text>
                </View>

                {registro.estoq_me_obs ? (
                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                        <Text>
                            {registro.estoq_me_obs}
                        </Text>
                    </View>
                ) : null}
            </View >
        </Card >
    )
}


const RegistroItemCompras = ({ registro }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>

                <View style={{ paddingLeft: 10, marginBottom: 8, marginTop: 10, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Data{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {moment(registro.estoq_nf_data_emissao).format("DD/MM/YYYY")}
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

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Filial{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {registro.estoq_me_filial}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Usuário {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_usuario}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Pedido{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.estoq_meinf_num_pedido}
                        </Text>
                    </View>
                </View>

                <Divider />

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 8, fontSize: 13, flexDirection: 'row' }}>
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

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Fornecedor {': '}
                    </Text>
                    <Text style={{ marginRight: 50 }}>
                        {registro.adm_pes_nome}
                    </Text>
                </View>

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Marca {': '}
                    </Text>
                    <Text>
                        {registro.estoq_mar_descricao}
                    </Text>
                </View>
            </View >
        </Card >
    )
}


const RegistroItemNotas = ({ registro }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>

                <View style={{ paddingLeft: 10, marginBottom: 8, marginTop: 10, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Data{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {moment(registro.estoq_nf_data_emissao).format("DD/MM/YYYY")}
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

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Filial{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {registro.estoq_me_filial}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Usuário {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_usuario}
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
                </View>

                <Divider />

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 8, fontSize: 13, flexDirection: 'row' }}>
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

                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 8, fontSize: 13, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Destinatario {': '}
                    </Text>
                    <Text>
                        {registro.estoq_nf_pfj}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 3, marginBottom: 8, fontSize: 20, marginRight: 50 }}>
                    <Text>
                        {registro.adm_pes_nome}
                    </Text>
                </View>

            </View >
        </Card >
    )
}


const RegistroItemFornecedores = ({ registro }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <View style={{ paddingLeft: 10, marginBottom: 0, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        CNPJ/CPF {': '}
                    </Text>
                    <Text>
                        {registro.estoq_ifor_fornecedor}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 3, marginBottom: 8, fontSize: 20, marginRight: 50 }}>
                    <Text>
                        {registro.adm_pes_nome}
                    </Text>
                </View>
            </View >
        </Card >
    )
}


export default class ConsultaItensEstoqueScreen extends Component {

    state = {
        listaRegistrosFiliais: [],
        listaRegistrosSaidas: [],
        listaRegistrosCompras: [],
        listaRegistrosPendencias: [],
        listaRegistrosNotas: [],
        listaRegistrosFornec: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        item_select: null,
        codItem: '',
        estoq_ie_descricao: '',
        qtdeEstoque: 0,
        custo: 0,

        filialSelect: null,
        temFiltro: false,

        tipoLista: 'FIL',
        modalFiltrosVisible: false,
        dataIni: moment(moment().subtract(15, 'days')).format(DATE_FORMAT),
        dataFim: moment(new Date()).format(DATE_FORMAT),
        estoq_mei_filial: '',
        estoq_me_idf: '',
        estoq_me_numero: '',
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({ estoq_mei_filial: filial });
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
                    });
                });
            }
        })
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
            this.setState({
                qtdeEstoque: 0,
                custo: 0,
                listaRegistrosFiliais: [],
                listaRegistrosSaidas: [],
                listaRegistrosCompras: [],
                listaRegistrosPendencias: [],
                listaRegistrosNotas: [],
                listaRegistrosFornec: [],
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistrosFiliais: [],
            listaRegistrosSaidas: [],
            listaRegistrosCompras: [],
            listaRegistrosPendencias: [],
            listaRegistrosNotas: [],
            listaRegistrosFornec: [],
            msgErroVeiculo: msgErro,
        })
    }

    onInputChangeLista = (id, value) => {
        if (value) {
            const state = {};
            state[id] = value;
            this.setState(state);

            // console.log('onInputChangeLista: ', value);

            if ((this.state.item_select) && (this.state.item_select.estoq_ie_codigo)) {
                this.setState({ refreshing: true });

                if (value === 'FIL') {
                    this.getListaFiliais()
                } else if (value === 'SAI') {
                    this.getListaSaidas()
                } else if (value === 'COM') {
                    this.getListaCompras()
                } else if (value === 'CPEN') {
                    // this.getListaFiliais()
                } else if (value === 'NF') {
                    this.getListaNotas()
                } else if (value === 'FOR') {
                    this.getListaFornecedores()
                }
            }
        }
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
        if ((this.state.item_select) && (this.state.item_select.estoq_ie_codigo)) {
            if (this.state.tipoLista === 'FIL') {
                this.getListaFiliais()
            } else if (this.state.tipoLista === 'SAI') {
                this.getListaSaidas()
            } else if (this.state.tipoLista === 'COM') {
                this.getListaCompras()
            } else if (this.state.tipoLista === 'CPEN') {
                // this.getListaFiliais()
            } else if (this.state.tipoLista === 'NF') {
                this.getListaNotas()
            } else if (this.state.tipoLista === 'FOR') {
                this.getListaFornecedores()
            }
        }
    }

    getListaFiliais = () => {
        const { pagina, listaRegistrosFiliais, item_select } = this.state;

        // console.log('getListaFiliais OK: ', item_select.estoq_ie_codigo)
        if ((item_select) && (item_select.estoq_ie_codigo)) {
            axios.get('/estoque/itensEstoqueFiliais', {
                params: {
                    page: pagina,
                    limite: 10,
                    codItem: item_select.estoq_ie_codigo,
                }
            }).then(response => {
                // console.log('getListaFiliais: ', response.data.data)

                const novosRegistros = pagina === 1
                    ? response.data.data
                    : listaRegistrosFiliais.concat(response.data.data);
                const total = response.data.total;
                this.setState({
                    listaRegistrosFiliais: novosRegistros,
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
    }

    getListaSaidas = () => {
        const { estoq_mei_filial, dataIni, dataFim, estoq_me_idf, estoq_me_numero,
            pagina, listaRegistrosSaidas, item_select } = this.state;

        // console.log('getListaSaidas: ', item_select.estoq_ie_codigo)
        if ((item_select) && (item_select.estoq_ie_codigo)) {
            const temFiltro = estoq_mei_filial !== '' || estoq_me_idf !== '' || estoq_me_numero !== '';

            axios.get('/estoque/itensEstoqueSaidas', {
                params: {
                    page: pagina,
                    limite: 10,
                    codItem: item_select.estoq_ie_codigo,
                    filial: estoq_mei_filial,
                    idf: estoq_me_idf,
                    numero: estoq_me_numero,
                    dtIni: moment(dataIni, DATE_FORMAT).format("YYYY-MM-DD"),
                    dtFim: moment(dataFim, DATE_FORMAT).format("YYYY-MM-DD"),
                }
            }).then(response => {
                // console.log('getListaSaidas: ', response.data.data)

                const novosRegistros = pagina === 1
                    ? response.data.data
                    : listaRegistrosSaidas.concat(response.data.data);
                const total = response.data.total;
                this.setState({
                    listaRegistrosSaidas: novosRegistros,
                    refreshing: false,
                    carregando: false,
                    carregarMais: novosRegistros.length < total,
                    temFiltro,
                })
            }).catch(ex => {
                console.warn(ex);
                console.warn(ex.response);
                this.setState({
                    refreshing: false,
                    carregando: false,
                    temFiltro,
                });
            })
        }
    }

    getListaCompras = () => {
        const { estoq_mei_filial, dataIni, dataFim, estoq_me_idf, estoq_me_numero,
            pagina, listaRegistrosCompras, item_select } = this.state;
        // console.log('getListaCompras: ', item_select.estoq_ie_codigo)
        if ((item_select) && (item_select.estoq_ie_codigo)) {
            const temFiltro = estoq_mei_filial !== '' || estoq_me_idf !== '' || estoq_me_numero !== '';
            axios.get('/estoque/itensEstoqueCompras', {
                params: {
                    page: pagina,
                    limite: 10,
                    codItem: item_select.estoq_ie_codigo,
                    filial: estoq_mei_filial,
                    idf: estoq_me_idf,
                    numero: estoq_me_numero,
                    dtIni: moment(dataIni, DATE_FORMAT).format("YYYY-MM-DD"),
                    dtFim: moment(dataFim, DATE_FORMAT).format("YYYY-MM-DD"),
                }
            }).then(response => {
                // console.log('getListaCompras: ', response.data.data)

                const novosRegistros = pagina === 1
                    ? response.data.data
                    : listaRegistrosCompras.concat(response.data.data);
                const total = response.data.total;
                this.setState({
                    listaRegistrosCompras: novosRegistros,
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
    }

    getListaNotas = () => {
        const { estoq_mei_filial, dataIni, dataFim, estoq_me_idf, estoq_me_numero,
            pagina, listaRegistrosNotas, item_select } = this.state;
        // console.log('getListaNotas: ', item_select.estoq_ie_codigo)
        if ((item_select) && (item_select.estoq_ie_codigo)) {
            const temFiltro = estoq_mei_filial !== '' || estoq_me_idf !== '' || estoq_me_numero !== '';
            axios.get('/estoque/itensEstoqueNotasFiscais', {
                params: {
                    page: pagina,
                    limite: 10,
                    codItem: item_select.estoq_ie_codigo,
                    filial: estoq_mei_filial,
                    idf: estoq_me_idf,
                    numero: estoq_me_numero,
                    dtIni: moment(dataIni, DATE_FORMAT).format("YYYY-MM-DD"),
                    dtFim: moment(dataFim, DATE_FORMAT).format("YYYY-MM-DD"),
                }
            }).then(response => {
                // console.log('getListaNotas: ', response.data.data)

                const novosRegistros = pagina === 1
                    ? response.data.data
                    : listaRegistrosNotas.concat(response.data.data);
                const total = response.data.total;
                this.setState({
                    listaRegistrosNotas: novosRegistros,
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
    }


    getListaFornecedores = () => {
        const { item_select, pagina, listaRegistrosFornec } = this.state;
        // console.log('getListaFornecedores: ', item_select.estoq_ie_codigo)
        if ((item_select) && (item_select.estoq_ie_codigo)) {
            axios.get('/estoque/itensEstoqueFornecedores', {
                params: {
                    page: pagina,
                    limite: 10,
                    codItem: item_select.estoq_ie_codigo,
                }
            }).then(response => {
                // console.log('getListaFornecedores: ', response.data.data)

                const novosRegistros = pagina === 1
                    ? response.data.data
                    : listaRegistrosFornec.concat(response.data.data);
                const total = response.data.total;
                this.setState({
                    listaRegistrosFornec: novosRegistros,
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


    renderItemFiliais = ({ item, index }) => {
        return (
            <RegistroItemFiliais
                registro={item}
            />
        )
    }

    renderItemSaidas = ({ item, index }) => {
        return (
            <RegistroItemSaidas
                registro={item}
            />
        )
    }

    renderItemCompras = ({ item, index }) => {
        return (
            <RegistroItemCompras
                registro={item}
            />
        )
    }

    renderItemNotas = ({ item, index }) => {
        return (
            <RegistroItemNotas
                registro={item}
            />
        )
    }

    renderItemFornec = ({ item, index }) => {
        return (
            <RegistroItemFornecedores
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



    onEscanearPress = () => {
        this.props.navigation.push('BarCodeScreen', {
            onBarCodeRead: this.onBarCodeRead
        })
    }

    onBarCodeRead = event => {
        const { data, rawData, type } = event;
        // console.log('ConsultaItensEstoqueScreen.onBarCodeRead: ', data);

        const codBar = String(data).substr(6, 6);
        // console.log('ConsultaItensEstoqueScreen.onBarCodeRead: ', codBar);

        this.setState({
            codItem: codBar,
        }, this.buscaItem(codBar));
    }

    buscaItem = (value) => {
        this.setState({ carregando: true });
        // console.log('ConsultaItensEstoqueScreen.buscaItem: ', value);
        axios.get('/listaItens', {
            params: {
                codItem: value,
                buscaEstoque: 0,
            }
        }).then(response => {
            const { data } = response;
            // console.log('ConsultaItensEstoqueScreen.buscaItem: ', data);
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
        const { listaRegistrosFiliais, listaRegistrosFornec, listaRegistrosSaidas,
            listaRegistrosCompras, listaRegistrosPendencias, listaRegistrosNotas,
            refreshing, carregarRegistro, tipoLista, temFiltro,
            dataIni, dataFim, estoq_mei_filial, estoq_me_idf, estoq_me_numero,
            filialSelect, item_select, codItem, qtdeEstoque, custo } = this.state;

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

                        <View style={{ flexDirection: 'row', marginTop: -10, marginBottom: 25, marginLeft: 5 }}>
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

                <View style={{ marginHorizontal: 10, marginTop: 5, marginBottom: 0 }}>
                    <TextInput
                        type="select"
                        label=""
                        id="tipoLista"
                        ref="tipoLista"
                        value={tipoLista}
                        selectedValue=""
                        options={combolistas}
                        onChange={this.onInputChangeLista}
                    />
                </View>


                {tipoLista === 'FIL' ? (
                    <FlatList
                        data={listaRegistrosFiliais}
                        renderItem={this.renderItemFiliais}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        keyExtractor={registro => String(registro.estoq_ef_filial)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />
                ) : null}

                {tipoLista === 'SAI' ? (
                    <FlatList
                        data={listaRegistrosSaidas}
                        renderItem={this.renderItemSaidas}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        keyExtractor={registro => String(registro.estoq_me_idf) + '_' + String(registro.estoq_mei_seq)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />
                ) : null}

                {tipoLista === 'COM' ? (
                    <FlatList
                        data={listaRegistrosCompras}
                        renderItem={this.renderItemCompras}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        keyExtractor={registro => String(registro.estoq_me_idf) + '_' + String(registro.estoq_mei_seq)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />
                ) : null}

                {tipoLista === 'NF' ? (
                    <FlatList
                        data={listaRegistrosNotas}
                        renderItem={this.renderItemNotas}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        keyExtractor={registro => String(registro.estoq_me_idf) + '_' + String(registro.estoq_mei_seq)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />
                ) : null}

                {tipoLista === 'FOR' ? (
                    <FlatList
                        data={listaRegistrosFornec}
                        renderItem={this.renderItemFornec}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        keyExtractor={registro => String(registro.estoq_ifor_fornecedor)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />
                ) : null}




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

                {tipoLista === 'FIL' || tipoLista === 'FOR' ? null : (
                    <FloatActionButton
                        iconFamily="MaterialIcons"
                        iconName="search"
                        iconColor={Colors.textOnPrimary}
                        onPress={() => { this.onSearchPress(true) }}
                        backgroundColor={Colors.primary}
                        marginRight={10}
                    />
                )}

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