import React, { Component } from 'react';
import { View, ScrollView, RefreshControl, Text, FlatList } from 'react-native';
import { Card, Divider, CheckBox } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import { getTemPermissao } from '../utils/LoginManager';
import FiliaisSelect from '../components/FiliaisSelect';
import moment from 'moment';


export default class PneusTrocaScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvando: false,

            filialChecked: props.navigation.state.params.registro.registro.tipoTela === 'ADDVEIC' ? false : true,
            recapadoraChecked: false,
            sucataChecked: false,

            filialSelect: null,
            pneusSelect: [],
            posicaoesSelect: [],
            motivoMovSelect: [],
            tipoSucSelect: [],

            ...props.navigation.state.params.registro,

            listaPneusVeic: props.navigation.state.params.registro.listaPneusVeic,

            pneus_sul_sulco1: props.navigation.state.params.registro.registro.sulco1,
            pneus_sul_sulco2: props.navigation.state.params.registro.registro.sulco2,
            pneus_sul_sulco3: props.navigation.state.params.registro.registro.sulco3,
            pneus_sul_sulco4: props.navigation.state.params.registro.registro.sulco4,
        }
    }

    componentDidMount() {
        this.buscaMotivoMov();
        this.buscaTipoSuc();
        this.buscaPneusEstoque();
    }

    buscaMotivoMov = () => {
        this.setState({ motivoMovSelect: [], pneus_cp_marca: '' });
        axios.get('/pneus/listaTipoMovimentacao', {
        }).then(response => {
            const { data } = response;
            const motivoMovSelect = data.map(regList => {
                return {
                    key: regList.pneus_tm_codigo,
                    label: regList.pneus_tm_descricao
                }
            });
            motivoMovSelect.unshift({ key: 0, label: "Selecione um Motivo" });
            this.setState({
                motivoMovSelect,
                registro: {
                    ...this.state.registro,
                    pneus_mov_tipo_mov: '',
                }
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                motivoMovSelect: [{ label: "Motivo não encontrda", key: 0 }],
            });
        })

    }

    buscaTipoSuc = () => {
        this.setState({ tipoSucSelect: [], pneus_cp_marca: '' });
        axios.get('/pneus/listaTipoSucateamento', {
        }).then(response => {
            const { data } = response;
            const tipoSucSelect = data.map(regList => {
                return {
                    key: regList.pneus_ts_codigo,
                    label: regList.pneus_ts_descricao
                }
            });
            tipoSucSelect.unshift({ key: 0, label: "Selecione um Tipo" });
            this.setState({
                tipoSucSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                tipoSucSelect: [{ label: "Tipo não encontrda", key: 0 }],
            });
        })

    }

    buscaPneusEstoque = () => {
        this.setState({ pneusSelect: [], salvando: true });
        axios.get('/pneus/listaPneusEstoque', {
            params: {
                veiculo: this.state.registro.pneus_mov_veiculo,
            }
        }).then(response => {
            const { data } = response;
            const pneusSelect = data.pneus.map(regList => {
                return {
                    key: regList.pneus_mov_pneu,
                    label: regList.pneus_mov_pneu,
                    idf: regList.pneus_mov_idf,
                    vida: regList.pneus_mov_vida,
                    km: regList.pneus_mov_km_ini,
                    sulco1: regList.sulco1,
                    sulco2: regList.sulco2,
                    sulco3: regList.sulco3,
                    sulco4: regList.sulco4,
                }
            });
            pneusSelect.unshift({ key: '', label: "" });

            const posicaoesSelect = data.posicoes.map(regListPos => {
                const ind = this.state.listaPneusVeic ? this.state.listaPneusVeic.findIndex(registro => String(registro.pneus_mov_posicao) === String(regListPos.posicao)) : -1;
                const pneu = ind >= 0 ? this.state.listaPneusVeic[ind].pneus_mov_pneu : '';
                return {
                    key: regListPos.posicao,
                    label: regListPos.posicao,
                    eixo: regListPos.eixo,
                    pneu: pneu,
                }
            });
            posicaoesSelect.unshift({ key: '', label: "" });

            this.setState({
                pneusSelect,
                posicaoesSelect,
                salvando: false,
                registro: {
                    ...this.state.registro,
                    pneus_mov_idf_novo: 0,
                    pneus_mov_pneu_novo: '',
                    // pneus_mov_posicao: '',
                    // pneus_mov_eixo: '',
                }
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                pneusSelect: [],
                posicaoesSelect: [],
                salvando: false,
                registro: {
                    ...this.state.registro,
                    pneus_mov_idf_novo: 0,
                    pneus_mov_pneu_novo: '',
                    // pneus_mov_posicao: '',
                    // pneus_mov_eixo: '',
                }
            });
        })

    }


    onInputChange = (id, value) => {
        const { registro } = this.state;
        registro[id] = value;
        this.setState({ registro });
    }

    onInputChangeFilial = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            const { registro } = this.state;
            registro.pneus_mov_filial = value.adm_fil_codigo;
            this.setState({
                registro
            });
        }
    }

    onInputChangePneu = (id, value) => {
        if (value) {
            const ind = value ? this.state.pneusSelect.findIndex(registro => String(registro.key) === String(value)) : -1;
            const { registro } = this.state;
            registro.pneus_mov_idf_novo = this.state.pneusSelect[ind].idf;
            registro.pneus_mov_pneu_novo = this.state.pneusSelect[ind].key;
            registro.vida = this.state.pneusSelect[ind].vida;
            registro.pneus_mov_km_ini = this.state.pneusSelect[ind].km;
            registro.sulco1 = this.state.pneusSelect[ind].sulco1;
            registro.sulco2 = this.state.pneusSelect[ind].sulco2;
            registro.sulco3 = this.state.pneusSelect[ind].sulco3;
            registro.sulco4 = this.state.pneusSelect[ind].sulco4;
            this.setState({
                registro
            });
        }
    }

    onInputChangePosicao = (id, value) => {
        if (value) {
            const ind = value ? this.state.posicaoesSelect.findIndex(registro => String(registro.key) === String(value)) : -1;
            const { registro } = this.state;
            registro.pneus_mov_posicao = this.state.posicaoesSelect[ind].key;
            registro.pneus_mov_eixo = this.state.posicaoesSelect[ind].eixo;
            registro.pneu_atual = this.state.posicaoesSelect[ind].pneu;
            this.setState({
                registro
            });
        }
    }


    onOKForm = (event) => {
        const { registro } = this.state;
        console.log('onOKForm: ', registro);
        if (checkFormIsValid(this.refs)) {
            if (registro.tipoTela === 'ADDVEIC') {
                if (!registro.pneus_mov_pneu_novo) {
                    Alert.showAlert("Informe o Pneu");
                    return;
                }
            } else {
                if (this.state.filialChecked) {
                    if ((!this.state.filialSelect) || (!registro.pneus_mov_filial)) {
                        Alert.showAlert("Informe a Filial");
                        return;
                    }
                    if (!registro.pneus_mov_tipo_mov) {
                        Alert.showAlert("Informe o Motivo da Movimentação");
                        return;
                    }
                }
                if ((this.state.sucataChecked) && (!registro.pneus_mov_tipo_sucata)) {
                    Alert.showAlert("Informe o Tipo de Sucateamento");
                    return;
                }
            }
            Alert.showConfirm("Deseja gravar a movimentação?", {
                text: "Cancelar"
            },
                {
                    text: "OK",
                    onPress: this.onSalvarRegistro
                })
        } else {
            Alert.showAlert("Informe os campos obrigatórios.")
            return
        }
    }

    onSalvarRegistro = () => {
        const { registro } = this.state;
        let registroGravar = [];
        let idf = registro.pneus_mov_idf;

        if (registro.tipoTela === 'ADDVEIC') {
            idf = registro.pneus_mov_idf_novo;
            
            registroGravar = {
                pneu: registro.pneus_mov_pneu_novo,
                vida: registro.vida,
                data: moment().format("YYYY-MM-DD"),
                filial: registro.pneus_mov_filial,
                veiculo: registro.pneus_mov_veiculo,
                posicao: registro.pneus_mov_posicao,
                eixo: registro.pneus_mov_eixo,
                tipoMov: 28,
                kmIni: registro.pneus_mov_km_ini,
                kmFim: registro.pneus_mov_km_ini,
                kmRodado: 0,
                tipoSuc: null,
                librasNova: 0,
                librasAtual: 0,
                idfOS: null,
                sulco1: registro.sulco1,
                sulco2: registro.sulco2,
                sulco3: registro.sulco3,
                sulco4: registro.sulco4,
                OBSSulc: "ADDVEIC",

                idfNovoPneu: 0,
                veicNovo: "",
                posicaoNovo: "",
                eixoNovo: ""
            }

        } else {

            if (this.state.filialChecked) {

                registroGravar = {
                    pneu: registro.pneus_mov_pneu,
                    vida: registro.vida,
                    data: registro.pneus_mov_data,
                    filial: registro.pneus_mov_filial,
                    veiculo: null,
                    posicao: "EST",
                    eixo: "",
                    tipoMov: registro.pneus_mov_tipo_mov,
                    kmIni: registro.pneus_mov_km_ini,
                    kmFim: registro.tipoTela === 'VEIC' ? registro.pneus_mov_km_fim : registro.pneus_mov_km_ini,
                    kmRodado: 0,
                    tipoSuc: null,
                    librasNova: 0,
                    librasAtual: 0,
                    idfOS: null,
                    sulco1: registro.tipoTela === 'VEIC' ? registro.sulco1 : this.state.pneus_sul_sulco1,
                    sulco2: registro.tipoTela === 'VEIC' ? registro.sulco2 : this.state.pneus_sul_sulco2,
                    sulco3: registro.tipoTela === 'VEIC' ? registro.sulco3 : this.state.pneus_sul_sulco3,
                    sulco4: registro.tipoTela === 'VEIC' ? registro.sulco4 : this.state.pneus_sul_sulco4,
                    OBSSulc: "ESTOQUE",

                    idfNovoPneu: registro.pneus_mov_idf_novo ? registro.pneus_mov_idf_novo : 0,
                    pneuNovo: registro.pneus_mov_pneu_novo ? registro.pneus_mov_pneu_novo : 0,
                    veicNovo: registro.pneus_mov_veiculo ? registro.pneus_mov_veiculo : "",
                    posicaoNovo: registro.pneus_mov_posicao ? registro.pneus_mov_posicao : "",
                    eixoNovo: registro.pneus_mov_eixo ? registro.pneus_mov_eixo : ""
                }

            } else if (this.state.sucataChecked) {

                registroGravar = {
                    pneu: registro.pneus_mov_pneu,
                    vida: registro.vida,
                    data: registro.pneus_mov_data,
                    filial: 0,
                    veiculo: null,
                    posicao: "SUC",
                    eixo: "",
                    tipoMov: 6,
                    kmIni: 0,
                    kmFim: registro.tipoTela === 'VEIC' ? registro.pneus_mov_km_fim : registro.pneus_mov_km_ini,
                    kmRodado: 0,
                    tipoSuc: null,
                    librasNova: 0,
                    librasAtual: 0,
                    idfOS: null,
                    sulco1: registro.tipoTela === 'VEIC' ? registro.sulco1 : this.state.pneus_sul_sulco1,
                    sulco2: registro.tipoTela === 'VEIC' ? registro.sulco2 : this.state.pneus_sul_sulco2,
                    sulco3: registro.tipoTela === 'VEIC' ? registro.sulco3 : this.state.pneus_sul_sulco3,
                    sulco4: registro.tipoTela === 'VEIC' ? registro.sulco4 : this.state.pneus_sul_sulco4,
                    OBSSulc: "SUCATA",

                    idfNovoPneu: registro.pneus_mov_idf_novo ? registro.pneus_mov_idf_novo : 0,
                    pneuNovo: registro.pneus_mov_pneu_novo ? registro.pneus_mov_pneu_novo : 0,
                    veicNovo: registro.pneus_mov_veiculo ? registro.pneus_mov_veiculo : "",
                    posicaoNovo: registro.pneus_mov_posicao ? registro.pneus_mov_posicao : "",
                    eixoNovo: registro.pneus_mov_eixo ? registro.pneus_mov_eixo : ""
                }

            }

        }

        console.log('onSalvarRegistro: ', registroGravar);
        // return;

        if (registroGravar) {
            this.setState({ salvando: true });
            axios.put('/pneus/movimentacao/' + idf, registroGravar)
                .then(response => {
                    this.setState({ salvando: false });

                    if (response.data.msgErro !== '') {
                        Alert.showAlert(response.data.msgErro);
                    } else {
                        this.props.navigation.goBack(null);
                        if (this.props.navigation.state.params.onRefresh) {
                            this.props.navigation.state.params.onRefresh();
                        }
                    }
                }).catch(ex => {
                    this.setState({ salvando: false });
                    console.warn(ex.response);
                    Alert.showAlert(ex.response);
                })
        }
    }

    mudaDestino = (destino) => {
        this.setState({
            filialChecked: destino === 'F' ? true : false,
            recapadoraChecked: destino === 'R' ? true : false,
            sucataChecked: destino === 'S' ? true : false,
        });
    }

    renderLocalizacao = (registro) => {
        if (registro.pneus_mov_posicao === 'EST') {
            return (
                <Text>{'FILIAL: ' + registro.pneus_mov_filial + ' - ' + registro.adm_fil_descricao}</Text>
            )
        } else if (registro.pneus_mov_posicao === 'REC') {
            return (
                <Text>{'REC: ' + registro.adm_pes_nome}</Text>
            )
        } else if (registro.pneus_mov_posicao === 'SUC') {
            return (
                <Text>SUCATEADO</Text>
            )
        } else {
            return (
                <Text>{'VEÍCULO: ' + registro.pneus_mov_veiculo + ' / POS: ' + registro.pneus_mov_posicao}</Text>
            )
        }
    }


    render() {
        const { filialChecked, recapadoraChecked, sucataChecked,
            filialSelect, motivoMovSelect, tipoSucSelect, pneusSelect, posicaoesSelect,
            pneus_sul_sulco1, pneus_sul_sulco2, pneus_sul_sulco3, pneus_sul_sulco4,
            registro, loading } = this.state;
        const { pneus_mov_idf, pneus_mov_pneu, vida, sulco1, sulco2, sulco3, sulco4, pneus_dim_descricao,
            pneus_mov_filial, pneus_mov_tipo_mov, pneus_mov_tipo_sucata, pneus_mov_km_ini, pneus_mov_km_fim,
            pneus_mov_pneu_novo, pneus_mov_posicao, pneu_atual, tipoTela } = this.state.registro;

        console.log('PneusTrocaScreen.this.state.registro', this.state.registro);
        console.log('PneusTrocaScreen.this.state', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    {tipoTela === 'ADDVEIC' ? null : (
                        <View
                            style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16 }}
                        >

                            <View style={{ marginBottom: 10 }}>
                                <Text style={{
                                    color: Colors.primaryLight,
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    borderBottomWidth: 2,
                                    borderColor: Colors.dividerDark,
                                }}>
                                    Dados do Pneu
                                </Text>

                                <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
                                    <View style={{ flex: 2, flexDirection: 'row' }}>
                                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                            Pneu{': '}
                                        </Text>
                                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                            {pneus_mov_pneu}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 2, flexDirection: 'row' }}>
                                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                            Vida{': '}
                                        </Text>
                                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                            {String(vida) === '0' ? 'Novo' : vida + 'ª'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ paddingLeft: 10, marginBottom: 3, fontSize: 13, flexDirection: 'row' }}>
                                    <View style={{ flex: 2, flexDirection: 'row' }}>
                                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                            Sulcagem{': '}
                                        </Text>
                                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                            {pneus_sul_sulco1 + ',' + pneus_sul_sulco2 + ',' + pneus_sul_sulco3 + ',' + pneus_sul_sulco4}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ paddingLeft: 10, marginBottom: 3, fontSize: 13, flexDirection: 'row' }}>
                                    <View style={{ flex: 2, flexDirection: 'row' }}>
                                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                            Dimensão{': '}
                                        </Text>
                                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                            {pneus_dim_descricao}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ paddingLeft: 10, marginBottom: 3, fontSize: 13, flexDirection: 'row' }}>
                                    <View style={{ flex: 2 }}>
                                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                            Localização
                                </Text>
                                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                            {this.renderLocalizacao(registro)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {getTemPermissao('PNEUSTROCASCREEN') && tipoTela !== 'ADDVEIC' ? (
                        <View style={{ flex: 1, paddingHorizontal: 16 }}>
                            <Text style={{
                                color: Colors.primaryLight,
                                fontWeight: 'bold',
                                fontSize: 20,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Destino do Pneu
                            </Text>



                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10 }}>
                                <View style={{ width: "30%", margin: 0, padding: 0 }}>
                                    <CheckBox
                                        center
                                        title='Filial'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={filialChecked}
                                        checkedColor={Colors.primaryLight}
                                        // uncheckedColor='green'
                                        onPress={() => this.setState({
                                            filialChecked: true,
                                            recapadoraChecked: false,
                                            sucataChecked: false,
                                        })}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View>

                                {/* <View style={{ width: "40%", margin: 0, padding: 0 }}>
                                    <CheckBox
                                        center
                                        title='Recapadora'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={recapadoraChecked}
                                        checkedColor={Colors.primaryLight}
                                        onPress={() => this.setState({
                                            filialChecked: false,
                                            recapadoraChecked: true,
                                            sucataChecked: false,
                                        })}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View> */}

                                <View style={{ width: "30%", margin: 0, padding: 0 }}>
                                    <CheckBox
                                        center
                                        title='Sucata'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={sucataChecked}
                                        checkedColor={Colors.primaryLight}
                                        onPress={() => this.setState({
                                            filialChecked: false,
                                            recapadoraChecked: false,
                                            sucataChecked: true,
                                        })}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View>
                            </View>


                            {tipoTela === 'VEIC' ? (
                                <View>
                                    <TextInput
                                        label="Odômetro"
                                        id="pneus_mov_km_fim"
                                        ref="pneus_mov_km_fim"
                                        value={pneus_mov_km_fim}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: "23%", marginRight: 10 }}>
                                            <TextInput
                                                label="Sulco 1"
                                                id="sulco1"
                                                ref="sulco1"
                                                value={sulco1}
                                                maxLength={2}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                                required={true}
                                                errorMessage=""
                                            />
                                        </View>
                                        <View style={{ width: "23%", marginRight: 10 }}>
                                            <TextInput
                                                label="Sulco 2"
                                                id="sulco2"
                                                ref="sulco2"
                                                value={sulco2}
                                                maxLength={2}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                                required={true}
                                                errorMessage=""
                                            />
                                        </View>
                                        <View style={{ width: "23%", marginRight: 10 }}>
                                            <TextInput
                                                label="Sulco 3"
                                                id="sulco3"
                                                ref="sulco3"
                                                value={sulco3}
                                                maxLength={2}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                                required={true}
                                                errorMessage=""
                                            />
                                        </View>
                                        <View style={{ width: "22%" }}>
                                            <TextInput
                                                label="Sulco 4"
                                                id="sulco4"
                                                ref="sulco4"
                                                value={sulco4}
                                                maxLength={2}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                                required={true}
                                                errorMessage=""
                                            />
                                        </View>
                                    </View>
                                </View>
                            ) : null}



                            {filialChecked ? (
                                <View>
                                    <FiliaisSelect
                                        label="Filial"
                                        id="filialSelect"
                                        codFilial={pneus_mov_filial}
                                        onChange={this.onInputChangeFilial}
                                        value={filialSelect}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Motivo Saída"
                                        id="pneus_mov_tipo_mov"
                                        ref="pneus_mov_tipo_mov"
                                        value={pneus_mov_tipo_mov}
                                        selectedValue=""
                                        options={motivoMovSelect}
                                        onChange={this.onInputChange}
                                    />

                                </View>
                            ) : null}

                            {/* {recapadoraChecked ? (
                                <View>
                                    <TextInput
                                        label="Recapadora"
                                        id="pneus_mov_idf"
                                        ref="pneus_mov_idf"
                                        value={pneus_mov_idf}
                                        maxLength={4}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        label="NF Saída"
                                        id="pneus_mov_idf"
                                        ref="pneus_mov_idf"
                                        value={pneus_mov_idf}
                                        maxLength={4}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        label="Motivo Saída"
                                        id="pneus_mov_idf"
                                        ref="pneus_mov_idf"
                                        value={pneus_mov_idf}
                                        maxLength={4}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />
                                </View>
                            ) : null} */}

                            {sucataChecked ? (
                                <View>
                                    <TextInput
                                        type="select"
                                        label="Tipo Sucata"
                                        id="pneus_mov_tipo_sucata"
                                        ref="pneus_mov_tipo_sucata"
                                        value={pneus_mov_tipo_sucata}
                                        selectedValue=""
                                        options={tipoSucSelect}
                                        onChange={this.onInputChange}
                                    />
                                </View>
                            ) : null}


                            {tipoTela === 'VEIC' ? (
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        color: Colors.primaryLight,
                                        fontWeight: 'bold',
                                        fontSize: 20,
                                        marginBottom: 10,
                                        marginTop: 10,
                                        borderBottomWidth: 2,
                                        borderColor: Colors.dividerDark,
                                    }}>
                                        Dados do Pneu à ser Colocado
                                    </Text>

                                    <TextInput
                                        type="select"
                                        label="Pneu Colocado"
                                        id="pneus_mov_pneu_novo"
                                        ref="pneus_mov_pneu_novo"
                                        value={pneus_mov_pneu_novo}
                                        selectedValue=""
                                        options={pneusSelect}
                                        onChange={this.onInputChangePneu}
                                    />

                                </View>
                            ) : null}



                            <Button
                                title="Gravar"
                                loading={this.state.salvando}
                                onPress={this.onOKForm}
                                color={Colors.textOnPrimary}
                                buttonStyle={{ marginBottom: 30, marginTop: 10 }}
                                icon={{
                                    name: 'check',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />

                        </View>
                    ) : null}



                    {tipoTela === 'ADDVEIC' ? (
                        <View style={{ flex: 1, paddingHorizontal: 16 }}>
                            <Text style={{
                                color: Colors.primaryLight,
                                fontWeight: 'bold',
                                fontSize: 20,
                                marginBottom: 10,
                                marginTop: 10,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Pneu à ser Colocado
                            </Text>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: "47%", marginRight: 5 }}>
                                    <TextInput
                                        type="select"
                                        label="Posição do Veículo"
                                        id="pneus_mov_posicao"
                                        ref="pneus_mov_posicao"
                                        value={pneus_mov_posicao}
                                        selectedValue=""
                                        options={posicaoesSelect}
                                        onChange={this.onInputChangePosicao}
                                    />
                                </View>
                                <View style={{ width: "47%" }}>
                                    <TextInput
                                        label="Pneu Atual"
                                        id="pneu_atual"
                                        ref="pneu_atual"
                                        value={pneu_atual}
                                        enabled={false}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: "47%", marginRight: 5 }}>
                                    <TextInput
                                        type="select"
                                        label="Pneu"
                                        id="pneus_mov_pneu_novo"
                                        ref="pneus_mov_pneu_novo"
                                        value={pneus_mov_pneu_novo}
                                        selectedValue=""
                                        options={pneusSelect}
                                        onChange={this.onInputChangePneu}
                                    />
                                </View>
                                <View style={{ width: "47%" }}>
                                    <TextInput
                                        label="Odômetro"
                                        id="pneus_mov_km_ini"
                                        ref="pneus_mov_km_ini"
                                        value={pneus_mov_km_ini}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: "23%", marginRight: 10 }}>
                                    <TextInput
                                        label="Sulco 1"
                                        id="sulco1"
                                        ref="sulco1"
                                        value={sulco1}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                                <View style={{ width: "23%", marginRight: 10 }}>
                                    <TextInput
                                        label="Sulco 2"
                                        id="sulco2"
                                        ref="sulco2"
                                        value={sulco2}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                                <View style={{ width: "23%", marginRight: 10 }}>
                                    <TextInput
                                        label="Sulco 3"
                                        id="sulco3"
                                        ref="sulco3"
                                        value={sulco3}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                                <View style={{ width: "22%" }}>
                                    <TextInput
                                        label="Sulco 4"
                                        id="sulco4"
                                        ref="sulco4"
                                        value={sulco4}
                                        maxLength={2}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                        required={true}
                                        errorMessage=""
                                    />
                                </View>
                            </View>

                            <Button
                                title="Gravar"
                                loading={this.state.salvando}
                                onPress={this.onOKForm}
                                color={Colors.textOnPrimary}
                                buttonStyle={{ marginBottom: 30, marginTop: 10 }}
                                disabled={pneu_atual === '' ? false : true}
                                icon={{
                                    name: 'check',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />
                        </View>
                    ) : null}

                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 6, marginTop: 30 }}>
                        {pneus_mov_idf}
                    </Text>

                    <ProgressDialog
                        visible={this.state.salvando}
                        title="SIGA PRO"
                        message="Aguarde..."
                    />
                </ScrollView>
            </View >
        )
    }
}