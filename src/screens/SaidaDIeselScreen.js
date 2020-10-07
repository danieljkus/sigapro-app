import React, { Component } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform, Dimensions } from 'react-native';
import { Card, Divider, CheckBox } from 'react-native-elements';

import TextInput from '../components/TextInput';
import moment from 'moment';
import Button from '../components/Button';
import Colors from '../values/Colors';
import axios from 'axios';
import Alert from '../components/Alert';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { maskDate, maskValorMoeda, maskDigitarVlrMoeda, vlrStringParaFloat } from "../utils/Maskers";
import { getEmpresa } from '../utils/LoginManager';
import VeiculosSelect from '../components/VeiculosSelect';

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

export default class SaidaDIeselScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            estoq_me_idf: 0,
            estoq_me_data: moment(new Date()).format(DATE_FORMAT),
            estoq_me_numero: '0',
            estoq_me_obs: 'BAIXA SIGAPRO',

            estoq_mei_seq: 0,
            estoq_mei_item: 0,
            estoq_mei_qtde_mov: 0,
            estoq_mei_vlr_unit: 0,
            estoq_mei_total_mov: 0,
            estoq_mei_obs: '',

            estoq_me_tipo_saida: 'D',
            checkedDiesel: true,
            checkedArla: false,

            veiculo_select: null,
            codVeiculo: '',

            listaItens: [],

            loading: false,
            salvado: false,
            calculando: false,
        }
    }

    componentDidMount() {
        getEmpresa().then(empresa => {
            this.setState({ empresa });
        })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onSubmitForm = (event) => {
        if ((!this.state.listaItens) || (this.state.listaItens.length === 0)) {
            Alert.showAlert('Inclua algum Item na Lista.');
            return;
        }

        // if (!ven_pessoa) {
        //     Alert.showAlert('Informe o Cliente.');
        //     return;
        // }

        Alert.showConfirm("Deseja salvar essa Saída?", {
            text: "Cancelar"
        },
            {
                text: "OK",
                onPress: this.onSalvar
            })
    }

    onSalvar = () => {
        // const { registro } = this.state;

        // this.setState({ salvado: true });
        // registro.estoq_tam_qtde_medida = vlrStringParaFloat(registro.estoq_tam_qtde_medida);

        // return axios
        //     .post('/medicaoTanqueArla/store', registro)
        //     .then(response => {
        //         this.props.navigation.goBack(null);
        //         this.props.navigation.state.params.onRefresh();
        //     }).catch(ex => {
        //         const { response } = ex;
        //         this.setState({ salvado: false });

        //         if (ex.response) {
        //             // erro no servidor
        //             Alert.showAlert('Não foi possível concluir a solicitação.');
        //         } else {
        //             // sem internet
        //             Alert.showAlert('Verifique sua conexão com a internet.');
        //         }
        //     })
    }



    onMudaTipoSaida = (tipo) => {
        console.log('onMudaTipoSaida: ', tipo);
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



    render() {
        const { loading, salvado, calculando,
            estoq_me_idf, estoq_me_data, estoq_me_numero, estoq_me_obs,
            estoq_mei_item, estoq_mei_qtde_mov, estoq_mei_vlr_unit, estoq_mei_total_mov, estoq_mei_obs,
            checkedDiesel, checkedArla, veiculo_select, codVeiculo } = this.state;

        return (
            <ScrollView
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="always"
                refreshControl={(
                    <RefreshControl
                        refreshing={loading}
                    />
                )}
            >
                <View
                    style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                >
                    {estoq_me_idf ? (
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
                    ) : null}

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
                            // enabled={false}
                            />
                        </View>

                        <View style={{ width: "47%" }}>
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
                            // editable={false}
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <CheckBox
                            center
                            title='Diesel'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedDiesel}
                            onPress={() => { this.onMudaTipoSaida('D') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
                        <CheckBox
                            center
                            title='Arla'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={checkedArla}
                            onPress={() => { this.onMudaTipoSaida('A') }}
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                        />
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
                    <Divider />

                    <View style={{ margin: 20 }} />

                    <VeiculosSelect
                        label="Veículo"
                        id="veiculo_select"
                        value={veiculo_select}
                        codVeiculo={codVeiculo}
                        onChange={this.onInputChangeVeiculo}
                        onErro={this.onErroChange}
                        tipo=""
                    />

                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: "47%", marginRight: 20 }}>
                            <TextInput
                                label="Quantidade"
                                id="estoq_mei_qtde_mov"
                                ref="estoq_mei_qtde_mov"
                                value={String(estoq_mei_qtde_mov)}
                                maxLength={10}
                                keyboardType="numeric"
                                masker={maskDigitarVlrMoeda}
                                onChange={this.onInputChangeQtdeArla}
                            />
                        </View>

                        <View style={{ width: "47%" }}>
                            <TextInput
                                label="Qtde Estoque"
                                id="estoq_mei_qtde_mov"
                                ref="estoq_mei_qtde_mov"
                                value={estoq_mei_qtde_mov}
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
                                value={estoq_mei_vlr_unit}
                                onChange={this.onInputChange}
                                enabled={false}
                            />
                        </View>

                        <View style={{ width: "47%" }}>
                            <TextInput
                                label="Total"
                                id="estoq_mei_total_mov"
                                ref="estoq_mei_total_mov"
                                value={estoq_mei_total_mov}
                                onChange={this.onInputChange}
                                enabled={false}
                            />
                        </View>
                    </View>

                    <TextInput
                        label="Observação"
                        id="estoq_mei_obs"
                        ref="estoq_mei_obs"
                        value={estoq_mei_obs}
                        maxLength={100}
                        onChange={this.onInputChange}
                        multiline={true}
                    />

                </View>

                <View
                    style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}
                >
                    <Button
                        title="Salvar"
                        backgroundColor='#4682B4'
                        color={Colors.textOnPrimary}
                        buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                        onPress={this.onSubmitForm}
                        disabled={loading}
                        // visible={estoq_tam_idf}
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

                <ProgressDialog
                    visible={calculando}
                    title="SIGA PRO"
                    message="Calculando Volume. Aguarde..."
                />

            </ScrollView >
        )
    }
}