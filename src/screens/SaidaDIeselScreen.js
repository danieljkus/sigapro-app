import React, { Component } from 'react';
import {View, Text, ScrollView, SafeAreaView} from 'react-native';
import { CheckBox } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
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
import HeaderComponent from "../components/HeaderComponent";

const DATE_FORMAT = 'DD/MM/YYYY';

export default class SaidaDieselScreen extends Component {

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

            // estoq_me_data: moment(new Date()).format(DATE_FORMAT),
            // estoq_me_numero: '0',
            // estoq_me_obs: '',
            // estoq_me_qtde: 0,

            estoq_mei_seq: 0,
            estoq_mei_item: 0,
            estoq_mei_qtde_mov: 0,
            estoq_mei_qtde_atual: 0,
            estoq_mei_valor_unit: 0,
            estoq_mei_total_mov: 0,
            estoq_mei_obs: '',

            estoq_me_tipo_saida: !props.navigation.state.params.registro.estoq_me_idf ? 'D' : (this.props.navigation.state.params.registro.listaItens[0].estoq_mei_item === '19' || this.props.navigation.state.params.registro.listaItens[0].estoq_mei_item === '24') ? 'D' : 'A',
            checkedDiesel: props.navigation.state.params.registro.checkedDiesel ? props.navigation.state.params.registro.checkedDiesel : false,
            checkedArla: props.navigation.state.params.registro.checkedArla ? props.navigation.state.params.registro.checkedArla : false,

            listaItens: props.navigation.state.params.registro.listaItens ? props.navigation.state.params.registro.listaItens : [],

            veiculo_select: null,
            codVeiculo: '',

            // ...props.navigation.state.params.registro,

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
        this.onMudaTipoSaida(this.state.estoq_me_tipo_saida);
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onMudaTipoSaida = (tipo) => {
        if (tipo === 'D') {
            this.setState({
                estoq_me_tipo_saida: 'D',
                checkedDiesel: true,
                checkedArla: false,
            });
        } else if (tipo === 'A') {
            this.setState({
                estoq_me_tipo_saida: 'A',
                checkedDiesel: false,
                checkedArla: true,
            });
        }

        if (!this.state.estoq_me_idf) {
            this.setState({
                listaItens: [],
            });
        }

        this.setState({ carregarRegistro: true });
        axios.get('/estoque/buscaEstoque', {
            params: {
                codItem: tipo === 'D' ? 19 : 166048,
            }
        }).then(response => {
            this.setState({
                carregarRegistro: false,
                estoq_mei_item: response.data.codItem,
                estoq_mei_qtde_atual: response.data.qtde,
                estoq_mei_valor_unit: response.data.custo,
            });
        }).catch(ex => {
            this.setState({ carregarRegistro: false });
            console.warn(ex);
            console.warn(ex.response);
        });

    }


    onFormSubmit = (event) => {
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

        let axiosMethod;
        if (estoq_me_idf) {
            axiosMethod = axios.put('/saidasEstoque/update/' + estoq_me_idf, registro);
        } else {
            axiosMethod = axios.post('/saidasEstoque/store', registro);
        }
        axiosMethod.then(response => {
            // myEmitter.emit('atualizarDashboard');
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

    onAbrirProdutosVendaModal = () => {
        this.props.navigation.navigate('SaidaDieselItensScreen', {
            estoq_me_idf: this.state.estoq_me_idf,
            listaItens: this.state.listaItens,
            filial: this.state.filial,
            estoq_mei_item: this.state.estoq_mei_item,
            estoq_mei_qtde_atual: this.state.estoq_mei_qtde_atual,
            estoq_mei_qtde_mov: 1,
            estoq_mei_valor_unit: this.state.estoq_mei_valor_unit,
            estoq_mei_total_mov: this.state.estoq_mei_valor_unit,
            onCarregaProdutos: this.onCarregaProdutos
        });
    }

    onCarregaProdutos = (listaItens) => {
        this.setState({ listaItens });
        this.calculoTotalPedido();
    }





    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------




    render() {
        const { estoq_me_idf, estoq_me_data, estoq_me_numero, estoq_me_obs,
            checkedDiesel, checkedArla, estoq_me_qtde,
            carregarRegistro, loading, salvado } = this.state;


        // console.log('SaidaDieselScreen - STATE: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Baixa de Diesel/Arla'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

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

                        <View style={{ flexDirection: 'row' }}>
                            <CheckBox
                                center
                                title='Diesel'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedDiesel}
                                onPress={() => { this.onMudaTipoSaida('D') }}
                                containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                disabled={estoq_me_idf ? true : false}
                            />
                            <CheckBox
                                center
                                title='Arla'
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={checkedArla}
                                onPress={() => { this.onMudaTipoSaida('A') }}
                                containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                disabled={estoq_me_idf ? true : false}
                            />
                        </View>

                        {/* <View style={{ marginBottom: 20, marginTop: 20 }} >
                            <TextInput
                                label="Observação da Saída"
                                id="estoq_me_obs"
                                ref="estoq_me_obs"
                                value={estoq_me_obs}
                                maxLength={100}
                                onChange={this.onInputChange}
                                multiline={true}
                            />
                        </View> */}

                        {/* <Divider />
                        <Divider />
                        <Divider /> */}


                        <View style={{ flexDirection: 'row', justifyContent: "center", marginBottom: 20, marginTop: 30 }} >
                            <View style={{ flex: 2, marginRight: 2 }}>
                                <Button
                                    title="ITENS DA SAÍDA"
                                    loading={loading}
                                    onPress={() => { this.onAbrirProdutosVendaModal() }}
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
                                {this.state.estoq_me_idf ? null : (
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
            </SafeAreaView >
        )
    }
}
