import React, { Component, createRef } from 'react';
import { View, ScrollView, Text, FlatList, TouchableOpacity, Modal, Keyboard, SafeAreaView } from 'react-native';
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
import HeaderComponent from "../components/HeaderComponent";
import moment from 'moment';
import VeiculosSelect from '../components/VeiculosSelect';
import FiliaisSelect from '../components/FiliaisSelect';
import CentroCustoSelect from '../components/CentroCustoSelect';
import { getFilial } from '../utils/LoginManager';

const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.estoq_mei_seq, registro.estoq_mei_item, registro.estoq_mei_qtde_mov, registro.tipo_destino, registro.cod_destino, registro.descr_destino, registro.estoq_mei_obs)}
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

            ...props.navigation.state.params.registro,

            item_select: null,
            codItem: '',

            estoq_me_idf: props.navigation.state.params.estoq_me_idf,
            estoq_mei_seq: 0,
            estoq_mei_item: props.navigation.state.params.estoq_mei_item,
            estoq_mei_qtde_mov: '1,00',
            estoq_mei_qtde_atual: maskValorMoeda(props.navigation.state.params.estoq_mei_qtde_atual),
            estoq_mei_valor_unit: props.navigation.state.params.estoq_mei_valor_unit,
            estoq_mei_total_mov: props.navigation.state.params.estoq_mei_total_mov,
            tipo_origem: props.navigation.state.params.tipo_origem,
            cod_origem: props.navigation.state.params.cod_origem,
            tipo_destino: props.navigation.state.params.tipo_destino,
            cod_destino: props.navigation.state.params.cod_destino,
            cod_ccdestino: props.navigation.state.params.cod_ccdestino,
            descr_destino: '',
            estoq_mei_obs: 'BAIXA SIGAPRO',

            listaItens: props.navigation.state.params.listaItens ? props.navigation.state.params.listaItens : [],


            estoq_me_idf: props.navigation.state.params.registro.estoq_me_idf ? props.navigation.state.params.registro.estoq_me_idf : 0,
            estoq_me_data: props.navigation.state.params.registro.estoq_me_data ? moment(props.navigation.state.params.registro.estoq_me_data).format('DD/MM/YYYY HH:mm') : moment(new Date()).format('DD/MM/YYYY HH:mm'),
            estoq_me_obs: props.navigation.state.params.registro.estoq_me_obs ? props.navigation.state.params.registro.estoq_me_obs : '',

            tipo_destino: props.navigation.state.params.registro.tipo_destino,
            checkedVeiculo: true,
            checkedFilial: false,
            checkedOS: false,

            listaItens: props.navigation.state.params.registro.listaItens ? props.navigation.state.params.registro.listaItens : [],

            veiculo_select: null,
            codVeiculo: '',

            filial_select: null,
            codFilial: '',

            cc_select: null,
            codCC: '',

            estoq_mei_ordem_servico: '',
            controleOS: '',
            codOS: '',
            descricaoOS: '',

        }
    }

    componentDidMount() {
        getFilial().then(filial => { this.setState({ filial }); });
        this.calculoTotalPedido();
        this.onMudaTipoDestino(this.state.tipo_destino);
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
                estoq_mei_valor_unit: parseFloat(value.estoq_ef_custo_medio),
                estoq_mei_total_mov: parseFloat(value.estoq_ef_custo_medio),
            });
        } else {
            this.setState({
                // codItem: '',
                // estoq_ie_descricao: '',
                qtdeEstoque: 0,
                custo: 0,
                estoq_mei_qtde_atual: maskValorMoeda(0),
                estoq_mei_valor_unit: 0,
                estoq_mei_total_mov: 0,
            });
        }
    }

    onInputChangeVeiculo = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codVeiculo: value.codVeic,
                descr_destino: value.adm_vei_placa + ' - ' + value.adm_veimarca_descricao_chassi,
            });
        }
    }

    onInputChangeFilial = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codFilial: value.adm_fil_codigo,
                descr_destino: value.adm_fil_descricao,
            });
        }
    }

    onInputChangeCC = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codCC: value.contab_cc_codigo,
                descr_cc: value.contab_cc_descricao,
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistros: [],
            msgErroVeiculo: msgErro,
        })
    }

    onInputChangeOS = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        clearTimeout(this.buscaRegistrosId);
        this.buscaRegistrosId = setTimeout(() => {
            this.buscaOS(value);
        }, 1000);
    }

    buscaOS = (value) => {

        axios.get('/ordemServicos/buscaOS', {
            params: {
                controle: value
            }
        }).then(response => {
            const { data } = response;

            this.setState({
                estoq_mei_ordem_servico: data.idf,
                codVeiculo: data.tipo === 'MANU' ? data.codigo : '',
                codFilial: data.tipo === 'DIV' ? data.filial : '',
                codCC: data.tipo === 'DIV' ? data.codigo : '',
                codOS: {
                    controle: data.controle,
                    idf: data.idf,
                    tipo: data.tipo,
                    filial: data.filial,
                    codigo: data.codigo,
                    descricao: data.descricao,
                    descricaoOS: data.tipo === 'MANU' ? 'MANUTENÇÃO' : data.tipo === 'DIV' ? 'DIVERSOS' : data.tipo === 'COMP' ? 'COMPONENTE' : data.tipo === 'RECPEC' ? 'REC. PEÇAS' : '',
                },
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


    onMudaTipoDestino = (tipo) => {
        if (!this.state.estoq_me_idf) {
            if (tipo === 'VEIC') {
                this.setState({
                    tipo_destino: 'VEIC',
                    codVeiculo: '',
                    codFilial: '',
                    codCC: '',
                    estoq_mei_ordem_servico: '',
                    controleOS: '',
                    descricaoOS: '',
                    checkedVeiculo: true,
                    checkedFilial: false,
                    checkedOS: false,
                });
            } else if (tipo === 'CC') {
                this.setState({
                    tipo_destino: 'CC',
                    codVeiculo: '',
                    codFilial: '',
                    codCC: '',
                    estoq_mei_ordem_servico: '',
                    controleOS: '',
                    descricaoOS: '',
                    checkedVeiculo: false,
                    checkedFilial: true,
                    checkedOS: false,
                });
            } else if (tipo === 'OS') {
                this.setState({
                    tipo_destino: 'OS',
                    codVeiculo: '',
                    codFilial: '',
                    codCC: '',
                    estoq_mei_ordem_servico: '',
                    controleOS: '',
                    descricaoOS: '',
                    checkedVeiculo: false,
                    checkedFilial: false,
                    checkedOS: true,
                });
            }
        } else {
            if (tipo === 'VEIC') {
                this.setState({
                    codVeiculo: this.props.navigation.state.params.registro.codVeiculo ? this.props.navigation.state.params.registro.codVeiculo : '',
                    codFilial: '',
                    codCC: '',
                    estoq_mei_ordem_servico: '',
                    controleOS: '',
                    descricaoOS: '',
                    checkedVeiculo: true,
                    checkedFilial: false,
                    checkedOS: false,
                });
            } else if (tipo === 'CC') {
                this.setState({
                    codVeiculo: '',
                    codFilial: this.props.navigation.state.params.registro.codFilial ? this.props.navigation.state.params.registro.codFilial : '',
                    codCC: this.props.navigation.state.params.registro.codCC ? this.props.navigation.state.params.registro.codCC : '',
                    estoq_mei_ordem_servico: '',
                    controleOS: '',
                    descricaoOS: '',
                    checkedVeiculo: false,
                    checkedFilial: true,
                    checkedOS: false,
                });
            } else if (tipo === 'OS') {
                this.setState({
                    codVeiculo: this.props.navigation.state.params.registro.codVeiculo ? this.props.navigation.state.params.registro.codVeiculo : '',
                    codFilial: '',
                    codCC: '',
                    estoq_mei_ordem_servico: this.props.navigation.state.params.registro.estoq_mei_ordem_servico ? this.props.navigation.state.params.registro.estoq_mei_ordem_servico : '',
                    controleOS: this.props.navigation.state.params.registro.controleOS ? this.props.navigation.state.params.registro.controleOS : '',
                    descricaoOS: '',
                    checkedVeiculo: false,
                    checkedFilial: false,
                    checkedOS: true,
                });
                this.buscaOS(this.props.navigation.state.params.registro.controleOS);
            }
        }
    }





    onRegistroPress = (estoq_mei_seq, estoq_mei_item, estoq_mei_qtde_mov, tipo_destino, cod_destino, descr_destino, estoq_mei_obs) => {
        this.setState({
            estoq_mei_seq,
            estoq_mei_qtde_mov: maskValorMoeda(estoq_mei_qtde_mov),
            cod_destino,
            descr_destino,
            estoq_mei_obs,
        });
    }


    onRegistroLongPress = (estoq_mei_seq) => {
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
        const listaItens = [...this.state.listaItens];
        const index = listaItens.findIndex(registro => registro.estoq_mei_seq === estoq_mei_seq);

        listaItens.splice(index, 1);

        this.setState({
            estoq_mei_seq: 0,
            estoq_mei_qtde_mov: '1,00',
            estoq_mei_valor_unit: 0,
            estoq_mei_total_mov: 0,
            cod_destino: '',
            descr_destino: '',
            estoq_mei_obs: '',

            listaItens,
        },
            this.calculoTotalPedido()
        );
    }





    onFormIncluirProduto = (event) => {
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
        if ((vlrStringParaFloat(this.state.estoq_mei_qtde_atual) - vlrStringParaFloat(this.state.estoq_mei_qtde_mov) - vlrStringParaFloat(this.state.estoq_me_qtde)) < 0) {
            Alert.showAlert('Estoque Insuficiente');
            return;
        }

        this.onGravarProduto();
    }

    onGravarProduto = () => {
        const { listaItens } = this.state;
        const iIndItem = listaItens.findIndex(registro => registro.estoq_mei_seq === this.state.estoq_mei_seq);
        if (iIndItem >= 0) {

            listaItens[iIndItem].estoq_mei_qtde_mov = vlrStringParaFloat(this.state.estoq_mei_qtde_mov);
            listaItens[iIndItem].estoq_mei_valor_unit = this.state.estoq_mei_valor_unit;
            listaItens[iIndItem].estoq_mei_total_mov = this.state.estoq_mei_total_mov;

        } else {

            listaItens.push({
                estoq_mei_seq: listaItens.length + 1,
                estoq_mei_item: this.state.item_select.estoq_ie_codigo,
                estoq_ie_descricao: this.state.item_select.estoq_ie_descricao,
                estoq_mei_qtde_mov: this.state.estoq_mei_qtde_mov,
                estoq_mei_valor_unit: this.state.estoq_mei_valor_unit,
                estoq_mei_total_mov: this.state.estoq_mei_total_mov,
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
            estoq_mei_valor_unit: 0,
            estoq_mei_total_mov: 0,
            cod_destino: '',
            descr_destino: '',
            estoq_mei_obs: '',
        },
            this.calculoTotalPedido()
        );
    }



    calculoTotalPedido = () => {
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
        const state = {};
        state[id] = value;
        this.setState(state);

        const { estoq_mei_qtde_mov, estoq_mei_valor_unit } = this.state;
        this.calculoItem(value, estoq_mei_valor_unit);
    }


    onSomarQtde = () => {
        let { estoq_mei_qtde_mov, estoq_mei_valor_unit } = this.state;
        estoq_mei_qtde_mov = maskValorMoeda(parseFloat(estoq_mei_qtde_mov) + 1);
        this.setState({ estoq_mei_qtde_mov });
        this.calculoItem(estoq_mei_qtde_mov, estoq_mei_valor_unit);
    }

    onDiminuirQtde = () => {
        let { estoq_mei_qtde_mov, estoq_mei_valor_unit } = this.state;
        if (vlrStringParaFloat(estoq_mei_qtde_mov) > 1) {
            estoq_mei_qtde_mov = maskValorMoeda(vlrStringParaFloat(estoq_mei_qtde_mov) - 1);
        }
        this.setState({ estoq_mei_qtde_mov });
        this.calculoItem(estoq_mei_qtde_mov, estoq_mei_valor_unit);
    }


    calculoItem = (estoq_mei_qtde_mov, estoq_mei_valor_unit) => {
        const vlrUnit = estoq_mei_valor_unit;
        const qtde = vlrStringParaFloat(String(estoq_mei_qtde_mov).replace('.', ''));
        let vlrTotal = parseFloat(parseFloat(vlrUnit) * parseFloat(qtde));
        vlrTotal = parseFloat(vlrTotal.toFixed(2));
        this.setState({
            estoq_mei_total_mov: maskValorMoeda(vlrTotal),
        });
    }



    onEscanearPress = () => {
        this.props.navigation.push('BarCodeScreen', {
            onBarCodeRead: this.onBarCodeRead
        })
    }

    onBarCodeRead = event => {
        const { data, rawData, type } = event;
        const codBar = String(data).substr(6, 6);
        this.setState({
            codItem: codBar,
        }, this.buscaItem(codBar));
    }

    buscaItem = (value) => {
        this.setState({ carregando: true });
        axios.get('/listaItens', {
            params: {
                codItem: value,
                buscaEstoque: 0,
            }
        }).then(response => {
            const { data } = response;
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





    onFormSubmit = (event) => {
        if ((this.state.checkedVeiculo) && ((!this.state.veiculo_select) || (!this.state.veiculo_select.codVeic))) {
            Alert.showAlert('Informe o Veículo');
            return;
        }
        if ((this.state.checkedFilial) && ((!this.state.filial_select) || (!this.state.filial_select.adm_fil_codigo) || (!this.state.cc_select) || (!this.state.cc_select.contab_cc_codigo))) {
            Alert.showAlert('Informe o Setor');
            return;
        }
        if ((this.state.checkedOS) && (!this.state.estoq_mei_ordem_servico)) {
            Alert.showAlert('Informe a Ordem de Serviço');
            return;
        }

        if ((!this.state.listaItens) || (this.state.listaItens.length === 0)) {
            Alert.showAlert('Inclua algum Item na Saída.');
            return;
        }
        this.onSalvarRegistro();
    }

    onSalvarRegistro = () => {
        const { listaItens, estoq_me_idf, estoq_me_data, estoq_me_obs,
            estoq_mei_ordem_servico, estoq_mei_ficha_viagem } = this.state;

        this.setState({ salvado: true });

        let tipo_destino = '';
        let cod_destino = '';
        let cod_ccdestino = '';

        if (this.state.checkedOS) {
            if (this.state.codOS.tipo === 'VEIC') {
                tipo_destino = 'VEIC';
                cod_destino = this.state.codOS.codigo;
            } else if (this.state.codOS.tipo === 'DIV') {
                tipo_destino = 'CC';
                cod_destino = this.state.codOS.filial;
                cod_ccdestino = this.state.codOS.codigo;
            } else if (this.state.codOS.tipo === 'COMP') {
                tipo_destino = 'COMP';
            } else if (this.state.codOS.tipo === 'RECPEC') {
                tipo_destino = 'RECPEC';
            }
        } else if (this.state.checkedVeiculo) {
            tipo_destino = 'VEIC';
            cod_destino = this.state.veiculo_select.codVeic;
        } if (this.state.checkedFilial) {
            tipo_destino = 'CC';
            cod_destino = this.state.filial_select.adm_fil_codigo;
            cod_ccdestino = this.state.cc_select.contab_cc_codigo;
        }

        let lista = listaItens.map(regList => {
            return {
                estoq_mei_seq: regList.estoq_mei_seq,
                estoq_mei_item: regList.estoq_mei_item,
                estoq_ie_descricao: regList.estoq_ie_descricao,
                estoq_mei_qtde_mov: vlrStringParaFloat(regList.estoq_mei_qtde_mov),
                estoq_mei_valor_unit: regList.estoq_mei_valor_unit,
                estoq_mei_total_mov: regList.estoq_mei_total_mov,
                tipo_origem: 'FIL',
                cod_origem: this.state.filial,
                tipo_destino,
                cod_destino,
                cod_ccdestino,
                estoq_mei_ordem_servico: estoq_mei_ordem_servico,
                estoq_mei_ficha_viagem: estoq_mei_ficha_viagem,
                estoq_mei_obs: regList.estoq_mei_obs,
            }
        });

        const registro = {
            estoq_me_idf,
            estoq_me_data: moment(estoq_me_data, DATE_FORMAT).format("YYYY-MM-DD HH:mm"),
            estoq_me_obs,

            listaItens: lista,
        };

        let axiosMethod;
        if (estoq_me_idf) {
            axiosMethod = axios.put('/saidasEstoque/update/' + estoq_me_idf, registro);
        } else {
            axiosMethod = axios.post('/saidasEstoque/store', registro);
        }
        axiosMethod.then(response => {
            this.props.navigation.goBack(null);
            if (this.props.navigation.state.params.onRefresh) {
                this.props.navigation.state.params.onRefresh();
            }
        }).catch(ex => {
            this.setState({ salvado: false });
            console.warn(ex);
        })

    }








    render() {
        const { estoq_me_idf, estoq_me_data, estoq_mei_qtde_mov, estoq_mei_qtde_atual,
            tipo_destino, checkedVeiculo, checkedFilial, checkedOS, veiculo_select, codVeiculo, filial_select, codFilial, cc_select, codCC, controleOS, descricaoOS,
            listaItens, item_select, codItem, refreshing, loading, salvado } = this.state;

        // console.log('SaidaEstoqueItensScreen STATE: ', this.state);

        return (
            <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Itens da Baixa'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >
                    <View style={{ flex: 1, flexDirection: "column", alignItems: 'stretch' }}>

                        <View style={{ flex: 1, backgroundColor: Colors.background }}>

                            <View style={{ paddingHorizontal: 10, marginTop: 20 }}>

                                <TextInput
                                    label="Data"
                                    id="estoq_me_data"
                                    ref="estoq_me_data"
                                    value={estoq_me_data}
                                    maxLength={60}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />

                                <View style={{ marginTop: -10, marginBottom: 0 }}>
                                    <Text style={{
                                        color: Colors.primary,
                                        textAlign: 'center',
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        height: 30,
                                        paddingTop: 0,
                                    }}>DESTINO</Text>
                                </View>


                                <View style={{ flexDirection: 'row', marginTop: 0, marginBottom: 10 }}>
                                    <CheckBox
                                        center
                                        title='Veículo'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={checkedVeiculo}
                                        onPress={() => { this.onMudaTipoDestino('VEIC') }}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                        disabled={estoq_me_idf ? true : false}
                                    />
                                    <CheckBox
                                        center
                                        title='Setor'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={checkedFilial}
                                        onPress={() => { this.onMudaTipoDestino('CC') }}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                        disabled={estoq_me_idf ? true : false}
                                    />
                                    <CheckBox
                                        center
                                        title='O.S'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={checkedOS}
                                        onPress={() => { this.onMudaTipoDestino('OS') }}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                        disabled={estoq_me_idf ? true : false}
                                    />
                                </View>

                                {tipo_destino === 'VEIC' ? (
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
                                ) : null}

                                {tipo_destino === 'CC' ? (
                                    <View style={{}}>
                                        <FiliaisSelect
                                            label="Filial"
                                            id="filial_select"
                                            codFilial={codFilial}
                                            onChange={this.onInputChangeFilial}
                                            value={filial_select}
                                            enabled={true}
                                        />
                                        <CentroCustoSelect
                                            label="Centro Custo"
                                            id="cc_select"
                                            codCC={codCC}
                                            onChange={this.onInputChangeCC}
                                            value={cc_select}
                                        />
                                    </View>
                                ) : null}

                                {tipo_destino === 'OS' ? (
                                    <View style={{}}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ width: "47%", marginRight: 20 }}>
                                                <TextInput
                                                    label="Nº O.S"
                                                    id="controleOS"
                                                    ref="controleOS"
                                                    value={String(controleOS)}
                                                    onChange={this.onInputChangeOS}
                                                    maxLength={6}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                            <View style={{ width: "47%" }}>
                                                <TextInput
                                                    label="Tipo O.S"
                                                    id="descricaoOS"
                                                    ref="descricaoOS"
                                                    value={descricaoOS ? String(descricaoOS) : ''}
                                                    enabled={false}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ) : null}

                            </View>

                            <View style={{ height: 1, backgroundColor: Colors.grayBackground }} />

                            <View style={{ paddingHorizontal: 10, marginTop: 20, marginBottom: 10 }}>

                                <View>
                                    <ItemEstoqueSelect
                                        label="Item"
                                        id="item_select"
                                        codItem={codItem}
                                        buscaEstoque={1}
                                        comSaldo={1}
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

                                <View style={{ flex: 2, marginRight: 2 }}>
                                    <Button
                                        title="GRAVAR ITEM"
                                        loading={loading}
                                        onPress={this.onFormIncluirProduto}
                                        buttonStyle={{ height: 40, marginTop: 0, marginHorizontal: 10 }}
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

                            </View>


                            <View style={{ height: 1, backgroundColor: Colors.grayBackground }} />

                            {((!listaItens) || (listaItens.length === 0))
                                ? null : (
                                    <View style={{}}>
                                        <View style={{ marginTop: 5, marginBottom: 0 }}>
                                            <Text style={{
                                                color: Colors.primary,
                                                textAlign: 'center',
                                                fontSize: 25,
                                                fontWeight: 'bold',
                                                height: 30,
                                                paddingTop: 0,
                                            }}>Lista dos Itens</Text>
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

                </ScrollView>

                <View style={{ margin: 5, marginTop: 10 }}>
                    <Button
                        title="SALVAR BAIXA ESTOQUE"
                        loading={loading}
                        onPress={this.onFormSubmit}
                        buttonStyle={{ height: 45 }}
                        backgroundColor={Colors.primaryDark}
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

                <ProgressDialog
                    visible={salvado}
                    title="SIGA PRO"
                    message="Gravando. Aguarde..."
                />
            </SafeAreaView>
        )
    }
}
