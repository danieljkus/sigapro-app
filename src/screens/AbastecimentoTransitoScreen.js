import React, { Component } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    FlatList, Modal, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Card, Divider, CheckBox, SearchBar } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import { maskDigitarVlrMoeda, vlrStringParaFloat, maskValorMoeda } from "../utils/Maskers";
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import moment from 'moment';
import Alert from '../components/Alert';
import Icon from '../components/Icon';

import VeiculosSelect from '../components/VeiculosSelect';
import HeaderComponent from "../components/HeaderComponent";

const DATE_FORMAT = 'DD/MM/YYYY';

const stateInicial = {
    veiculo_select: null,
    funcionario_select: null,

    codVeiculo: '',

    codFunc: '',
    empFunc: '',
    nomeFunc: '',

    dataViagem: '',
    man_fvd_servico: 0,
    man_fvd_servico_extra: 0,
    desc_sec_ini: '',
    desc_sec_fim: '',
    hora_ini: '',
    hora_fim: '',

    combExtra: 0,
    combArla: 0,

    man_fv_odo_ini: 0,
    man_fv_qtde_comb: '0,00',
    man_fv_qtde_comb_extra: '0,00',
    man_fv_qtde_arla: '0,00',
    man_fvd_disco: 0,

    msgErroVeiculo: 'Informe o Veículo',
}


