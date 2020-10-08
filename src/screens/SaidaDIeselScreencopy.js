import React, { Component } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform, Dimensions, Modal } from 'react-native';
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
                // onPress={() => onRegistroPress(
                //     registro.vi_item,
                //     registro.prod_codigo,
                //     registro.prod_descricao,
                //     registro.vi_qtde,
                //     registro.vi_vlr_unit,
                //     registro.vi_tabela,
                //     registro.prod_preco_tab1,
                //     registro.prod_preco_tab2,
                //     registro.prod_qtde_atual,
                //     registro.vi_perc_desc,
                //     registro.vi_vlr_desc,
                //     registro.vi_vlr_total,
                // )}
                // onLongPress={() => onRegistroLongPress(registro.vi_item)}
            >

                <View style={{ paddingLeft: 16, paddingVertical: 0, flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontWeight: 'bold', fontSize: 15, marginTop: 5, }}>
                            Qtde:
                    </Text>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, marginTop: 5, marginLeft: 5 }}>
                            {registro.estoq_mei_qtde_mov}
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
                </View>

                <View style={{ paddingLeft: 16, paddingVertical: 0, flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontWeight: 'bold', fontSize: 15, marginTop: 3, }}>
                            Desconto:
                    </Text>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, marginTop: 3, marginLeft: 5 }}>
                            {maskValorMoeda(registro.vi_vlr_desc)}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 1.2 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontWeight: 'bold', fontSize: 17, marginTop: 3, }}>
                            Total:
                    </Text>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 17, marginTop: 3, marginLeft: 5 }}>
                            {maskValorMoeda(registro.vi_vlr_total)}
                        </Text>
                    </View>
                </View>

            </TouchableOpacity>
        </Card>
    )
}


export default class SaidaDIeselScreencopy extends Component {

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

            modalItensVisible: false,
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
                onPress: this.onSalvarSaida
            })
    }

    onSalvarSaida = () => {
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

    onItensPress = () => {
        this.setState({ modalItensVisible: true });
    }

    onClosePress = () => {
        this.setState({ modalItensVisible: false });
    }

    onGravarItensPress = (visible) => {
        this.setState({ modalItensVisible: false });
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

                    {/* <View style={{ margin: 20 }} /> */}

                </View>

                <View
                    style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}
                >
                    <Button
                        title="Itens da Saída"
                        backgroundColor='#4682B4'
                        color={Colors.textOnPrimary}
                        buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 20 }}
                        onPress={this.onItensPress}
                        disabled={loading}
                        // visible={estoq_tam_idf}
                        icon={{
                            name: 'barcode',
                            type: 'font-awesome',
                            color: Colors.textOnPrimary
                        }}
                    />

                    <Button
                        title="Salvar Saída"
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





                {/* ----------------------------- */}
                {/* MODAL PARA ITENS              */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalItensVisible}
                    onRequestClose={() => { console.log("Modal ITENS FECHOU.") }}
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
                            paddingTop: 100,
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
                                    }}>Adicionar</Text>
                                </View>

                                <View style={{ marginTop: 4, paddingVertical: 10 }}>

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

                                    <VeiculosSelect
                                        label="Veículo"
                                        id="veiculo_select"
                                        value={veiculo_select}
                                        codVeiculo={codVeiculo}
                                        onChange={this.onInputChangeVeiculo}
                                        onErro={this.onErroChange}
                                        tipo=""
                                    />

                                    <TextInput
                                        label="Observação"
                                        id="estoq_mei_obs"
                                        ref="estoq_mei_obs"
                                        value={estoq_mei_obs}
                                        maxLength={100}
                                        onChange={this.onInputChange}
                                        multiline={true}
                                    />


                                    <Button
                                        title="GRAVAR"
                                        onPress={() => { this.onGravarItensPress() }}
                                        buttonStyle={{ marginTop: 15, height: 35 }}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'check',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />
                                    <Button
                                        title="FECHAR"
                                        onPress={() => { this.onClosePress(!this.state.modalItensVisible) }}
                                        buttonStyle={{ marginTop: 15, height: 35 }}
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