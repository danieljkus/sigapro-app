import React, { Component, createRef } from 'react';
import { View, ScrollView, Text, FlatList, TouchableOpacity, Modal, Keyboard } from 'react-native';
import { Card, Divider, CheckBox } from 'react-native-elements';
import StatusBar from '../components/StatusBar';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import { maskDigitarVlrMoeda, maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';
import ItemEstoqueSelect from '../components/ItemEstoqueSelect';
import axios from 'axios';


const RegistroItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 1,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            // opacity: 0.9
        }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.estoq_sfi_situacao === 'S' ? 'red' : registro.estoq_sfi_situacao === 'P' ? '#fbc02d' : registro.estoq_sfi_situacao === 'A' ? '#10734a' : registro.estoq_sfi_situacao === 'C' ? Colors.accentDark : Colors.accentDark }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.estoq_sfi_seq, registro.estoq_sfi_item, registro.estoq_sfi_qtde_solicitada, registro.estoq_sfi_qtde_atendida, registro.estoq_sfi_situacao, registro.estoq_sfi_obs)}
                    onLongPress={() => onRegistroLongPress(registro.estoq_sfi_seq)}
                >

                    <View style={{ flexDirection: 'row', paddingLeft: 10, paddingTop: 8, paddingRight: 10 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Item{': '}
                        </Text>
                        <Text style={{ marginRight: 50 }}>
                            {registro.estoq_sfi_item} - {registro.estoq_ie_descricao}
                        </Text>
                    </View>

                    <View style={{ marginBottom: 5 }}>
                        <View style={{ paddingLeft: 10, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                    Qtde Sol.{': '}
                                </Text>
                                <Text style={{ fontSize: 12, marginTop: 3 }} >
                                    {parseFloat(registro.estoq_sfi_qtde_solicitada).toFixed(2)}
                                </Text>
                            </View>
                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Qtde Aten.{': '}
                                </Text>
                                <Text style={{ fontSize: 12, marginTop: 3 }}>
                                    {parseFloat(registro.estoq_sfi_qtde_atendida).toFixed(2)}
                                </Text>
                            </View>
                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Situação{': '}
                                </Text>
                                <Text>
                                    {registro.estoq_sfi_situacao}
                                </Text>
                            </View>
                        </View>

                        {registro.estoq_sfi_obs ? (
                            <View style={{ flexDirection: 'row', paddingLeft: 10, paddingTop: 8, paddingRight: 10 }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    OBS{': '}
                                </Text>
                                <Text style={{ marginRight: 50 }} >
                                    {registro.estoq_sfi_obs}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                </TouchableOpacity>
            </View>
        </Card>
    )
}




export default class SolicitacaoEstoqueItensScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            salvado: false,
            refreshing: false,

            item_select: null,
            codItem: '',

            estoq_sf_controle: props.navigation.state.params.estoq_sf_controle,
            estoq_sfi_seq: 0,
            estoq_sfi_item: props.navigation.state.params.estoq_sfi_item,
            estoq_sfi_qtde_solicitada: '0,00',
            estoq_sfi_qtde_atendida: '0,00',
            estoq_sfi_obs: '',

            estoq_sfi_situacao: 'S',
            checkedSolicitado: props.navigation.state.params.checkedSolicitado ? props.navigation.state.params.checkedSolicitado : true,
            checkedPendente: props.navigation.state.params.checkedPendente ? props.navigation.state.params.checkedPendente : false,
            checkedAtendido: props.navigation.state.params.checkedAtendido ? props.navigation.state.params.checkedAtendido : false,
            checkedCancelado: props.navigation.state.params.checkedCancelado ? props.navigation.state.params.checkedCancelado : false,

            listaItens: props.navigation.state.params.listaItens ? props.navigation.state.params.listaItens : [],

            ...props.navigation.state.params.registro,
        }
    }

    componentDidMount() {
        this.calculoTotalPedido();
    }

    componentWillUnmount() {
        if (this.props.navigation.state.params.onCarregaProdutos) {
            this.props.navigation.state.params.onCarregaProdutos(this.state.listaItens);
        }
    }

    onFecharTela = () => {
        this.props.navigation.goBack(null);
    }


    onMudaTipoSaida = (tipo) => {
        // console.log('onMudaTipoSaida: ', tipo);

        if (tipo === 'S') {
            this.setState({
                estoq_sfi_situacao: 'S',
                checkedSolicitado: true,
                checkedPendente: false,
                checkedAtendido: false,
                checkedCancelado: false,
            });
        } else if (tipo === 'P') {
            this.setState({
                estoq_sfi_situacao: 'P',
                checkedSolicitado: false,
                checkedPendente: true,
                checkedAtendido: false,
                checkedCancelado: false,
            });
        } else if (tipo === 'A') {
            this.setState({
                estoq_sfi_situacao: 'A',
                checkedSolicitado: false,
                checkedPendente: false,
                checkedAtendido: true,
                checkedCancelado: false,
            });
        } else if (tipo === 'C') {
            this.setState({
                estoq_sfi_situacao: 'C',
                checkedSolicitado: false,
                checkedPendente: false,
                checkedAtendido: false,
                checkedCancelado: true,
            });
        }
    }


    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeItem = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codItem: value.estoq_ie_codigo,
                estoq_ie_descricao: value.estoq_ie_descricao,
            });
        }
    }

    onFormSubmit = (event) => {
        this.onSalvarRegistro();
    }


    onRegistroPress = (estoq_sfi_seq, estoq_sfi_item, estoq_sfi_qtde_solicitada, estoq_sfi_qtde_atendida, estoq_sfi_situacao, estoq_sfi_obs) => {
        // console.log('-------------onRegistroPress---------------');
        this.setState({
            estoq_sfi_seq,
            codItem: String(estoq_sfi_item),
            estoq_sfi_qtde_solicitada: maskValorMoeda(parseFloat(estoq_sfi_qtde_solicitada)),
            estoq_sfi_qtde_atendida: maskValorMoeda(parseFloat(estoq_sfi_qtde_atendida)),
            estoq_sfi_situacao,
            estoq_sfi_obs,
        });

        this.onMudaTipoSaida(estoq_sfi_situacao);
    }


    onRegistroLongPress = (estoq_sfi_seq) => {
        // console.log('-------------onRegistroLongPress---------------');
        if (!this.state.vendaEnviada) {
            Alert.showConfirm("Deseja excluir este item?",
                { text: "Cancelar" },
                {
                    text: "Excluir",
                    onPress: () => this.onExcluirRegistro(estoq_sfi_seq),
                    style: "destructive"
                }
            )
        }
    }

    onExcluirRegistro = (estoq_sfi_seq) => {
        // console.log('-------------onExcluirRegistro---------------');

        const listaItens = [...this.state.listaItens];
        const index = listaItens.findIndex(registro => registro.estoq_sfi_seq === estoq_sfi_seq);

        listaItens.splice(index, 1);

        this.setState({
            estoq_sfi_seq: 0,
            estoq_sfi_item: '',
            estoq_sfi_qtde_solicitada: '0,00',
            estoq_sfi_qtde_atendida: '0,00',
            estoq_sfi_obs: '',

            estoq_sfi_situacao: 'S',
            checkedSolicitado: true,
            checkedPendente: false,
            checkedAtendido: false,
            checkedCancelado: false,

            listaItens,
        },
            this.calculoTotalPedido()
        );
    }





    onFormIncluirProduto = (event) => {
        // console.log('-------------onFormIncluirProduto---------------');
        if ((this.state.estoq_sfi_qtde_solicitada == '') || (vlrStringParaFloat(this.state.estoq_sfi_qtde_solicitada) <= 0)) {
            Alert.showAlert('Informe a Quantidade Solicitada');
            return;
        }
        if ((!this.state.item_select) || (!this.state.item_select.estoq_ie_codigo)) {
            Alert.showAlert('Informe o Item');
            return;
        }
        if (this.state.estoq_sfi_qtde_solicitada <= 0) {
            Alert.showAlert('Informe a Quantidade Solicitada');
            return;
        }

        this.onGravar();
    }

    onGravar = () => {
        // console.log('-----------------onGravar-----------------------');

        const { listaItens } = this.state;

        const iIndItem = listaItens.findIndex(registro => registro.estoq_sfi_seq === this.state.estoq_sfi_seq);
        if (iIndItem >= 0) {

            listaItens[iIndItem].estoq_sfi_qtde_solicitada = vlrStringParaFloat(this.state.estoq_sfi_qtde_solicitada);
            listaItens[iIndItem].estoq_sfi_qtde_atendida = vlrStringParaFloat(this.state.estoq_sfi_qtde_atendida);
            listaItens[iIndItem].estoq_sfi_obs = vlrStringParaFloat(this.state.estoq_sfi_obs);
            listaItens[iIndItem].estoq_sfi_situacao = this.state.estoq_sfi_situacao;

        } else {

            listaItens.push({
                estoq_sfi_seq: listaItens.length + 1,
                estoq_sfi_item: this.state.item_select.estoq_ie_codigo,
                estoq_ie_descricao: this.state.item_select.estoq_ie_descricao,
                estoq_sfi_qtde_solicitada: vlrStringParaFloat(this.state.estoq_sfi_qtde_solicitada),
                estoq_sfi_qtde_atendida: vlrStringParaFloat(this.state.estoq_sfi_qtde_atendida),
                estoq_sfi_situacao: this.state.estoq_sfi_situacao,
                estoq_sfi_obs: this.state.estoq_sfi_obs,
            })

        }

        this.setState({
            listaItens,
            item_select: null,
            codItem: '',
            estoq_sfi_seq: 0,
            estoq_sfi_qtde_solicitada: '0,00',
            estoq_sfi_qtde_atendida: '0,00',
            estoq_sfi_obs: '',

            estoq_sfi_situacao: 'S',
            checkedSolicitado: true,
            checkedPendente: false,
            checkedAtendido: false,
            checkedCancelado: false,
        },
            this.calculoTotalPedido()
        );
    }



    calculoTotalPedido = () => {
        // console.log('-------------calculoTotalPedido---------------');
        const { listaItens } = this.state;
        let qtdeSol = 0;
        let qtdeAten = 0;

        for (var x in listaItens) {
            qtdeSol = qtdeSol + (parseFloat(listaItens[x].estoq_sfi_qtde_solicitada));
            qtdeAten = qtdeAten + parseFloat(listaItens[x].estoq_sfi_qtde_atendida);
        };

        qtdeSol = parseFloat(qtdeSol.toFixed(2));
        qtdeAten = parseFloat(qtdeAten.toFixed(2));

        this.setState({
            estoq_sfi_qtde_solicitada: qtdeSol,
            estoq_sfi_qtde_atendida: qtdeAten,
        });
    }

    renderItem = ({ item, index }) => {
        return (
            <RegistroItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
                onRegistroLongPress={this.onRegistroLongPress}
            />
        )
    }






    onSomarQtdeSol = () => {
        // console.log('-------------onSomarQtde---------------');
        let { estoq_sfi_qtde_solicitada } = this.state;
        estoq_sfi_qtde_solicitada = maskValorMoeda(parseFloat(estoq_sfi_qtde_solicitada) + 1);
        this.setState({ estoq_sfi_qtde_solicitada });
    }

    onDiminuirQtdeSol = () => {
        // console.log('-------------onDiminuirQtde---------------');
        let { estoq_sfi_qtde_solicitada } = this.state;
        if (vlrStringParaFloat(estoq_sfi_qtde_solicitada) > 1) {
            estoq_sfi_qtde_solicitada = maskValorMoeda(vlrStringParaFloat(estoq_sfi_qtde_solicitada) - 1);
        }
        this.setState({ estoq_sfi_qtde_solicitada });
    }


    onSomarQtdeAten = () => {
        // console.log('-------------onSomarQtde---------------');
        let { estoq_sfi_qtde_atendida } = this.state;
        estoq_sfi_qtde_atendida = maskValorMoeda(parseFloat(estoq_sfi_qtde_atendida) + 1);
        this.setState({ estoq_sfi_qtde_atendida });
    }

    onDiminuirQtdeAten = () => {
        // console.log('-------------onDiminuirQtde---------------');
        let { estoq_sfi_qtde_atendida } = this.state;
        if (vlrStringParaFloat(estoq_sfi_qtde_atendida) >= 1) {
            estoq_sfi_qtde_atendida = maskValorMoeda(vlrStringParaFloat(estoq_sfi_qtde_atendida) - 1);
        }
        this.setState({ estoq_sfi_qtde_atendida });
    }




    onEscanearPress = () => {
        this.props.navigation.push('BarCodeScreen', {
            onBarCodeRead: this.onBarCodeRead
        })
    }

    onBarCodeRead = event => {
        const { data, rawData, type } = event;
        // console.log('FichaEstoqueScreen.onBarCodeRead: ', data);

        const codBar = String(data).substr(6, 6);
        // console.log('FichaEstoqueScreen.onBarCodeRead: ', codBar);

        this.setState({
            codItem: codBar,
        }, this.buscaItem(codBar));
    }

    buscaItem = (value) => {
        this.setState({ carregando: true });
        // console.log('FichaEstoqueScreen.buscaItem: ', value);
        axios.get('/listaItens', {
            params: {
                codItem: value,
                buscaEstoque: 0,
            }
        }).then(response => {
            const { data } = response;
            // console.log('FichaEstoqueScreen.buscaItem: ', data);
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
        const { estoq_sfi_seq, estoq_sfi_item, estoq_sfi_qtde_solicitada, estoq_sfi_qtde_atendida, estoq_sfi_situacao, estoq_sfi_obs,
            checkedSolicitado, checkedAtendido, checkedPendente, checkedCancelado,
            listaItens, item_select, codItem, refreshing, loading, salvado } = this.state;

        // console.log('SolicitacaoEstoqueItensScreen STATE: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, paddingBottom: 8, paddingTop: 5 }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >
                    <View style={{ flex: 1, flexDirection: "column", alignItems: 'stretch' }}>

                        <View style={{ flex: 1, backgroundColor: Colors.background }}>

                            <View style={{ paddingHorizontal: 10, marginTop: 20 }}>

                                <View>
                                    <ItemEstoqueSelect
                                        label="Item"
                                        id="item_select"
                                        codItem={codItem}
                                        buscaEstoque={0}
                                        onChange={this.onInputChangeItem}
                                        value={item_select}
                                        enabled={!estoq_sfi_seq}
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

                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: "47%", marginRight: 20, flexDirection: 'row' }}>
                                        <View style={{ width: "65%", marginRight: 10 }}>
                                            <TextInput
                                                label="Qtde Solicitada"
                                                id="estoq_sfi_qtde_solicitada"
                                                ref="estoq_sfi_qtde_solicitada"
                                                value={String(estoq_sfi_qtde_solicitada)}
                                                masker={maskDigitarVlrMoeda}
                                                onChange={this.onInputChange}
                                                maxLength={9}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ width: "10%", }}>
                                            <Button
                                                title=""
                                                loading={loading}
                                                onPress={() => { this.onSomarQtdeSol() }}
                                                buttonStyle={{ width: 40, height: 23, padding: 0, paddingLeft: 10, marginBottom: 3, borderRadius: 15, }}
                                                backgroundColor={Colors.buttonSecondary}
                                                icon={{
                                                    name: 'plus',
                                                    type: 'font-awesome',
                                                    color: Colors.textOnPrimary
                                                }}
                                            />
                                            <Button
                                                title=""
                                                loading={loading}
                                                onPress={() => { this.onDiminuirQtdeSol() }}
                                                buttonStyle={{ width: 40, height: 23, padding: 0, paddingLeft: 10, borderRadius: 15, }}
                                                backgroundColor={Colors.buttonSecondary}
                                                icon={{
                                                    name: 'minus',
                                                    type: 'font-awesome',
                                                    color: Colors.textOnPrimary
                                                }}
                                            />
                                        </View>
                                    </View>

                                    <View style={{ width: "47%", marginRight: 20, flexDirection: 'row' }}>
                                        <View style={{ width: "65%", marginRight: 10 }}>
                                            <TextInput
                                                label="Qtde Atendida"
                                                id="estoq_sfi_qtde_atendida"
                                                ref="estoq_sfi_qtde_atendida"
                                                value={String(estoq_sfi_qtde_atendida)}
                                                masker={maskDigitarVlrMoeda}
                                                onChange={this.onInputChange}
                                                maxLength={9}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ width: "10%", }}>
                                            <Button
                                                title=""
                                                loading={loading}
                                                onPress={() => { this.onSomarQtdeAten() }}
                                                buttonStyle={{ width: 40, height: 23, padding: 0, paddingLeft: 10, marginBottom: 3, borderRadius: 15, }}
                                                backgroundColor={Colors.buttonSecondary}
                                                icon={{
                                                    name: 'plus',
                                                    type: 'font-awesome',
                                                    color: Colors.textOnPrimary
                                                }}
                                            />
                                            <Button
                                                title=""
                                                loading={loading}
                                                onPress={() => { this.onDiminuirQtdeAten() }}
                                                buttonStyle={{ width: 40, height: 23, padding: 0, paddingLeft: 10, borderRadius: 15, }}
                                                backgroundColor={Colors.buttonSecondary}
                                                icon={{
                                                    name: 'minus',
                                                    type: 'font-awesome',
                                                    color: Colors.textOnPrimary
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>


                                <TextInput
                                    label="Observação"
                                    id="estoq_sfi_obs"
                                    ref="estoq_sfi_obs"
                                    value={estoq_sfi_obs}
                                    maxLength={100}
                                    onChange={this.onInputChange}
                                    multiline={true}
                                />

                                <View style={{ flexDirection: 'row' }}>
                                    <CheckBox
                                        center
                                        title='Solicitado'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={checkedSolicitado}
                                        onPress={() => { this.onMudaTipoSaida('S') }}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                    <CheckBox
                                        center
                                        title='Pendente'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={checkedPendente}
                                        onPress={() => { this.onMudaTipoSaida('P') }}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <CheckBox
                                        center
                                        title='Atendido'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={checkedAtendido}
                                        onPress={() => { this.onMudaTipoSaida('A') }}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                    <CheckBox
                                        center
                                        title='Cancelado'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={checkedCancelado}
                                        onPress={() => { this.onMudaTipoSaida('C') }}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View>


                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <View style={{ flex: 2, marginRight: 2 }}>
                                        <Button
                                            title="GRAVAR"
                                            loading={loading}
                                            onPress={this.onFormIncluirProduto}
                                            buttonStyle={{ height: 40, marginTop: 15, marginHorizontal: 10 }}
                                            backgroundColor={Colors.buttonSecondary}
                                            textStyle={{
                                                fontWeight: 'bold',
                                                fontSize: 15
                                            }}
                                            icon={{
                                                name: 'check',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 2, marginLeft: 2 }}>
                                        <Button
                                            title="FECHAR"
                                            onPress={() => { this.onFecharTela() }}
                                            buttonStyle={{ height: 40, marginTop: 15, marginHorizontal: 10 }}
                                            backgroundColor={Colors.buttonPrimary}
                                            icon={{
                                                name: 'sign-out',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                </View>


                            </View>


                            {((!listaItens) || (listaItens.length === 0))
                                ? null : (
                                    <View style={{}}>
                                        <View style={{ backgroundColor: Colors.dividerDark, marginTop: 20, marginBottom: 5 }}>
                                            <Text style={{
                                                color: Colors.primaryLight,
                                                textAlign: 'center',
                                                fontSize: 20,
                                                fontWeight: 'bold',
                                                height: 30,
                                            }}>Lista dos Itens</Text>
                                        </View>

                                        <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row' }} >
                                            <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, flex: 1 }}>
                                                <Text style={{ fontWeight: 'bold' }} >
                                                    Qtde Itens: {' '}
                                                </Text>
                                                <Text>
                                                    {this.state.estoq_me_qtde}
                                                </Text>
                                            </Text>

                                            <Text style={{ color: Colors.textSecondaryDark, fontSize: 17 }} >
                                                <Text style={{ fontWeight: 'bold' }} >
                                                    Valor Total: {' '}
                                                </Text>
                                                <Text>
                                                    {maskValorMoeda(this.state.estoq_me_total)}
                                                </Text>
                                            </Text>
                                        </View>

                                        <FlatList
                                            data={listaItens}
                                            renderItem={this.renderItem}
                                            contentContainerStyle={{ padding: 0, margin: 0, paddingBottom: 10 }}
                                            keyExtractor={listaItens => String(listaItens.estoq_sfi_seq)}
                                        />

                                    </View>
                                )
                            }

                        </View>
                    </View>



                    <ProgressDialog
                        visible={salvado}
                        title="SIGA PRO"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}