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
import { getUsuario } from '../utils/LoginManager';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-community/async-storage';
import VeiculosSelect from '../components/VeiculosSelect';


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
                onPress={() => onRegistroPress(estoq_mei_seq, estoq_mei_item, estoq_mei_qtde_mov, estoq_mei_vlr_unit, estoq_mei_total_mov, tipo_destino, cod_destino, estoq_mei_obs)}
                onLongPress={() => onRegistroLongPress(registro.estoq_mei_seq)}
            >

                <View style={{ paddingLeft: 20, paddingRight: 5, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 17 }}>
                        {registro.cod_destino}
                    </Text>
                </View>

                <Divider />

                {/* <View style={{ paddingLeft: 16, paddingVertical: 0, flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontWeight: 'bold', fontSize: 15, marginTop: 5, }}>
                            Qtde:
                    </Text>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, marginTop: 5, marginLeft: 5 }}>
                            {registro.vi_qtde}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingLeft: 16, paddingVertical: 0, flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontWeight: 'bold', fontSize: 15, marginTop: 3, }}>
                            Preço:
                    </Text>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, marginTop: 3, marginLeft: 5 }}>
                            {maskValorMoeda(registro.vi_vlr_unit)}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 1.2 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontWeight: 'bold', fontSize: 15, marginTop: 3, }}>
                            Preço c/ Desc:
                    </Text>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, marginTop: 3, marginLeft: 5 }}>
                            {maskValorMoeda(registro.vi_vlr_total / registro.vi_qtde)}
                        </Text>
                    </View>
                </View> */}

            </TouchableOpacity>
        </Card>
    )
}




