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
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.estoq_mei_seq, registro.estoq_mei_item, registro.estoq_mei_qtde_mov, registro.estoq_mei_valor_unit, registro.estoq_mei_total_mov, registro.tipo_destino, registro.cod_destino, registro.descr_destino, registro.estoq_mei_obs)}
                onLongPress={() => onRegistroLongPress(registro.estoq_mei_seq)}
            >

                <View style={{ flexDirection: 'row', paddingLeft: 10, paddingTop: 8, paddingRight: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Item{': '}
                    </Text>
                    <Text>
                        {registro.estoq_mei_item} - {registro.estoq_ie_descricao}
                    </Text>
                </View>

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Qtde{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {parseFloat(registro.estoq_mei_qtde_mov).toFixed(2)}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Custo{': '}
                        </Text>
                        <Text style={{ fontSize: 12, marginTop: 2 }}>
                            {parseFloat(registro.estoq_mei_valor_unit).toFixed(2)}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Total{': '}
                        </Text>
                        <Text>
                            {parseFloat(registro.estoq_mei_total_mov).toFixed(2)}
                        </Text>
                    </View>
                </View>

            </TouchableOpacity>
        </Card>
    )
}




export default class SaidaEstoqueItensScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            salvado: false,
            refreshing: false,

            item_select: null,
            codItem: '',

            estoq_me_idf: props.navigation.state.params.estoq_me_idf,
            estoq_mei_seq: 0,
            estoq_mei_item: props.navigation.state.params.estoq_mei_item,
            estoq_mei_qtde_mov: '1,00',
            estoq_mei_qtde_atual: maskValorMoeda(props.navigation.state.params.estoq_mei_qtde_atual),
            estoq_mei_valor_unit: maskValorMoeda(props.navigation.state.params.estoq_mei_valor_unit),
            estoq_mei_total_mov: maskValorMoeda(props.navigation.state.params.estoq_mei_total_mov),
            tipo_origem: props.navigation.state.params.tipo_origem,
            cod_origem: props.navigation.state.params.cod_origem,
            tipo_destino: props.navigation.state.params.tipo_destino,
            cod_destino: props.navigation.state.params.cod_destino,
            cod_ccdestino: props.navigation.state.params.cod_ccdestino,
            descr_destino: '',
            estoq_mei_obs: 'BAIXA SIGAPRO',

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
                qtdeEstoque: value.estoq_ef_estoque_atual,
                custo: value.estoq_ef_custo_medio,
                estoq_mei_qtde_atual: maskValorMoeda(parseFloat(value.estoq_ef_estoque_atual)),
                estoq_mei_valor_unit: maskValorMoeda(parseFloat(value.estoq_ef_custo_medio)),
                estoq_mei_total_mov: maskValorMoeda(parseFloat(value.estoq_ef_custo_medio)),
            });
        } else {
            this.setState({
                // codItem: '',
                // estoq_ie_descricao: '',
                qtdeEstoque: 0,
                custo: 0,
                estoq_mei_qtde_atual: maskValorMoeda(0),
                estoq_mei_valor_unit: maskValorMoeda(0),
                estoq_mei_total_mov: maskValorMoeda(0),
            });
        }
    }

    onFormSubmit = (event) => {
        this.onSalvarRegistro();
    }


    onRegistroPress = (estoq_mei_seq, estoq_mei_item, estoq_mei_qtde_mov, estoq_mei_valor_unit, estoq_mei_total_mov, tipo_destino, cod_destino, descr_destino, estoq_mei_obs) => {
        // console.log('-------------onRegistroPress---------------');
        this.setState({
            estoq_mei_seq,
            estoq_mei_qtde_mov: maskValorMoeda(estoq_mei_qtde_mov),
            estoq_mei_total_mov: maskValorMoeda(estoq_mei_total_mov),
            cod_destino,
            descr_destino,
            estoq_mei_obs,
        });

    }


    onRegistroLongPress = (estoq_mei_seq) => {
        // console.log('-------------onRegistroLongPress---------------');
        if (!this.state.vendaEnviada) {
            Alert.showConfirm("Deseja excluir este item?",
                { text: "Cancelar" },
                {
                    text: "Excluir",
                    onPress: () => this.onExcluirRegistro(estoq_mei_seq),
                    style: "destructive"
                }
            )
        }
    }

    onExcluirRegistro = (estoq_mei_seq) => {
        // console.log('-------------onExcluirRegistro---------------');

        const listaItens = [...this.state.listaItens];
        const index = listaItens.findIndex(registro => registro.estoq_mei_seq === estoq_mei_seq);

        listaItens.splice(index, 1);

        this.setState({
            estoq_mei_seq: 0,
            estoq_mei_qtde_mov: '1,00',
            estoq_mei_total_mov: maskValorMoeda(this.state.estoq_mei_valor_unit),
            cod_destino: '',
            descr_destino: '',
            estoq_mei_obs: '',

            listaItens,
        },
            this.calculoTotalPedido()
        );
    }





    onFormIncluirProduto = (event) => {
        // console.log('-------------onFormIncluirProduto---------------');
        if ((!this.state.item_select) || (!this.state.item_select.estoq_ie_codigo)) {
            Alert.showAlert('Informe o Item');
            return;
        }
        if (this.state.stoq_mei_qtde_mov <= 0) {
            Alert.showAlert('Informe a Quantidade');
            return;
        }
        if (this.state.estoq_mei_qtde_atual <= 0) {
            Alert.showAlert('Estoque Insuficiente');
            return;
        }


        // console.log('onFormIncluirProduto: ', this.state);
        // console.log('onFormIncluirProduto: ', vlrStringParaFloat(this.state.estoq_mei_qtde_atual));
        // console.log('onFormIncluirProduto: ', vlrStringParaFloat(this.state.estoq_mei_qtde_mov));
        // console.log('onFormIncluirProduto: ', vlrStringParaFloat(this.state.estoq_me_qtde));
        // console.log('onFormIncluirProduto: ', vlrStringParaFloat(this.state.estoq_mei_qtde_atual) - vlrStringParaFloat(this.state.estoq_mei_qtde_mov) - vlrStringParaFloat(this.state.estoq_me_qtde));

        if ((vlrStringParaFloat(this.state.estoq_mei_qtde_atual) - vlrStringParaFloat(this.state.estoq_mei_qtde_mov) - vlrStringParaFloat(this.state.estoq_me_qtde)) < 0) {
            Alert.showAlert('Estoque Insuficiente');
            return;
        }
        if (vlrStringParaFloat(this.state.estoq_mei_total_mov) <= 0) {
            Alert.showAlert('Informe o Valor do Produto');
            return;
        }

        this.onGravar();
    }

    onGravar = () => {
        // console.log('-----------------onGravar-----------------------');

        const { listaItens } = this.state;

        const iIndItem = listaItens.findIndex(registro => registro.estoq_mei_seq === this.state.estoq_mei_seq);
        if (iIndItem >= 0) {

            listaItens[iIndItem].estoq_mei_qtde_mov = vlrStringParaFloat(this.state.estoq_mei_qtde_mov);
            listaItens[iIndItem].estoq_mei_valor_unit = vlrStringParaFloat(this.state.estoq_mei_valor_unit);
            listaItens[iIndItem].estoq_mei_total_mov = vlrStringParaFloat(this.state.estoq_mei_total_mov);

        } else {

            listaItens.push({
                estoq_mei_seq: listaItens.length + 1,
                estoq_mei_item: this.state.item_select.estoq_ie_codigo,
                estoq_ie_descricao: this.state.item_select.estoq_ie_descricao,
                estoq_mei_qtde_mov: vlrStringParaFloat(this.state.estoq_mei_qtde_mov),
                estoq_mei_valor_unit: vlrStringParaFloat(this.state.estoq_mei_valor_unit),
                estoq_mei_total_mov: vlrStringParaFloat(this.state.estoq_mei_total_mov),
                tipo_origem: this.state.tipo_origem,
                cod_origem: this.state.cod_origem,
                tipo_destino: this.state.tipo_destino,
                cod_destino: this.state.cod_destino,
                cod_ccdestino: this.state.cod_ccdestino,
                descr_destino: this.state.descr_destino,
                estoq_mei_obs: this.state.estoq_mei_obs,
            })

        }

        this.setState({
            listaItens,
            item_select: null,
            codItem: '',
            estoq_mei_seq: 0,
            estoq_mei_qtde_mov: '1,00',
            estoq_mei_total_mov: maskValorMoeda(this.state.estoq_mei_valor_unit),
            cod_destino: '',
            descr_destino: '',
            estoq_mei_obs: '',
        },
            this.calculoTotalPedido()
        );
    }



    calculoTotalPedido = () => {
        // console.log('-------------calculoTotalPedido---------------');
        const { listaItens } = this.state;
        let qtdeItens = 0;
        let vlrTotal = 0;

        for (var x in listaItens) {
            qtdeItens = qtdeItens + (parseFloat(listaItens[x].estoq_mei_qtde_mov));
            vlrTotal = vlrTotal + parseFloat(listaItens[x].estoq_mei_total_mov);
        };

        qtdeItens = parseFloat(qtdeItens.toFixed(2));
        vlrTotal = parseFloat(vlrTotal.toFixed(2));

        this.setState({
            estoq_me_qtde: qtdeItens,
            estoq_me_total: vlrTotal,
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





    onInputChangeQtde = (id, value) => {
        // console.log('-------------onInputChangeQtde---------------');
        const state = {};
        state[id] = value;
        this.setState(state);

        const { estoq_mei_qtde_mov, estoq_mei_valor_unit } = this.state;
        this.calculoItem(value, estoq_mei_valor_unit);
    }


    onSomarQtde = () => {
        // console.log('-------------onSomarQtde---------------');
        let { estoq_mei_qtde_mov, estoq_mei_valor_unit } = this.state;
        estoq_mei_qtde_mov = maskValorMoeda(parseFloat(estoq_mei_qtde_mov) + 1);
        this.setState({ estoq_mei_qtde_mov });
        this.calculoItem(estoq_mei_qtde_mov, estoq_mei_valor_unit);
    }

    onDiminuirQtde = () => {
        // console.log('-------------onDiminuirQtde---------------');
        let { estoq_mei_qtde_mov, estoq_mei_valor_unit } = this.state;
        if (vlrStringParaFloat(estoq_mei_qtde_mov) > 1) {
            estoq_mei_qtde_mov = maskValorMoeda(vlrStringParaFloat(estoq_mei_qtde_mov) - 1);
        }
        this.setState({ estoq_mei_qtde_mov });
        this.calculoItem(estoq_mei_qtde_mov, estoq_mei_valor_unit);
    }


    calculoItem = (estoq_mei_qtde_mov, estoq_mei_valor_unit) => {
        // console.log('----------------calculoItem---------------------');
        const vlrUnit = vlrStringParaFloat(String(estoq_mei_valor_unit).replace('.', ''));
        const qtde = vlrStringParaFloat(String(estoq_mei_qtde_mov).replace('.', ''));
        // console.log('estoq_mei_qtde_mov: ', qtde);
        // console.log('estoq_mei_valor_unit: ', vlrUnit);
        let vlrTotal = parseFloat(parseFloat(vlrUnit) * parseFloat(qtde));
        // console.log('vlrTotal: ', vlrTotal);
        vlrTotal = parseFloat(vlrTotal.toFixed(2));
        // console.log('vlrTotal-: ', vlrTotal);
        this.setState({
            estoq_mei_total_mov: maskValorMoeda(vlrTotal),
        });
    }






    render() {
        const { estoq_mei_qtde_mov, estoq_mei_qtde_atual, estoq_mei_valor_unit, estoq_mei_total_mov,
            listaItens, item_select, codItem, refreshing, loading, salvado } = this.state;

        // console.log('SaidaEstoqueItensScreen STATE: ', this.state);

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

                                <ItemEstoqueSelect
                                    label="Produto"
                                    id="item_select"
                                    codItem={codItem}
                                    buscaEstoque={1}
                                    onChange={this.onInputChangeItem}
                                    value={item_select}
                                    enabled={true}
                                />

                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: "47%", marginRight: 20, flexDirection: 'row' }}>
                                        <View style={{ width: "65%", marginRight: 10 }}>
                                            <TextInput
                                                label="Quantidade"
                                                id="estoq_mei_qtde_mov"
                                                ref="estoq_mei_qtde_mov"
                                                value={String(estoq_mei_qtde_mov)}
                                                masker={maskDigitarVlrMoeda}
                                                onChange={this.onInputChangeQtde}
                                                maxLength={9}
                                                keyboardType="numeric"
                                                required={true}
                                                errorMessage="Informe a Quantidade."
                                            />
                                        </View>

                                        <View style={{ width: "10%", }}>
                                            <Button
                                                title=""
                                                loading={loading}
                                                onPress={() => { this.onSomarQtde() }}
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
                                                onPress={() => { this.onDiminuirQtde() }}
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

                                    <View style={{ width: "47%" }}>
                                        <TextInput
                                            label="Qtde Estoque"
                                            id="estoq_mei_qtde_atual"
                                            ref="estoq_mei_qtde_atual"
                                            value={String(estoq_mei_qtde_atual)}
                                            onChange={this.onInputChange}
                                            enabled={false}
                                        />
                                    </View>
                                </View>



                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: "47%", marginRight: 20 }}>
                                        <TextInput
                                            label="Custo Médio"
                                            id="estoq_mei_valor_unit"
                                            ref="estoq_mei_valor_unit"
                                            value={String(estoq_mei_valor_unit)}
                                            onChange={this.onInputChange}
                                            enabled={false}
                                        />
                                    </View>
                                    <View style={{ width: "47%", padding: 0, margin: 0 }}>
                                        <TextInput
                                            label="Valor Total"
                                            id="estoq_mei_total_mov"
                                            ref="estoq_mei_total_mov"
                                            value={String(estoq_mei_total_mov)}
                                            onChange={this.onInputChange}
                                            enabled={false}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <View style={{ flex: 2, marginRight: 2 }}>
                                        <Button
                                            title="INCLUIR"
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
                                            keyExtractor={listaItens => String(listaItens.estoq_mei_seq)}
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