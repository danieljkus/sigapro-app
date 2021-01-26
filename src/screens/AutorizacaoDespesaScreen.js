import React, { Component } from 'react';
import { View, Text, ScrollView, RefreshControl, Platform, Modal, TouchableOpacity, Linking } from 'react-native';
import { Card, Divider } from 'react-native-elements';
import { checkFormIsValid } from '../utils/Validator';

import TextInput from '../components/TextInput';
import moment from 'moment';
import Button from '../components/Button';
import Colors from '../values/Colors';
import axios from 'axios';
import Alert from '../components/Alert';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { maskValorMoeda, maskDigitarVlrMoeda, vlrStringParaFloat } from "../utils/Maskers";
import FiliaisSelect from '../components/FiliaisSelect';
import CtaFinancSelect from '../components/CtaFinancSelect';

const { OS } = Platform;

export const OPCOES_COMBO_TIPO = [
    {
        key: 'E',
        label: 'Exato'
    },
    {
        key: 'M',
        label: 'Máximo'
    },
    {
        key: 'A',
        label: 'Aberto'
    },
]


export default class AutorizacaoDespesaScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,
            modalZap: false,

            filialSelect: null,

            ...props.navigation.state.params.registro,
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeFilial = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                fin_ad_filial: value.adm_fil_codigo
            });
        }
    }

    onInputChangeCtaFinanc = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                fin_ad_conta_fin: value.fin_cf_codigo
            });
        }
    }

    onFormSubmit = (event) => {
        if (checkFormIsValid(this.refs)) {
            this.onSalvar();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }


    onSalvar = () => {
        this.setState({ salvado: true });

        const registro = this.state;

        registro.fin_ad_valor = parseFloat(vlrStringParaFloat(registro.fin_ad_valor));

        // console.log('onSalvar: ', registro)

        let axiosMethod;
        if (registro.fin_ad_documento) {
            axiosMethod = axios.put('/autorzacaoDespesas/update/' + registro.fin_ad_documento, registro);
        } else {
            axiosMethod = axios.post('/autorzacaoDespesas/store', registro);
        }
        axiosMethod.then(response => {

            // console.log('onSalvar response: ', response.data)

            if (registro.fin_ad_documento) {
                this.props.navigation.goBack(null);
                if (this.props.navigation.state.params.onRefresh) {
                    this.props.navigation.state.params.onRefresh();
                }
            } else {
                if (response) {
                    this.state.fin_ad_documento = response.data;
                    this.setState({ 
                        salvado: false, 
                        modalZap: true,
                        fin_ad_situacao: ''
                    });
                }
            }

        }).catch(ex => {
            this.setState({ salvado: false });
            console.warn(ex);
        })
    }


    onModalWhatsApp = (visible, fin_ad_documento) => {
        this.setState({ modalZap: visible });

        if (fin_ad_documento) {
            Linking.openURL(
                'https://api.whatsapp.com/send?' +
                // 'phone=' + telefone +
                '&text=' + '>> Expresso Nordeste\n>> Autorização de Despesas\n>> Código: ' + fin_ad_documento + '\n>> ' + this.state.fin_ad_descricao_aut
            );
        }
    }


    render() {
        const { loading, salvado, filialSelect, ctaFinancSelect,
            fin_ad_documento, fin_ad_descricao_aut, fin_ad_autorizado_por, fin_ad_repetir, fin_ad_filial,
            fin_ad_conta_fin, fin_ad_valor, fin_ad_tipo, fin_ad_situacao, fin_ad_idf_lanc } = this.state;

        // console.log('AutorizacaoDespesaScreen: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <ScrollView
                    style={{ flex: 1, }}
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

                        {fin_ad_documento ? (
                            <TextInput
                                label="Documento"
                                id="fin_ad_documento"
                                ref="fin_ad_documento"
                                value={fin_ad_documento}
                                maxLength={30}
                                onChange={this.onInputChange}
                                enabled={false}
                            />
                        ) : null}

                        <TextInput
                            label="Descrição"
                            id="fin_ad_descricao_aut"
                            ref="fin_ad_descricao_aut"
                            value={fin_ad_descricao_aut}
                            onChange={this.onInputChange}
                            multiline={true}
                            maxLength={100}
                            style={{
                                height: 70
                            }}
                        />

                        <TextInput
                            label="Autorizado Por"
                            id="fin_ad_autorizado_por"
                            ref="fin_ad_autorizado_por"
                            value={fin_ad_autorizado_por}
                            maxLength={100}
                            onChange={this.onInputChange}
                        />

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Repetições"
                                    id="fin_ad_repetir"
                                    ref="fin_ad_repetir"
                                    value={fin_ad_repetir}
                                    onChange={this.onInputChange}
                                    keyboardType="numeric"
                                    enabled={fin_ad_documento ? false : true}
                                />
                            </View>

                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Valor"
                                    id="fin_ad_valor"
                                    ref="fin_ad_valor"
                                    value={String(fin_ad_valor)}
                                    onChange={this.onInputChange}
                                    maxLength={10}
                                    keyboardType="numeric"
                                    masker={maskDigitarVlrMoeda}
                                    required={true}
                                    errorMessage="O Valor é Obrigatório"
                                />
                            </View>
                        </View>

                        <TextInput
                            type="select"
                            label="Tipo Valor"
                            id="fin_ad_tipo"
                            ref="fin_ad_tipo"
                            value={fin_ad_tipo}
                            options={OPCOES_COMBO_TIPO}
                            onChange={this.onInputChange}
                        />

                        <FiliaisSelect
                            label="Filial"
                            id="filialSelect"
                            codFilial={fin_ad_filial}
                            onChange={this.onInputChangeFilial}
                            value={filialSelect}
                            enabled={true}
                        />

                        <CtaFinancSelect
                            label="Cta Financ"
                            id="ctaFinancSelect"
                            codFilial={fin_ad_conta_fin}
                            onChange={this.onInputChangeCtaFinanc}
                            value={ctaFinancSelect}
                        />

                        {fin_ad_situacao === 'P' && !fin_ad_idf_lanc ? (
                            <Button
                                title="SALVAR"
                                loading={loading}
                                onPress={this.onFormSubmit}
                                color={Colors.textOnPrimary}
                                buttonStyle={{ marginBottom: 20, marginTop: 20 }}
                                icon={{
                                    name: 'check',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />
                        ) : null}

                    </View>

                    <ProgressDialog
                        visible={salvado}
                        title="P7 Força de Vendas"
                        message="Gravando. Aguarde..."
                    />



                    {/* ----------------------------- */}
                    {/* MODAL PARA DOCUMENTO ZAP      */}
                    {/* ----------------------------- */}
                    <Modal
                        visible={this.state.modalZap}
                        onRequestClose={() => { console.log("Modal ZAP FECHOU.") }}
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
                                width: "70%",
                                paddingTop: 150,
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
                                            marginTop: 10,
                                            marginBottom: 10,
                                            marginLeft: 15,
                                            textAlign: 'center',
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}>Documento Gerado</Text>
                                    </View>

                                    <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row' }}>
                                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, flex: 1, marginTop: 5, }}>
                                            {fin_ad_documento}
                                        </Text>
                                    </View>

                                    <Button
                                        title="WhatsApp"
                                        onPress={() => { this.onModalWhatsApp(false, fin_ad_documento) }}
                                        buttonStyle={{ marginTop: 20, height: 32 }}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'whatsapp',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />

                                    <Button
                                        title="Cancelar"
                                        onPress={() => { this.onModalWhatsApp(false, '') }}
                                        buttonStyle={{ marginTop: 20, height: 32 }}
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
                    </Modal>


                </ScrollView>
            </View>
        )
    }
}