export default class SaidaDieselItensScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            salvado: false,
            refreshing: false,

            estoq_mei_seq: 0,
            estoq_mei_item: '',
            estoq_mei_qtde_mov: '1,00',
            estoq_mei_qtde_atual: '0,00',
            estoq_mei_vlr_unit: '0,00',
            estoq_mei_total_mov: '0,00',
            tipo_destino: 'VEIC',
            cod_destino: '',
            estoq_mei_obs: '',

            veiculo_select: null,
            codVeiculo: '',

            estoq_me_idf: props.navigation.state.params.estoq_me_idf,
            estoq_mei_item: props.navigation.state.params.estoq_mei_item,
            estoq_mei_qtde_atual: props.navigation.state.params.estoq_mei_qtde_atual,
            estoq_mei_vlr_unit: props.navigation.state.params.estoq_mei_vlr_unit,
            listaItens: props.navigation.state.params.listaItens ? props.navigation.state.params.listaItens : [],

            ...props.navigation.state.params.registro,
        }
    }

    componentDidMount() {
        this.calculoTotalPedido();
    }

    componentWillUnmount() {

    }

    onFecharTela = () => {
        this.props.navigation.goBack(null);
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeVeiculo = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codVeiculo: value.codVeic,
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistros: [],
            msgErroVeiculo: msgErro,
        })
    }

    onFormSubmit = (event) => {
        this.onSalvarRegistro();
    }


    onRegistroPress = (estoq_mei_seq, estoq_mei_item, estoq_mei_qtde_mov, estoq_mei_vlr_unit, estoq_mei_total_mov, tipo_destino, cod_destino, estoq_mei_obs) => {
        // console.log('-------------onRegistroPress---------------');
        this.setState({
            estoq_mei_seq,
            estoq_mei_item,
            estoq_mei_qtde_mov: maskValorMoeda(estoq_mei_qtde_mov),
            estoq_mei_vlr_unit: maskValorMoeda(estoq_mei_vlr_unit),
            estoq_mei_total_mov: maskValorMoeda(estoq_mei_total_mov),
            tipo_destino,
            cod_destino,
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
            estoq_mei_item: '',
            estoq_mei_qtde_mov: '1,00',
            estoq_mei_vlr_unit: '0,00',
            estoq_mei_total_mov: '0,00',
            tipo_destino: 'VEIC',
            cod_destino: '',
            estoq_mei_obs: '',

            listaItens,
        },
            this.calculoTotalPedido()
        );
    }





    onFormIncluirProduto = (event) => {
        // console.log('------------------------------------------------');
        // console.log('-------------onFormIncluirProduto---------------');
        if (!cod_destino) {
            Alert.showAlert('Informe o Veículo');
            return;
        }
        if (!estoq_mei_qtde_mov) {
            Alert.showAlert('Informe a Quantidade');
            return;
        }
        if (!vlrStringParaFloat(estoq_mei_total_mov)) {
            Alert.showAlert('Informe o Valor do Produto');
            return;
        }

        // this.onGravar();
    }

    // onGravar = () => {
    //     // console.log('------------------------------------------------');
    //     // console.log('-----------------onGravar-----------------------');

    //     let { usuario, listaItens, ven_idf, vi_item, prod_codigo, prod_descricao, vi_qtde,
    //         vi_vlr_unit, vi_tabela, prod_preco_tab1, prod_preco_tab2, prod_qtde_atual,
    //         vi_perc_desc, vi_vlr_acres, vi_vlr_desc, vi_vlr_total, senhaEstoque, checkedDesconto } = this.state;

    //     if (usuario.ue_bloq_venda_sem_est) {
    //         if (parseFloat(vi_qtde) > parseFloat(prod_qtde_atual)) {
    //             if (senhaEstoque !== '') {
    //                 const data = new Date();
    //                 const hora = data.getHours();
    //                 const min = data.getMinutes();
    //                 const codigo = parseInt(parseInt(prod_codigo) + parseInt(hora) + parseInt(min));

    //                 if (codigo != parseInt(senhaEstoque)) {
    //                     if (codigo - 1 != parseInt(senhaEstoque)) {
    //                         if (codigo - 2 != parseInt(senhaEstoque)) {
    //                             if (codigo - 3 != parseInt(senhaEstoque)) {
    //                                 if (codigo - 4 != parseInt(senhaEstoque)) {
    //                                     if (codigo - 5 != parseInt(senhaEstoque)) {
    //                                         Alert.showAlert('Código de liberação do estoque incorreto. Entre em contato com seu Supervisor');
    //                                         return;
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }




    //     // console.log('------------------------------------------------');
    //     // console.log('ue_flag_tabela_preco_minimo: ', usuario.ue_flag_tabela_preco_minimo);
    //     // console.log('ue_flag_desconto_tab1: ', usuario.ue_flag_desconto_tab1);
    //     // console.log('ue_perc_desconto_tab1: ', usuario.ue_perc_desconto_tab1);
    //     // console.log('ue_flag_desconto_tab2: ', usuario.ue_flag_desconto_tab2);
    //     // console.log('ue_perc_desconto_tab2: ', usuario.ue_perc_desconto_tab2);
    //     // console.log('vi_qtde: ', vlrStringParaFloat(vi_qtde));
    //     // console.log('vi_vlr_unit: ', vlrStringParaFloat(vi_vlr_unit));
    //     // console.log('vi_tabela: ', vi_tabela);
    //     // console.log('prod_preco_tab1: ', prod_preco_tab1);
    //     // console.log('prod_preco_tab2: ', prod_preco_tab2);
    //     // console.log('vi_perc_desc: ', vlrStringParaFloat(vi_perc_desc));
    //     // console.log('vi_vlr_desc: ', vlrStringParaFloat(vi_vlr_desc));
    //     // console.log('vi_vlr_acres: ', vlrStringParaFloat(vi_vlr_acres));
    //     // console.log('vi_vlr_total: ', vlrStringParaFloat(vi_vlr_total));


    //     const vlrTotal = vlrStringParaFloat(vi_vlr_total);
    //     const qtde = vlrStringParaFloat(vi_qtde);
    //     const vlrUnitAux = parseFloat((vlrTotal / qtde).toFixed(2));
    //     let vlrUnitComDesc = 0;
    //     // console.log('vlrUnitAux: ', vlrUnitAux);


    //     if (usuario.ue_flag_tabela_preco_minimo) {

    //         // console.log('ue_flag_tabela_preco_minimo: ', usuario.ue_flag_tabela_preco_minimo);
    //         if (checkedDesconto) {
    //             vlrUnitComDesc = parseFloat((prod_preco_tab1 - (prod_preco_tab1 * (vlrStringParaFloat(vi_perc_desc) / 100))).toFixed(2));
    //         } else {
    //             vlrUnitComDesc = vlrStringParaFloat(vi_vlr_unit);
    //         }

    //         // console.log('vlrUnitComDesc: ', vlrUnitComDesc);

    //         if (vlrUnitComDesc < prod_preco_tab2) {
    //             Alert.showAlert('Valor de venda menor que o permittido');
    //             return;
    //         }

    //     } else {

    //         if (vlrStringParaFloat(vi_perc_desc) > 0) {
    //             if (vi_tabela === 1) {
    //                 // console.log('TABELA 1');
    //                 if (usuario.ue_flag_desconto_tab1) {
    //                     // console.log('TABELA 1');
    //                     if (vlrStringParaFloat(vi_perc_desc) > parseFloat(usuario.ue_perc_desconto_tab1)) {
    //                         Alert.showAlert('Percentual do Desconto acima do permitido para Tabela 1');
    //                         return;
    //                     }
    //                 }
    //             } else if (vi_tabela === 2) {
    //                 // console.log('TABELA 2');
    //                 if (usuario.ue_flag_desconto_tab2) {
    //                     // console.log('TABELA 2');
    //                     if (vlrStringParaFloat(vi_perc_desc) > parseFloat(usuario.ue_perc_desconto_tab2)) {
    //                         Alert.showAlert('Percentual do Desconto acima do permitido para Tabela 2');
    //                         return;
    //                     }
    //                 }
    //             }


    //             if (vi_tabela === 1) {
    //                 if (usuario.ue_flag_desconto_tab1) {
    //                     const vlrVendaComDesc = parseFloat((prod_preco_tab1 - (prod_preco_tab1 * (usuario.ue_perc_desconto_tab1 / 100))).toFixed(2));
    //                     // console.log('vlrVendaComDesc1: ', vlrVendaComDesc);
    //                     if (vlrUnitAux < vlrVendaComDesc) {
    //                         Alert.showAlert('Percentual Desconto acima do permitido para Tabela 1');
    //                         return;
    //                     }
    //                 }
    //             } else if (vi_tabela === 2) {
    //                 if (usuario.ue_flag_desconto_tab2) {
    //                     const vlrVendaComDesc = parseFloat((prod_preco_tab2 - (prod_preco_tab2 * (usuario.ue_perc_desconto_tab2 / 100))).toFixed(2));
    //                     // console.log('vlrVendaComDesc2: ', vlrVendaComDesc);
    //                     if (vlrStringParaFloat(vlrUnitAux) < vlrStringParaFloat(vlrVendaComDesc)) {
    //                         Alert.showAlert('Percentual Desconto acima do permitido para Tabela 2');
    //                         return;
    //                     }
    //                 }
    //             }

    //         }
    //     }



    //     if (!checkedDesconto) {
    //         // console.log('checkedDesconto');
    //         if (vi_tabela === 1) {
    //             // console.log('checkedDesconto 1');
    //             if (vlrStringParaFloat(vi_vlr_unit) < prod_preco_tab1) {
    //                 // console.log('checkedDesconto 11');
    //                 vi_vlr_unit = maskValorMoeda(prod_preco_tab1);
    //             }
    //         } else if (vi_tabela === 2) {
    //             // console.log('checkedDesconto 2');
    //             if (vlrStringParaFloat(vi_vlr_unit) < prod_preco_tab2) {
    //                 // console.log('checkedDesconto 22');
    //                 vi_vlr_unit = maskValorMoeda(prod_preco_tab2);
    //             }
    //         }
    //     }

    //     // console.log('vi_vlr_unit: ', vi_vlr_unit);



    //     // console.log('------------------------------------------------');
    //     // console.log('vi_qtde: ', vi_qtde);
    //     // console.log('vi_vlr_unit: ', vi_vlr_unit);
    //     // console.log('vi_tabela: ', vi_tabela);
    //     // console.log('prod_preco_tab1: ', prod_preco_tab1);
    //     // console.log('prod_preco_tab2: ', prod_preco_tab2);
    //     // console.log('vi_perc_desc: ', vi_perc_desc);
    //     // console.log('vi_vlr_desc: ', vi_vlr_desc);
    //     // console.log('vi_vlr_acres: ', vi_vlr_acres);
    //     // console.log('vi_vlr_total: ', vi_vlr_total);


    //     const iIndItem = listaItens.findIndex(registro => registro.vi_item === vi_item);
    //     if (iIndItem >= 0) {
    //         listaItens[iIndItem].vi_qtde = vlrStringParaFloat(vi_qtde);
    //         listaItens[iIndItem].vi_vlr_unit = vlrStringParaFloat(vi_vlr_unit);
    //         listaItens[iIndItem].vi_perc_desc = vlrStringParaFloat(vi_perc_desc === '' ? '0' : vi_perc_desc);
    //         listaItens[iIndItem].vi_vlr_desc = vlrStringParaFloat(vi_vlr_desc === '' ? '0' : vi_vlr_desc);
    //         listaItens[iIndItem].vi_vlr_acres = vlrStringParaFloat(vi_vlr_acres === '' ? '0' : vi_vlr_acres);
    //         listaItens[iIndItem].vi_vlr_total = vlrStringParaFloat(vi_vlr_total);
    //         listaItens[iIndItem].vi_tabela = vi_tabela;
    //     } else {
    //         listaItens.push({
    //             ven_idf,
    //             vi_item,
    //             vi_seq: 0,
    //             prod_codigo,
    //             prod_descricao,
    //             vi_qtde: vlrStringParaFloat(vi_qtde),
    //             vi_vlr_unit: vlrStringParaFloat(vi_vlr_unit),
    //             vi_tabela,
    //             prod_preco_tab1: prod_preco_tab1,
    //             prod_preco_tab2: prod_preco_tab2,
    //             prod_qtde_atual: prod_qtde_atual,
    //             vi_perc_desc: vlrStringParaFloat(vi_perc_desc === '' ? '0' : vi_perc_desc),
    //             vi_vlr_desc: vlrStringParaFloat(vi_vlr_desc === '' ? '0' : vi_vlr_desc),
    //             vi_vlr_acres: vlrStringParaFloat(vi_vlr_acres === '' ? '0' : vi_vlr_acres),
    //             vi_vlr_total: vlrStringParaFloat(vi_vlr_total),
    //         })

    //     }

    //     this.setState({
    //         listaItens,
    //         vi_item: '',
    //         prod_codigo: '',
    //         prod_descricao: '',
    //         vi_qtde: '1',
    //         vi_vlr_unit: '0,00',
    //         vi_tabela: 1,
    //         prod_preco_tab1: 0,
    //         prod_preco_tab2: 0,
    //         prod_qtde_atual: 0,
    //         vi_perc_desc: '0,00',
    //         vi_vlr_desc: '0',
    //         vi_vlr_acres: '0',
    //         vi_vlr_total: '0,00',

    //     },
    //         this.calculoTotalPedido()
    //     );
    // }



    calculoTotalPedido = () => {
        // console.log('-------------calculoTotalPedido---------------');
        const { listaItens } = this.state;
        let qtdeItens = 0;
        let vlrTotal = 0;

        for (var x in listaItens) {
            qtdeItens = qtdeItens + (listaItens[x].estoq_mei_qtde_mov);
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

        const { estoq_mei_qtde_mov, estoq_mei_vlr_unit } = this.state;
        this.calculoItem(value, estoq_mei_vlr_unit);
    }


    onSomarQtde = () => {
        // console.log('-------------onSomarQtde---------------');
        let { estoq_mei_qtde_mov, estoq_mei_vlr_unit } = this.state;
        estoq_mei_qtde_mov = maskValorMoeda(parseFloat(estoq_mei_qtde_mov) + 1);
        this.setState({ estoq_mei_qtde_mov });
        this.calculoItem(estoq_mei_qtde_mov, estoq_mei_vlr_unit);
    }

    onDiminuirQtde = () => {
        // console.log('-------------onDiminuirQtde---------------');
        let { estoq_mei_qtde_mov, estoq_mei_vlr_unit } = this.state;
        if (vlrStringParaFloat(estoq_mei_qtde_mov) > 1) {
            estoq_mei_qtde_mov = maskValorMoeda(vlrStringParaFloat(estoq_mei_qtde_mov) - 1);
        }
        this.setState({ estoq_mei_qtde_mov });
        this.calculoItem(estoq_mei_qtde_mov, estoq_mei_vlr_unit);
    }


    calculoItem = (estoq_mei_qtde_mov, estoq_mei_vlr_unit) => {
        // console.log('------------------------------------------------');
        // console.log('----------------calculoItem---------------------');

        const vlrUnit = vlrStringParaFloat(estoq_mei_vlr_unit);
        const qtde = vlrStringParaFloat(String(estoq_mei_qtde_mov).replace('.', ''));

        console.log('estoq_mei_qtde_mov: ', qtde);
        console.log('estoq_mei_vlr_unit: ', vlrUnit);

        let vlrTotal = 0;

        vlrTotal = parseFloat(parseFloat(vlrUnit) * parseFloat(qtde));

        console.log('vlrTotal: ', vlrTotal);

        vlrTotal = parseFloat(vlrTotal.toFixed(2));

        console.log('vlrTotal-: ', vlrTotal);

        this.setState({
            estoq_mei_total_mov: maskValorMoeda(vlrTotal),
        });
    }






    render() {
        const { estoq_mei_seq, estoq_mei_item, estoq_mei_qtde_mov, estoq_mei_qtde_atual, estoq_mei_vlr_unit, estoq_mei_total_mov,
            tipo_origem, cod_origem, tipo_destino, cod_destino, estoq_mei_obs,
            listaItens, veiculo_select, codVeiculo,
            refreshing, loading, salvado } = this.state;

        console.log('SaidaDieselItensScreen STATE: ', this.state);

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
                                            id="estoq_mei_vlr_unit"
                                            ref="estoq_mei_vlr_unit"
                                            value={String(estoq_mei_vlr_unit)}
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

                                <View style={{}}>
                                    <VeiculosSelect
                                        label="Veículo"
                                        id="veiculo_select"
                                        value={veiculo_select}
                                        codVeiculo={codVeiculo}
                                        onChange={this.onInputChangeVeiculo}
                                        onErro={this.onErroChange}
                                        tipo=""
                                    />
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