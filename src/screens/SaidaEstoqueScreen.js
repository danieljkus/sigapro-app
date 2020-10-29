import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CheckBox, Divider } from 'react-native-elements';
import axios from 'axios';
import StatusBar from '../components/StatusBar';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import moment from 'moment';
import { maskDate, maskValorMoeda } from '../utils/Maskers';
import { getFilial } from '../utils/LoginManager';
import VeiculosSelect from '../components/VeiculosSelect';
import FiliaisSelect from '../components/FiliaisSelect';
import CentroCustoSelect from '../components/CentroCustoSelect';

const DATE_FORMAT = 'DD/MM/YYYY';

export default class SaidaEstoqueScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,

            estoq_me_idf: props.navigation.state.params.registro.estoq_me_idf ? props.navigation.state.params.registro.estoq_me_idf : 0,
            estoq_me_data: props.navigation.state.params.registro.estoq_me_data ? moment(props.navigation.state.params.registro.estoq_me_data).format(DATE_FORMAT) : moment(new Date()).format(DATE_FORMAT),
            estoq_me_numero: props.navigation.state.params.registro.estoq_me_numero ? props.navigation.state.params.registro.estoq_me_numero : '0',
            estoq_me_obs: props.navigation.state.params.registro.estoq_me_obs ? props.navigation.state.params.registro.estoq_me_obs : '',
            estoq_me_qtde: props.navigation.state.params.registro.estoq_me_qtde ? props.navigation.state.params.registro.estoq_me_qtde : 0,

            estoq_mei_seq: 0,
            estoq_mei_item: 0,
            estoq_mei_qtde_mov: 0,
            estoq_mei_qtde_atual: 0,
            estoq_mei_valor_unit: 0,
            estoq_mei_total_mov: 0,
            estoq_mei_obs: '',

            tipo_destino: 'V',
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

            refreshing: false,
            carregarRegistro: false,
            carregando: false,
            carregarMais: false,
            pagina: 1,

        }
    }

    async componentWillUnmount() {

    }

    componentDidMount() {
        getFilial().then(filial => { this.setState({ filial }); })
        this.calculoTotalPedido();
        this.onMudaTipoDestino(this.state.tipo_destino);
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
        console.log('onInputChangeCC: ', value);

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


    onMudaTipoDestino = (tipo) => {
        console.log('onMudaTipoDestino: ', tipo);

        if (!this.state.estoq_me_idf) {
            if (tipo === 'V') {
                this.setState({
                    tipo_destino: 'V',
                    checkedVeiculo: true,
                    checkedFilial: false,
                    checkedOS: false,
                });
            } else if (tipo === 'S') {
                this.setState({
                    tipo_destino: 'S',
                    checkedVeiculo: false,
                    checkedFilial: true,
                    checkedOS: false,
                });
            } else if (tipo === 'O') {
                this.setState({
                    tipo_destino: 'O',
                    checkedVeiculo: false,
                    checkedFilial: false,
                    checkedOS: true,
                });
            }
        }
    }


    onFormSubmit = (event) => {
        if (!this.state.veiculo_select) {
            Alert.showAlert('Informe o Veículo');
            return;
        }
        if ((!this.state.listaItens) || (this.state.listaItens.length === 0)) {
            Alert.showAlert('Inclua algum Item na Saída.');
            return;
        }
        this.onSalvarRegistro();
    }

    onSalvarRegistro = () => {
        const { listaItens, estoq_me_idf, estoq_me_data, estoq_me_numero, estoq_me_obs } = this.state;

        this.setState({ salvado: true });
        const registro = {
            estoq_me_idf,
            estoq_me_data: moment(estoq_me_data, DATE_FORMAT).format("YYYY-MM-DD HH:mm"),
            estoq_me_numero: estoq_me_numero ? estoq_me_numero : '0',
            estoq_me_obs,

            listaItens,
        };

        console.log('onSalvarRegistro: ', registro);
        // return;

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

    calculoTotalPedido = () => {
        const { listaItens } = this.state;
        let qtdeItens = 0;
        for (var x in listaItens) { qtdeItens = qtdeItens + (parseFloat(listaItens[x].estoq_mei_qtde_mov)); };
        qtdeItens = parseFloat(qtdeItens.toFixed(2));
        this.setState({ estoq_me_qtde: qtdeItens });
    }






    // ---------------------------------------------------------------------------
    // MODAL PARA PRODUTOS DA SAIDA
    // ---------------------------------------------------------------------------

    onAbrirItensModal = () => {
        if ((this.state.checkedVeiculo) && ((!this.state.veiculo_select) || (!this.state.veiculo_select.codVeic))) {
            Alert.showAlert('Informe o Veículo');
            return;
        }
        if ((this.state.checkedFilial) && ((!this.state.filial_select) || (!this.state.filial_select.adm_fil_codigo) || (!this.state.cc_select) || (!this.state.cc_select.contab_cc_codigo))) {
            Alert.showAlert('Informe o Setor');
            return;
        }
        if ((this.state.checkedOS) && ((!this.state.os_select) || (!this.state.os_select.idf))) {
            Alert.showAlert('Informe a Ordem de Serviço');
            return;
        }

        let tipoDest = '';
        let codDest = '';
        let codCCDest = '';

        if (this.state.checkedVeiculo) {
            tipoDest = 'VEIC';
            codDest = this.state.veiculo_select.codVeic;
        }
        if (this.state.checkedFilial) {
            tipoDest = 'FIL';
            codDest = this.state.filial_select.adm_fil_codigo;
            codCCDest = this.state.cc_select.contab_cc_codigo;
        }

        this.props.navigation.navigate('SaidaEstoqueItensScreen', {
            estoq_me_idf: this.state.estoq_me_idf,
            listaItens: this.state.listaItens,
            filial: this.state.filial,
            codItem: '',
            estoq_mei_item: this.state.estoq_mei_item,
            estoq_mei_qtde_atual: this.state.estoq_mei_qtde_atual,
            estoq_mei_qtde_mov: 1,
            estoq_mei_valor_unit: this.state.estoq_mei_valor_unit,
            estoq_mei_total_mov: this.state.estoq_mei_valor_unit,
            tipo_origem: 'FIL',
            cod_origem: this.state.filial,
            tipo_destino: tipoDest,
            cod_destino: codDest,
            cod_ccdestino: codCCDest,
            onCarregaProdutos: this.onCarregaProdutos
        });
    }

    onCarregaProdutos = (listaItens) => {
        console.log('onCarregaProdutos: ', listaItens);
        this.setState({ listaItens });
        this.calculoTotalPedido();
    }





    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------




    render() {
        const { estoq_me_idf, estoq_me_data, estoq_me_numero, estoq_me_obs, estoq_me_qtde,
            veiculo_select, codVeiculo, filial_select, codFilial, cc_select, codCC,
            tipo_destino, checkedVeiculo, checkedFilial, checkedOS,
            carregarRegistro, loading, salvado } = this.state;


        console.log('SaidaEstoqueScreen - STATE: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >
                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                    >

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Controle"
                                    id="estoq_me_numero"
                                    ref="estoq_me_numero"
                                    value={String(estoq_me_numero)}
                                    onChange={this.onInputChange}
                                    maxLength={6}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Número da IDF"
                                    id="estoq_me_idf"
                                    ref="estoq_me_idf"
                                    value={String(estoq_me_idf)}
                                    onChange={this.onInputChange}
                                    maxLength={6}
                                    keyboardType="numeric"
                                    enabled={false}
                                />
                            </View>
                        </View>


                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    type="date"
                                    label="Data"
                                    id="estoq_me_data"
                                    ref="estoq_me_data"
                                    value={estoq_me_data}
                                    masker={maskDate}
                                    dateFormat={DATE_FORMAT}
                                    onChange={this.onInputChange}
                                    validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                    required={true}
                                    errorMessage="Formato correto DD/MM/AAAA"
                                    editable={estoq_me_idf ? false : true}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Qtde Itens"
                                    id="estoq_me_qtde"
                                    ref="estoq_me_qtde"
                                    value={maskValorMoeda(estoq_me_qtde)}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>

                        <TextInput
                            label="Observação da Saída"
                            id="estoq_me_obs"
                            ref="estoq_me_obs"
                            value={estoq_me_obs}
                            maxLength={100}
                            onChange={this.onInputChange}
                            multiline={true}
                        />

                        <Divider />
                        <Divider />

                        <Text style={{ margin: 15, fontSize: 18 }}>
                            DESTINO
                        </Text>

                        <View style={{ flexDirection: 'row', marginTop: 0, marginBottom: 15 }}>
                            <CheckBox
                                center
                                title='Veículo'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedVeiculo}
                                onPress={() => { this.onMudaTipoDestino('V') }}
                                containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                disabled={estoq_me_idf ? true : false}
                            />
                            <CheckBox
                                center
                                title='Setor'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedFilial}
                                onPress={() => { this.onMudaTipoDestino('S') }}
                                containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                disabled={estoq_me_idf ? true : false}
                            />
                            <CheckBox
                                center
                                title='O.S'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedOS}
                                onPress={() => { this.onMudaTipoDestino('O') }}
                                containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                disabled={estoq_me_idf ? true : false}
                            />
                        </View>

                        <Divider />
                        <Divider />

                        {tipo_destino === 'V' ? (
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

                        {tipo_destino === 'S' ? (
                            <View style={{}}>
                                <FiliaisSelect
                                    label="Filial"
                                    id="filial_select"
                                    codFilial={codFilial}
                                    onChange={this.onInputChangeFilial}
                                    value={filial_select}
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



                        <View style={{ flexDirection: 'row', justifyContent: "center", marginBottom: 20, marginTop: 30 }} >
                            <View style={{ flex: 2, marginRight: 2 }}>
                                <Button
                                    title="ITENS DA SAÍDA"
                                    loading={loading}
                                    onPress={() => { this.onAbrirItensModal() }}
                                    buttonStyle={{ height: 45 }}
                                    backgroundColor={Colors.buttonSecondary}
                                    textStyle={{
                                        fontWeight: 'bold',
                                        fontSize: 15
                                    }}
                                    icon={{
                                        name: 'barcode',
                                        type: 'font-awesome',
                                        color: Colors.textOnPrimary
                                    }}
                                />
                            </View>
                            <View style={{ flex: 2, marginLeft: 2 }}>
                                {this.state.vendaEnviada && this.state.parSinc
                                    ? <Text style={{ textAlign: 'center', color: '#d50000', marginTop: 5 }}> Pedido Enviado </Text>
                                    : (
                                        <Button
                                            title="SALVAR SAÍDA"
                                            loading={loading}
                                            onPress={this.onFormSubmit}
                                            buttonStyle={{ height: 45 }}
                                            backgroundColor={Colors.buttonPrimary}
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
                                    )}
                            </View>
                        </View>

                        {/* <Text style={{ fontSize: 5 }}>{estoq_me_idf}</Text> */}

                    </View>

                    <ProgressDialog
                        visible={salvado}
                        title="SIGA PRO"
                        message="Gravando. Aguarde..."
                    />

                    <ProgressDialog
                        visible={carregarRegistro}
                        title="SIGA PRO"
                        message="Aguarde..."
                    />

                </ScrollView>
            </View >
        )
    }
}