export default class AbastecimentoTransitoScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,
            ...stateInicial,
        }
    }

    componentDidMount() {

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

        // console.log('onInputChangeVeiculo: ', value)

        if (value) {
            this.setState({
                idfViagem: value.idfViagem,
                codVeiculo: value.codVeic,
                codFunc: value.codFunc ? value.codFunc : '',
                empFunc: value.empFunc ? value.empFunc : '',
                nomeFunc: value.nomeFunc ? value.nomeFunc : '',

                dataViagem: value.dataViagem ? value.dataViagem : '',
                man_fvd_servico: value.man_fvd_servico ? value.man_fvd_servico : 0,
                man_fvd_servico_extra: value.man_fvd_servico_extra ? value.man_fvd_servico_extra : 0,
                desc_sec_ini: value.desc_sec_ini ? value.desc_sec_ini : '',
                desc_sec_fim: value.desc_sec_fim ? value.desc_sec_fim : '',
                hora_ini: value.hora_ini ? value.hora_ini : '',
                hora_fim: value.hora_fim ? value.hora_fim : '',

                man_fv_odo_ini: value.kmOdo ? value.kmOdo : 0,
                combExtra: value.combExtra ? value.combExtra.toFixed(2) : 0,
                combArla: value.combArla ? value.combArla.toFixed(2) : 0,
            });
        } else {
            this.setState({
                idfViagem: 0,
                codFunc: '',
                empFunc: '',
                nomeFunc: '',

                dataViagem: '',
                man_fvd_servico: 0,
                man_fvd_servico_extra: 0,
                desc_sec_ini: '',
                desc_sec_fim: '',
                hora_ini: '',
                hora_fim: '',

                man_fv_odo_ini: 0,
                combExtra: 0,
                combArla: 0,
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            msgErroVeiculo: msgErro
        })
    }

    onLimparTela = () => {
        this.setState(stateInicial);
    }



    onFormSubmit = (event) => {
        // console.log('onFormSubmit: ', this.state)

        if (this.state.msgErroVeiculo.trim() !== '') {
            Alert.showAlert(this.state.msgErroVeiculo);
            return;
        }

        if ((!this.state.veiculo_select) && (!this.state.veiculo_select.idfViagem)) {
            Alert.showAlert('A Viagem não foi Inicializada');
            return;
        }


        if (this.state.veiculo_select.protocoloAberto === 0) {
            Alert.showAlert('Protocolo de saída do estoque desta filial não está aberto');
            return;
        }

        if (vlrStringParaFloat(this.state.man_fv_qtde_comb_extra) > 750) {
            Alert.showAlert('Quantidade de combustível maior que o permitido');
            return;
        }

        if ((vlrStringParaFloat(this.state.man_fv_qtde_comb_extra) > 0) && (vlrStringParaFloat(this.state.man_fv_qtde_comb_extra) > this.state.veiculo_select.estoqComb)) {
            Alert.showAlert('Estoque de Combustível insuficiente');
            return;
        }

        if ((vlrStringParaFloat(this.state.man_fv_qtde_arla) > 0) && (vlrStringParaFloat(this.state.man_fv_qtde_arla) > this.state.veiculo_select.estoqArla)) {
            Alert.showAlert('Estoque de Arla insuficiente');
            return;
        }

        if (checkFormIsValid(this.refs)) {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }

    onSalvarRegistro = () => {
        this.setState({ salvado: true });

        const { idfViagem, codVeiculo, man_fv_qtde_comb_extra, man_fv_qtde_arla, } = this.state;

        const registro = {
            man_fv_veiculo: codVeiculo,
            man_fv_qtde_comb_extra: vlrStringParaFloat(man_fv_qtde_comb_extra),
            man_fv_qtde_arla: vlrStringParaFloat(man_fv_qtde_arla),
        };

        // console.log(registro);
        // return;

        axios.put('/fichaViagem/abastecimentoTransito/' + idfViagem, registro)
            .then(response => {

                Alert.showAlert("Abastecimento gravado com sucesso.")

                this.setState({
                    loading: false,
                    salvado: false,
                })
                this.onLimparTela();

            }).catch(ex => {
                this.setState({ salvado: false });
                console.warn(ex);
                console.warn(ex.response);
            })
    }











    render() {
        const { codVeiculo, codFunc, nomeFunc, man_fv_odo_ini, man_fvd_disco,
            man_fv_qtde_comb_extra, man_fv_qtde_arla, veiculo_select,
            dataViagem, man_fvd_servico, man_fvd_servico_extra, desc_sec_ini, desc_sec_fim, hora_ini, hora_fim, combExtra, combArla,
            loading, salvado,
        } = this.state;

        // console.log('this.state: ', this.state)

        return (
            <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Abastecimento em Trânsito'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >
                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 10 }}
                    >

                        <VeiculosSelect
                            label="Veículo"
                            id="veiculo_select"
                            value={veiculo_select}
                            codVeiculo={codVeiculo}
                            onChange={this.onInputChangeVeiculo}
                            onErro={this.onErroChange}
                            tipo="fichaChegada"
                        />


                        <View style={{ marginBottom: 40, paddingHorizontal: 0, }}>
                            <Text style={{
                                color: Colors.textSecondaryDark,
                                fontWeight: 'bold',
                                fontSize: 20,
                                marginBottom: 15,
                                marginTop: 20,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Dados da Viagem
                            </Text>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Data{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {dataViagem ? moment(dataViagem).format("DD/MM/YYYY") : ''}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Serviço{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {man_fvd_servico ? man_fvd_servico + (man_fvd_servico_extra ? ' / ' + man_fvd_servico_extra : '') : ''}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Horário{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {hora_ini ? hora_ini + ' / ' + hora_fim : ''}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Linha {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                    {desc_sec_ini ? desc_sec_ini + ' a ' + desc_sec_fim : ''}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Motorista {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                    {codFunc ? codFunc + ' - ' + nomeFunc : nomeFunc}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Comb. Extra{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {combExtra ? maskValorMoeda(parseFloat(combExtra)) + ' Lt' : ''}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Arla{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {combArla ? maskValorMoeda(parseFloat(combArla)) + ' Lt' : ''}
                                    </Text>
                                </View>
                            </View>

                        </View>



                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Odôm. Saída"
                                    id="man_fv_odo_ini"
                                    ref="man_fv_odo_ini"
                                    value={man_fv_odo_ini}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Nº Disco"
                                    id="man_fvd_disco"
                                    ref="man_fvd_disco"
                                    value={man_fvd_disco}
                                    onChange={this.onInputChange}
                                    keyboardType="numeric"
                                    enabled={false}
                                />
                            </View>
                        </View>



                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Qtde Comb. Extra"
                                    id="man_fv_qtde_comb_extra"
                                    ref="man_fv_qtde_comb_extra"
                                    value={String(man_fv_qtde_comb_extra)}
                                    maxLength={10}
                                    keyboardType="numeric"
                                    masker={maskDigitarVlrMoeda}
                                    onChange={this.onInputChange}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Qtde Arla"
                                    id="man_fv_qtde_arla"
                                    ref="man_fv_qtde_arla"
                                    value={String(man_fv_qtde_arla)}
                                    maxLength={10}
                                    keyboardType="numeric"
                                    masker={maskDigitarVlrMoeda}
                                    onChange={this.onInputChange}
                                />
                            </View>
                        </View>

                    </View>



                    <ProgressDialog
                        visible={salvado}
                        title="App Nordeste"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>

                <Button
                    title="SALVAR"
                    loading={loading}
                    onPress={this.onFormSubmit}
                    color={Colors.textOnPrimary}
                    buttonStyle={{ margin: 5, marginTop: 10 }}
                    disabled={this.state.msgErroVeiculo.trim() !== ''}
                    icon={{
                        name: 'check',
                        type: 'font-awesome',
                        color: Colors.textOnPrimary
                    }}
                />

            </SafeAreaView>
        )
    }
}
