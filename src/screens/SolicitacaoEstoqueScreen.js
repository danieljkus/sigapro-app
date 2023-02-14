import React, { Component } from 'react';
import {View, Text, ScrollView, SafeAreaView} from 'react-native';
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
import { getFilial, getUsuario } from '../utils/LoginManager';
import TipoSolicitacaoSelect from '../components/TipoSolicitacaoSelect';
import FiliaisSelect from '../components/FiliaisSelect';
import CentroCustoSelect from '../components/CentroCustoSelect';
import HeaderComponent from "../components/HeaderComponent";

const DATE_FORMAT = 'DD/MM/YYYY';

export default class SolicitacaoEstoqueScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,

            estoq_sf_controle: props.navigation.state.params.registro.estoq_sf_controle ? props.navigation.state.params.registro.estoq_sf_controle : 0,
            estoq_sf_data: props.navigation.state.params.registro.estoq_sf_data ? moment(props.navigation.state.params.registro.estoq_sf_data).format(DATE_FORMAT) : moment(new Date()).format(DATE_FORMAT),
            estoq_sf_usuario: props.navigation.state.params.registro.estoq_sf_usuario ? props.navigation.state.params.registro.estoq_sf_usuario : '',
            estoq_sf_situacao: props.navigation.state.params.registro.estoq_sf_situacao ? props.navigation.state.params.registro.estoq_sf_situacao : 'G',
            estoq_sf_situacao_descr: props.navigation.state.params.registro.estoq_sf_situacao_descr ? props.navigation.state.params.registro.estoq_sf_situacao_descr : 'GERADA',
            estoq_sf_obs: props.navigation.state.params.registro.estoq_sf_obs ? props.navigation.state.params.registro.estoq_sf_obs : '',

            estoq_sf_filial_solicitante: props.navigation.state.params.registro.estoq_sf_filial_solicitante ? props.navigation.state.params.registro.estoq_sf_filial_solicitante : '',
            estoq_sf_filial_solicitada: props.navigation.state.params.registro.estoq_sf_filial_solicitada ? props.navigation.state.params.registro.estoq_sf_filial_solicitada : '',
            estoq_sf_setor_solicitada: props.navigation.state.params.registro.estoq_sf_setor_solicitada ? props.navigation.state.params.registro.estoq_sf_setor_solicitada : '',
            compras_sugtip_descricao: props.navigation.state.params.registro.compras_sugtip_descricao ? props.navigation.state.params.registro.compras_sugtip_descricao : '',

            tipoSol_select: null,
            estoq_sf_tipo: '',
            codTipoSol: '',

            filial_select: null,
            codFilial: '',

            cc_select: null,
            codCC: '',

            listaItens: props.navigation.state.params.registro.listaItens ? props.navigation.state.params.registro.listaItens : [],

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
        // console.log('PROPS: ', this.props.navigation.state.params.registro);

        getFilial().then(filial => {
            this.setState({
                filial,
                codFilial: this.props.navigation.state.params.registro.estoq_sf_filial_solicitada,
                codCC: this.props.navigation.state.params.registro.estoq_sf_setor_solicitada ? this.props.navigation.state.params.registro.estoq_sf_setor_solicitada : '',

                estoq_sf_tipo: this.props.navigation.state.params.registro.estoq_sf_tipo ? this.props.navigation.state.params.registro.estoq_sf_tipo : '',
                codTipoSol: this.props.navigation.state.params.registro.estoq_sf_tipo ? this.props.navigation.state.params.registro.estoq_sf_tipo : '',
            });
        })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeTipoSol = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                estoq_sf_tipo: value.compras_sugtip_codigo,
                codTipoSol: value.compras_sugtip_codigo,
                descr_tipoSol: value.compras_sugtip_descricao,
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



    onFormSubmit = (event) => {
        if ((!this.state.filial_select) || (!this.state.filial_select.adm_fil_codigo)) {
            Alert.showAlert('Informe uma Filial');
            return;
        }

        if ((!this.state.listaItens) || (this.state.listaItens.length === 0)) {
            Alert.showAlert('Inclua algum Item.');
            return;
        }
        this.onSalvarRegistro();
    }

    onSalvarRegistro = () => {
        const { listaItens, estoq_sf_controle, estoq_sf_data, estoq_sf_situacao, estoq_sf_tipo, estoq_sf_obs,
            estoq_sf_filial_solicitada, estoq_sf_setor_solicitada } = this.state;

        const registro = {
            estoq_sf_controle,
            estoq_sf_data: moment(estoq_sf_data, DATE_FORMAT).format("YYYY-MM-DD HH:mm"),
            estoq_sf_situacao: estoq_sf_situacao ? estoq_sf_situacao : 'G',
            estoq_sf_tipo,
            estoq_sf_filial_solicitada: this.state.filial_select.adm_fil_codigo,
            estoq_sf_setor_solicitada: this.state.cc_select && this.state.cc_select.contab_cc_codigo ? this.state.cc_select.contab_cc_codigo : '',
            estoq_sf_obs,

            listaItens,
        };

        // console.log('onSalvarRegistro: ', registro);
        // return;

        this.setState({ salvado: true });

        let axiosMethod;
        if (estoq_sf_controle) {
            axiosMethod = axios.put('/solicitacoesEstoqueFiliais/update/' + estoq_sf_controle, registro);
        } else {
            axiosMethod = axios.post('/solicitacoesEstoqueFiliais/store', registro);
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






    // ---------------------------------------------------------------------------
    // MODAL PARA PRODUTOS DA SAIDA
    // ---------------------------------------------------------------------------

    onAbrirItensModal = () => {
        this.props.navigation.navigate('SolicitacaoEstoqueItensScreen', {
            estoq_sf_controle: this.state.estoq_sf_controle,
            listaItens: this.state.listaItens,
            estoq_sfi_seq: 0,
            estoq_sfi_item: 0,
            estoq_sfi_qtde_solicitada: 1,
            estoq_sfi_qtde_atendida: 1,
            estoq_sfi_obs: '',

            estoq_sfi_situacao: 'S',
            checkedSolicitado: true,
            checkedPendente: false,
            checkedAtendido: false,
            checkedCancelado: false,

            onCarregaProdutos: this.onCarregaProdutos
        });
    }

    onCarregaProdutos = (listaItens) => {
        // console.log('onCarregaProdutos: ', listaItens);
        this.setState({ listaItens });
    }






    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------




    render() {
        const { estoq_sf_controle, estoq_sf_data, estoq_sf_situacao_descr, estoq_sf_usuario, estoq_sf_tipo, estoq_sf_obs,
            filial_select, codFilial, cc_select, codCC, tipoSol_select, codTipoSol, usuario,
            carregarRegistro, loading, salvado } = this.state;

        // console.log('SolicitacaoEstoqueScreen - STATE: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Solicitação de Estoque'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
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
                                    label="Nº Solicitação"
                                    id="estoq_sf_controle"
                                    ref="estoq_sf_controle"
                                    value={String(estoq_sf_controle)}
                                    onChange={this.onInputChange}
                                    maxLength={6}
                                    keyboardType="numeric"
                                    enabled={false}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Usuário"
                                    id="estoq_sf_usuario"
                                    ref="estoq_sf_usuario"
                                    value={String(estoq_sf_usuario)}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>


                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    type="date"
                                    label="Data"
                                    id="estoq_sf_data"
                                    ref="estoq_sf_data"
                                    value={estoq_sf_data}
                                    masker={maskDate}
                                    dateFormat={DATE_FORMAT}
                                    onChange={this.onInputChange}
                                    validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                    required={true}
                                    errorMessage="Formato correto DD/MM/AAAA"
                                    editable={estoq_sf_controle ? false : true}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Situação"
                                    id="estoq_sf_situacao_descr"
                                    ref="estoq_sf_situacao_descr"
                                    value={String(estoq_sf_situacao_descr)}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>


                        <TipoSolicitacaoSelect
                            label="Tipo"
                            id="tipoSol_select"
                            codTipoSol={codTipoSol}
                            onChange={this.onInputChangeTipoSol}
                            value={tipoSol_select}
                        />

                        <TextInput
                            label="Observação"
                            id="estoq_sf_obs"
                            ref="estoq_sf_obs"
                            value={estoq_sf_obs}
                            maxLength={100}
                            onChange={this.onInputChange}
                            multiline={true}
                        />

                        <Divider />
                        <Divider />

                        <View style={{ marginBottom: 15, height: 35, backgroundColor: Colors.dividerDark, borderRadius: 3 }}>
                            <Text style={{ paddingLeft: 15, paddingTop: 6, fontSize: 18 }}>
                                FILIAL SOLICITADA
                            </Text>
                        </View>

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




                        <View style={{ flexDirection: 'row', justifyContent: "center", marginBottom: 20, marginTop: 30 }} >
                            <View style={{ flex: 2, marginRight: 2 }}>
                                <Button
                                    title="ITENS"
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
                                <Button
                                    title="SALVAR"
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
                            </View>
                        </View>

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
