import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, ActivityIndicator,

} from 'react-native';
import { Icon, Card, Divider, CheckBox } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
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

        tipoListaFiliais: 1,
        checkedFiliais: true,

        tipoListaNotas: 0,
        checkedNotas: false,
    };

    componentDidMount() {

    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeItem = (id, value) => {
        console.log('onInputChangeItem')
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
                listaRegistrosFiliais: [],
                listaRegistrosFornec: [],
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistrosFiliais: [],
            listaRegistrosFornec: [],
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
        if (this.state.checkedFiliais) {
            this.getListaFiliais();
        } else if (this.state.checkedFornec) {
            this.getListaFornecedores();
        } else if (this.state.checkedSaidas) {
            this.getListaFiliais();
        } else if (this.state.checkedCompras) {
            this.getListaFiliais();
        } else if (this.state.checkedCompPend) {
            this.getListaFiliais();
        } else if (this.state.checkedNotas) {
            this.getListaFiliais();
        }
    }

    getListaFiliais = () => {
        const { item_select, pagina, listaRegistrosFiliais } = this.state;

        console.log('getListaFiliais')

        axios.get('/estoque/itensEstoqueFiliais', {
            params: {
                page: pagina,
                limite: 10,
                codItem: item_select.estoq_ie_codigo,
            }
        }).then(response => {
            console.log('getListaFiliais: ', response.data.data)

            const novosRegistros = pagina === 1
                ? response.data.data
                : listaRegistrosFiliais.concat(response.data.data);
            const total = response.data.total;
            this.setState({
                listaRegistrosFiliais: novosRegistros,
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

    getListaFornecedores = () => {
        const { item_select, pagina, listaRegistrosFornec } = this.state;

        console.log('getListaFornecedores')

        axios.get('/estoque/itensEstoqueFornecedores', {
            params: {
                page: pagina,
                limite: 10,
                codItem: item_select.estoq_ie_codigo,
            }
        }).then(response => {
            console.log('getListaFornecedores: ', response.data.data)

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

    onMudaLista = (tipo) => {
        // console.log('onMudaLista: ', tipo);

        if (tipo === 'FIL') {
            this.setState({
                checkedFiliais: true,
                checkedNotas: false,
                checkedCompras: false,
                checkedSaidas: false,
                checkedCompPend: false,
                checkedFornec: false,
            }, this.getListaFiliais());
        } else if (tipo === 'FOR') {
            this.setState({
                checkedFiliais: false,
                checkedNotas: false,
                checkedCompras: false,
                checkedSaidas: false,
                checkedCompPend: false,
                checkedFornec: true,
            }, this.getListaFornecedores());
        } else if (tipo === 'SAI') {
            this.setState({
                checkedFiliais: false,
                checkedNotas: false,
                checkedCompras: false,
                checkedSaidas: true,
                checkedCompPend: false,
                checkedFornec: false,
            }, this.getListaFiliais());
        } else if (tipo === 'COMP') {
            this.setState({
                checkedFiliais: false,
                checkedNotas: false,
                checkedCompras: true,
                checkedSaidas: false,
                checkedCompPend: false,
                checkedFornec: false,
            }, this.getListaFiliais());
        } else if (tipo === 'CPEN') {
            this.setState({
                checkedFiliais: false,
                checkedNotas: false,
                checkedCompras: false,
                checkedSaidas: false,
                checkedCompPend: true,
                checkedFornec: false,
            }, this.getListaFiliais());
        } else if (tipo === 'NF') {
            this.setState({
                checkedFiliais: false,
                checkedNotas: true,
                checkedCompras: false,
                checkedSaidas: false,
                checkedCompPend: false,
                checkedFornec: false,
            }, this.getListaFiliais());
        }
    }

    render() {
        const { listaRegistrosFiliais, listaRegistrosFornec, 
            refreshing, carregarRegistro,
            item_select, codItem, qtdeEstoque, custo,
            checkedFiliais, checkedNotas, checkedCompras, checkedSaidas, checkedCompPend, checkedFornec } = this.state;

        console.log('FichaEstoqueScreen.this.state: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                <View style={{ margin: 10, marginBottom: -10, padding: 0 }}>

                    <ItemEstoqueSelect
                        label="Produto"
                        id="item_select"
                        codItem={codItem}
                        buscaEstoque={0}
                        onChange={this.onInputChangeItem}
                        value={item_select}
                        enabled={true}
                    />

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

                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                    <View style={{ flex: 3, margin: 0, padding: 0 }}>
                        <CheckBox
                            left
                            title='Filiais'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedFiliais}
                            onPress={() => { this.onMudaLista('FIL') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
                    </View>
                    <View style={{ flex: 3, margin: 0, padding: 0 }}>
                        <CheckBox
                            left
                            title='Fornec.'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedFornec}
                            onPress={() => { this.onMudaLista('FOR') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
                    </View>
                    <View style={{ flex: 3, margin: 0, padding: 0 }}>
                        <CheckBox
                            left
                            title='Saídas'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedSaidas}
                            onPress={() => { this.onMudaLista('SAI') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <View style={{ flex: 3, margin: 0, padding: 0 }}>
                        <CheckBox
                            left
                            title='Compras'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedCompras}
                            onPress={() => { this.onMudaLista('COM') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
                    </View>
                    <View style={{ flex: 3, margin: 0, padding: 0 }}>
                        <CheckBox
                            left
                            title='Pendencias'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedCompPend}
                            onPress={() => { this.onMudaLista('CPEN') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
                    </View>
                    <View style={{ flex: 3, margin: 0, padding: 0 }}>
                        <CheckBox
                            left
                            title='Notas'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedNotas}
                            onPress={() => { this.onMudaLista('NF') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
                    </View>
                </View>


                {checkedFiliais ? (
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

                {checkedFornec ? (
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


                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </View >

        )
    }
}