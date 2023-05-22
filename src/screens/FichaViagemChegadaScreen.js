import React, { Component } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    FlatList, Modal, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Card, Divider, CheckBox, SearchBar } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import { maskDigitarVlrMoeda, vlrStringParaFloat } from "../utils/Maskers";
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import moment from 'moment';
import Alert from '../components/Alert';
import Icon from '../components/Icon';

import VeiculosSelect from '../components/VeiculosSelect';
import FuncionariosSelect from '../components/FuncionariosSelect';
import HeaderComponent from "../components/HeaderComponent";

const DATE_FORMAT = 'DD/MM/YYYY';

const stateInicial = {
    veiculo_select: null,
    veiculo_select_bald: null,
    funcionario_select: null,

    listaRegistrosFunc: [],
    modalFuncBuscaVisible: false,
    refreshing: false,
    carregarRegistro: false,
    carregando: false,
    carregarMais: false,
    pagina: 1,

    funcionariosSelect: [],
    codFunc: '',
    empFunc: '',
    nomeFunc: '',

    codVeiculo: '',
    codVeiculoBald: '',
    man_fv_odo_ini_bald: 0,
    man_fv_km_ini_bald: 0,


    man_fv_data_ini: moment(new Date()).format(DATE_FORMAT),
    man_fv_odo_ini: 0,
    man_fv_odo_fim: '',
    man_fv_km_ini: 0,
    man_fv_km_fim: 0,
    man_fv_km_viagem: 0,
    man_fv_km_rota: 0,
    man_fv_qtde_comb: '0,00',
    man_fv_qtde_comb_extra: 0,
    man_fv_media: 0,
    man_fv_qtde_arla: '0,00',
    man_fv_media_arla: 0,
    man_fvd_disco: 0,
    man_fvd_servico: 0,
    man_fv_obs: '',
    checkedFinalRota: false,
    checkedGeraOS: false,
    checkedBaldeacao: false,
    defeito_mec_ele_lub: 'Nada Consta',
    defeito_chap_borr: 'Nada Consta',

    checkedLinhasRegulares: true,
    checkedTodosServicos: true,

    man_fvm_data_hora_ini: moment().format('h:mm'),
    man_fvm_data_hora_fim: moment().format('h:mm'),

    pas_serv_codigo: null,
    servicoSelect: [],
    servico: 0,
    servicoExtra: 0,

    msgErroVeiculo: 'Informe o Veículo',
}

const RegistroFunc = ({ registro, onRegistroFuncPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <TouchableOpacity
                onPress={() => onRegistroFuncPress(registro.rh_func_codigo, registro.rh_func_empresa)}
            >
                <View style={{ paddingHorizontal: 16, paddingVertical: 5, flexDirection: 'row' }}>
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 13, flex: 1, marginTop: 5, }}>
                        #{registro.rh_func_codigo} / {registro.rh_func_empresa}
                    </Text>
                </View>

                <Divider />

                <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                        {registro.adm_pes_nome}
                    </Text>
                </View>
            </TouchableOpacity>
        </Card>
    )
}

export default class FichaViagemChegadaScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,
            carregandoFunc: false,
            carregandoServico: false,
            ocorrenciaSelect: [],
            man_fv_ocorrencia: '4',
            ...stateInicial,
        }
    }

    componentDidMount() {
        this.buscaOcorrencias();
        this.buscaServicos(this.state.checkedTodosServicos ? 'T' : 'C');
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeKm = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        const { man_fv_odo_fim, man_fv_qtde_comb, man_fv_qtde_arla } = this.state;
        this.calculoKm(value, man_fv_qtde_comb, man_fv_qtde_arla);
    }

    onInputChangeQtdeComb = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState({
            checkedFinalRota: vlrStringParaFloat(value) ? true : false,
        });
        this.setState(state);

        const { man_fv_odo_fim, man_fv_qtde_comb, man_fv_qtde_arla } = this.state;
        this.calculoKm(man_fv_odo_fim, value, man_fv_qtde_arla);
    }

    onInputChangeQtdeArla = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        const { man_fv_odo_fim, man_fv_qtde_comb, man_fv_qtde_arla } = this.state;
        this.calculoKm(man_fv_odo_fim, man_fv_qtde_comb, value);
    }

    calculoKm = (man_fv_odo_fim, man_fv_qtde_comb, man_fv_qtde_arla) => {
        const { man_fv_odo_ini, veiculo_select, man_fv_qtde_comb_extra } = this.state;

        if (veiculo_select) {
            let kmOdoIni = man_fv_odo_ini ? parseInt(man_fv_odo_ini) : 0;
            let kmOdoFim = man_fv_odo_fim ? parseInt(man_fv_odo_fim) : 0;

            let kmViagem = 0;
            if (kmOdoFim && kmOdoFim > 0) {
                kmViagem = kmOdoFim - kmOdoIni;
                if (kmOdoFim < kmOdoIni) {
                    kmViagem = kmOdoFim + 1000000 - kmOdoIni;
                }
            }

            let kmRota = veiculo_select.KmTotalRota + kmViagem;

            let mediaComb = (0).toFixed(3);
            if ((vlrStringParaFloat(man_fv_qtde_comb)) && (vlrStringParaFloat(man_fv_qtde_comb) > 0)) {
                mediaComb = (parseFloat(kmRota) / (vlrStringParaFloat(man_fv_qtde_comb) + parseFloat(man_fv_qtde_comb_extra))).toFixed(3);
            }

            let mediaArla = 0;
            if ((vlrStringParaFloat(man_fv_qtde_arla)) && (vlrStringParaFloat(man_fv_qtde_arla) > 0)) {
                mediaArla = (parseFloat(kmRota) / vlrStringParaFloat(man_fv_qtde_arla)).toFixed(3);
            }

            let kmFim = veiculo_select.kmAcum + kmViagem;

            this.setState({
                man_fv_km_fim: kmFim,
                man_fv_km_viagem: kmViagem,
                man_fv_km_rota: kmRota,
                man_fv_media: mediaComb,
                man_fv_media_arla: mediaArla,
            });
        }
    }

    onInputChangeServico = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        const index = this.state.servicoSelect.findIndex(registro => registro.key === value);
        if ((value) && (index >= 0)) {
            this.setState({
                servico: this.state.servicoSelect[index].servico ? this.state.servicoSelect[index].servico : 0,
                servicoExtra: this.state.servicoSelect[index].servicoExtra ? this.state.servicoSelect[index].servicoExtra : 0,
            });
        }
    }

    onInputChangeVeiculo = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        if (value) {
            this.buscaFuncionários(value.codFunc);

            this.setState({
                codVeiculo: value.codVeic,
                codFunc: value.codFunc ? value.codFunc : '',
                empFunc: value.empFunc ? value.empFunc : '',
                nomeFunc: value.nomeFunc ? value.nomeFunc : '',
                man_fvm_nome_mot: value.codFunc ? '' : value.nomeFunc,

                pas_serv_codigo: value.man_fvd_servico_extra ? value.man_fvd_servico_extra : value.man_fvd_servico,
                checkedLinhasRegulares: value.man_fvd_servico ? true : false,

                man_fv_odo_ini: value.kmOdo,
                man_fv_km_ini: value.kmAcum,
                man_fv_km_rota: value.KmTotalRota,
                man_fv_qtde_comb_extra: value.combExtraRota.toFixed(2),
                man_fvd_disco: value.man_fvd_disco,
            });

            this.onInputChangeServico('pas_serv_codigo', value.man_fvd_servico_extra ? String(value.man_fvd_servico_extra) : String(value.man_fvd_servico));
        }
    }

    onErroChange = msgErro => {
        this.setState({
            msgErroVeiculo: msgErro
        })
    }

    onInputChangeVeiculoBald = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codVeiculoBald: value.codVeic,
                man_fv_odo_ini_bald: value.kmOdo,
                man_fv_km_ini_bald: value.kmAcum,
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            msgErroVeiculo: msgErro
        })
    }

    onInputChangeFunc = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        clearTimeout(this.buscaRegistrosId);
        this.buscaRegistrosId = setTimeout(() => {
            this.buscaFuncionários(value);
        }, 1000);
    }

    onInputChangeListaFunc = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        if (value) {
            const ind = value.indexOf("_");
            const tam = value.length;
            const codFunc = value.substr(0, ind).trim();
            const empFunc = value.substr(ind + 1, tam).trim();

            this.setState({
                codFunc,
                empFunc,
            });
        }
    }



    onLimparTela = () => {
        this.setState(stateInicial);
    }

    onFormSubmit = (event) => {
        if (this.state.msgErroVeiculo.trim() !== '') {
            Alert.showAlert(this.state.msgErroVeiculo);
            return;
        }

        if ((!this.state.veiculo_select) && (!this.state.veiculo_select.idfViagem)) {
            Alert.showAlert('A Viagem não foi Inicializada');
            return;
        }

        if ((this.state.funcionariosSelect) && (!this.state.empFunc)) {
            if (!this.state.man_fvm_nome_mot) {
                Alert.showAlert("Informe o Motorista");
                return;
            }
        }


        if (this.state.checkedLinhasRegulares) {
            if (!this.state.pas_serv_codigo) {
                Alert.showAlert('Selecione um Serviço');
                return;
            }
        }

        if (!this.state.man_fv_odo_ini) {
            Alert.showAlert('Informe o Odômetro');
            return;
        }

        if (this.state.man_fvd_disco === '') {
            Alert.showAlert('Informe o Disco');
            return;
        }

        if (!this.state.man_fv_ocorrencia) {
            Alert.showAlert('Seleciona uma Ocorrência');
            return;
        }

        if ((this.state.man_fv_km_viagem == '') || (this.state.man_fv_km_viagem <= 0)) {
            Alert.showAlert('Informe o Km da Viagem');
            return;
        }

        if (this.state.man_fv_km_viagem > this.state.veiculo_select.kmDifChegada) {
            Alert.showAlert('O odômetro digitado pode estar incorreto. A Km Percorrida é muita alta. Verifique...');
            return;
        }

        if ((this.state.man_fv_km_rota > 0) && (this.state.man_fv_km_viagem > (this.state.man_fv_km_rota + this.state.veiculo_select.kmDifChegada))) {
            Alert.showAlert('O odômetro digitado pode estar incorreto, verifique...');
            return;
        }

        if (this.state.veiculo_select.protocoloAberto === 0) {
            Alert.showAlert('Protocolo de saída do estoque desta filial não está aberto');
            return;
        }

        if (vlrStringParaFloat(this.state.man_fv_qtde_comb) > 750) {
            Alert.showAlert('Quantidade de combustível maior que o permitido');
            return;
        }

        if ((vlrStringParaFloat(this.state.man_fv_qtde_comb) > 0) && (vlrStringParaFloat(this.state.man_fv_qtde_comb) > this.state.veiculo_select.estoqComb)) {
            Alert.showAlert('Estoque de Combustível insuficiente');
            return;
        }

        if ((vlrStringParaFloat(this.state.man_fv_qtde_arla) > 0) && (vlrStringParaFloat(this.state.man_fv_qtde_arla) > this.state.veiculo_select.estoqArla)) {
            Alert.showAlert('Estoque de Arla insuficiente');
            return;
        }

        if ((this.state.checkedBaldeacao) && (!this.state.veiculo_select_bald) && (!this.state.veiculo_select_bald.codVeic)) {
            Alert.showAlert('Informe o veículo para a baldeação');
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

        const { veiculo_select, funcionario_select, codFunc, empFunc, man_fvm_nome_mot,
            man_fv_odo_fim, man_fv_km_fim, man_fv_km_viagem, man_fv_km_rota, man_fv_qtde_comb,
            man_fv_qtde_comb_extra, man_fv_media, man_fv_qtde_arla, man_fv_media_arla, man_fv_ocorrencia,
            man_fv_obs, man_fvd_disco, servico, servicoExtra, veiculo_select_bald, man_fv_odo_ini_bald, man_fv_km_ini_bald,
            checkedFinalRota, checkedGeraOS, checkedBaldeacao, checkedLinhasRegulares,
            defeito_mec_ele_lub, defeito_chap_borr } = this.state;

        // let codFunc = 0
        // let empFunc = 0
        // if (funcionario_select) {
        //     const ind = funcionario_select.key.indexOf("_");
        //     const tam = funcionario_select.key.length;
        //     codFunc = funcionario_select.key.substr(0, ind).trim();
        //     empFunc = funcionario_select.key.substr(ind + 1, tam).trim();
        // }

        const lista_defeito_mec_ele_lub = defeito_mec_ele_lub.split(".");
        const lista_defeito_chap_borr = defeito_chap_borr.split(".");

        const registro = {
            man_fv_idf: veiculo_select.idfViagem,
            man_fv_veiculo: veiculo_select.codVeic,
            man_fv_rota: 0,
            // checkedLinhasRegulares: checkedLinhasRegulares ? 'N' : 'S',

            man_fvm_motorista: codFunc,
            man_fvm_empresa_mot: empFunc,
            man_fvm_nome_mot: codFunc ? '.' : man_fvm_nome_mot,

            man_fv_odo_fim: man_fv_odo_fim,
            man_fv_km_fim: man_fv_km_fim,
            man_fv_km_viagem: man_fv_km_viagem,
            man_fv_km_rota: man_fv_km_rota,
            man_fv_qtde_comb: vlrStringParaFloat(man_fv_qtde_comb),
            man_fv_qtde_comb_extra: man_fv_qtde_comb_extra,
            man_fv_media: man_fv_media,
            man_fv_qtde_arla: vlrStringParaFloat(man_fv_qtde_arla),
            man_fv_media_arla: man_fv_media_arla,
            man_fv_ocorrencia: man_fv_ocorrencia,
            man_fv_sit_rota: checkedFinalRota ? 'F' : 'A',
            geraOS: checkedGeraOS ? 'S' : 'N',

            man_fvd_disco: man_fvd_disco,
            // pas_serv_codigo: pas_serv_codigo,
            linhaRegular: checkedLinhasRegulares ? 'S' : 'N',
            servico: checkedLinhasRegulares && servico ? servico : 0,
            servicoExtra: checkedLinhasRegulares && servicoExtra ? servicoExtra : 0,

            man_fv_obs: man_fv_obs,
            defeito_mec_ele_lub: defeito_mec_ele_lub,
            defeito_chap_borr: defeito_chap_borr,

            lista_defeito_mec_ele_lub,
            lista_defeito_chap_borr,
        };

        // console.log('onSalvarRegistro CHEGADA: ', registro);

        // return;

        axios.put('/fichaViagem/chegada/' + registro.man_fv_idf, registro)
            .then(response => {

                if (!checkedBaldeacao) {
                    this.setState({
                        loading: false,
                        salvado: false,
                    })
                    Alert.showAlert("Chegada gravada com sucesso.")
                    this.onLimparTela();
                } else {

                    const reg = {
                        man_fv_veiculo: veiculo_select_bald.codVeic,
                        linhaRegular: checkedLinhasRegulares ? 'S' : 'N',
                        servico: checkedLinhasRegulares && servico ? servico : 0,
                        servicoExtra: checkedLinhasRegulares && servicoExtra ? servicoExtra : 0,

                        man_fvm_motorista: codFunc,
                        man_fvm_empresa_mot: empFunc,
                        man_fvm_nome_mot: codFunc ? '.' : man_fvm_nome_mot,

                        man_fv_odo_ini: man_fv_odo_ini_bald,
                        man_fv_km_ini: man_fv_km_ini_bald,
                        man_fv_obs: '',
                        man_fvd_disco: 0,
                        baldeacao: true
                    };

                    // console.log('onSalvarRegistro SAIDA: ', reg);

                    axios.post('/fichaViagem/saida', reg)
                        .then(response => {
                            // console.log('onSalvarRegistro: ', response);
                            this.setState({
                                loading: false,
                                salvado: false,
                            })
                            Alert.showAlert("Baldeação gravada com sucesso.")
                            this.onLimparTela();
                        }).catch(ex => {
                            this.setState({ salvado: false });
                            // console.log('onSalvarRegistro ERRO: ', ex.response);
                            Alert.showAlert(ex.response.data)
                            console.warn(ex);
                            console.warn(ex.response);
                        })

                }
            }).catch(ex => {
                this.setState({ salvado: false });
                console.warn(ex);
                console.warn(ex.response);
            })
    }



    buscaFuncionários = (value) => {
        this.setState({ funcionariosSelect: [], empFunc: '', });
        const { codFunc } = this.state;

        if (value) {
            this.setState({ carregandoFunc: true });
            axios.get('/listaFuncionarios', {
                params: {
                    ativo: 'S',
                    codFunc: value
                }
            }).then(response => {
                const { data } = response;

                if (data) {
                    const funcionariosSelect = data.map(regList => {
                        return {
                            key: regList.rh_func_codigo + '_' + regList.rh_func_empresa,
                            label: regList.adm_pes_nome
                        }
                    });

                    if (data.length > 0) {
                        this.setState({
                            funcionariosSelect,
                            codFunc: data[0].rh_func_codigo,
                            empFunc: data[0].rh_func_empresa,
                            carregandoFunc: false,
                        })
                    } else {
                        this.setState({
                            funcionariosSelect,
                            carregandoFunc: false,
                        })
                    }

                } else {
                    this.setState({
                        funcionariosSelect: [],
                        carregandoFunc: false,
                    })
                }

            }).catch(error => {
                console.warn(error.response);
                this.setState({
                    carregandoFunc: false,
                });
            })
        }
    }

    buscaServicos = (value) => {
        this.setState({ servicoSelect: [], carregandoServico: true });
        const { pas_serv_codigo } = this.state;

        axios.get('/listaServicos', {
            params: {
                viagem: value,
            }
        }).then(response => {
            const { data } = response;
            const servicoSelect = data.map(regList => {
                return {
                    key: regList.pas_via_servico_extra ? regList.pas_via_servico_extra : regList.pas_via_servico,
                    servico: regList.pas_via_servico,
                    servicoExtra: regList.pas_via_servico_extra,
                    label: (regList.pas_via_servico_extra ? regList.pas_via_servico_extra : regList.pas_via_servico) + ' - ' +
                        (regList.pas_via_servico_extra ? regList.pas_ext_horario_extra : (regList.hora_fim ? regList.hora_ini : regList.hora_ini + ' / ' + regList.hora_fim)) + ' - ' +
                        (regList.pas_via_servico_extra ? (regList.desc_sec_ini_extra + ' a ' + regList.desc_sec_fim_extra) : (regList.desc_sec_ini + ' a ' + regList.desc_sec_fim))
                }
            });

            let servico = 0;
            if (data.length > 0) {
                servico = pas_serv_codigo ? String(pas_serv_codigo) : servicoSelect[0].key;
            }

            this.setState({
                servicoSelect,
                pas_serv_codigo: servico,
                carregandoServico: false,
            })

        }).catch(error => {
            console.warn(error.response);
            this.setState({
                carregandoServico: false,
            });
        })
    }

    buscaOcorrencias = () => {
        this.setState({ ocorrenciaSelect: [], man_fv_ocorrencia: '' });

        axios.get('/listaOcorrencias', {
        }).then(response => {

            const { data } = response;
            const ocorrenciaSelect = data.map(regList => {
                return {
                    key: regList.man_oco_codigo,
                    label: regList.man_oco_descricao
                }
            });

            let man_fv_ocorrencia = '1';
            this.setState({
                ocorrenciaSelect,
                man_fv_ocorrencia,
            })

        }).catch(error => {
            console.warn(error.response);
        })

    }






    // ---------------------------------------------------------------------------
    // MODAL PARA SELECIONAR FUNCIONARIO
    // ---------------------------------------------------------------------------

    onAbrirFuncBuscaModal = (visible) => {
        this.setState({ modalFuncBuscaVisible: visible });
        if (visible) {
            this.getListaRegistrosFunc();
        } else {
            this.setState({
                buscaNome: '',
                refreshing: false,
                carregarRegistro: false,
                carregando: false,
                carregarMais: false,
                pagina: 1,
            });
        }
    }

    getListaRegistrosFunc = () => {
        const { buscaNome, pagina, listaRegistrosFunc } = this.state;
        this.setState({ carregando: true });

        axios.get('/listaFuncionariosBusca', {
            params: {
                page: pagina,
                limite: 10,
                nome: buscaNome,
            }
        }).then(response => {
            const novosRegistros = pagina === 1
                ? response.data.data
                : listaRegistrosFunc.concat(response.data.data);
            const total = response.data.total;
            this.setState({
                listaRegistrosFunc: novosRegistros,
                refreshing: false,
                carregando: false,
                carregarMais: novosRegistros.length < total
            })
        }).catch(ex => {
            console.warn(ex);
            console.warn(ex.response);
            this.setState({
                refreshing: false,
                carregando: false,
            });
        })
    }

    onBuscaNomeChange = (text) => {
        clearTimeout(this.buscaTimeout);
        this.termoBusca = text;
        this.setState({
            pagina: 1,
            buscaNome: text,
            refreshing: true,
        })
        this.buscaTimeout = setTimeout(() => {
            this.getListaRegistrosFunc();
        }, 1000);
    }

    onRefreshFunc = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistrosFunc);
    }

    onRegistroFuncPress = (rh_func_codigo, rh_func_empresa) => {
        this.setState({
            codFunc: rh_func_codigo,
            empFunc: rh_func_empresa,
        });
        this.onAbrirFuncBuscaModal(false);
        this.buscaFuncionários(rh_func_codigo);
    }

    carregarMaisRegistrosFunc = () => {
        const { carregarMais, refreshing, carregando, pagina } = this.state;
        if (carregarMais && !refreshing && !carregando) {
            this.setState({
                carregando: true,
                pagina: pagina + 1,
            }, this.getListaRegistrosFunc);
        }
    }


    renderListFooter = () => {
        const { carregando } = this.state;
        if (carregando) {
            return (
                <View style={{ marginTop: 8 }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }
        return null;
    }

    renderItemFunc = ({ item, index }) => {
        return (
            <RegistroFunc
                registro={item}
                onRegistroFuncPress={this.onRegistroFuncPress}
            />
        )
    }





    render() {
        const { man_fv_data_ini, codVeiculo, codFunc, nomeFunc, man_fv_odo_ini, man_fv_obs, pas_serv_codigo, man_fvd_disco,
            man_fv_odo_fim, man_fv_km_viagem, man_fv_km_rota, man_fv_qtde_comb, man_fv_media,
            man_fv_qtde_comb_extra, man_fv_qtde_arla, man_fv_media_arla, man_fv_ocorrencia,
            ocorrenciaSelect, man_fv_sit_rota, geraOS, defeito_mec_ele_lub, defeito_chap_borr,
            man_fvm_data_hora_ini, man_fvm_data_hora_fim, servicoSelect, veiculo_select,
            funcionariosSelect, man_fvm_nome_mot, baldeacao, veiculo_select_bald, codVeiculoBald,
            carregandoFunc, carregandoServico, loading, salvado,
            checkedFinalRota, checkedGeraOS, checkedBaldeacao, checkedLinhasRegulares, checkedTodosServicos,
            refreshing, listaRegistrosFunc,
        } = this.state;


        // console.log('this.state: ', this.state)

        return (
            <View style={{ flex: 1, }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >
                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 10 }}
                    >

                        <TextInput
                            label="Data da Chegada"
                            id="man_fv_data_ini"
                            ref="man_fv_data_ini"
                            value={man_fv_data_ini}
                            maxLength={60}
                            onChange={this.onInputChange}
                            enabled={false}
                            style={{ fontSize: 18 }}
                        />

                        <VeiculosSelect
                            label="Veículo"
                            id="veiculo_select"
                            value={veiculo_select}
                            codVeiculo={codVeiculo}
                            onChange={this.onInputChangeVeiculo}
                            onErro={this.onErroChange}
                            tipo="fichaChegada"
                        />

                        <View style={{ flexDirection: 'row' }} >
                            <View style={{ width: "25%" }}>
                                <TextInput
                                    label="Motorista"
                                    id="codFunc"
                                    ref="codFunc"
                                    value={codFunc}
                                    maxLength={6}
                                    keyboardType="numeric"
                                    onChange={this.onInputChangeFunc}
                                />
                            </View>

                            <View style={{ width: "7%", }}>
                                <Button
                                    title=""
                                    loading={loading}
                                    onPress={() => { this.onAbrirFuncBuscaModal(true) }}
                                    buttonStyle={{ width: 30, padding: 0, paddingTop: 20, marginLeft: -18 }}
                                    backgroundColor={Colors.transparent}
                                    icon={{
                                        name: 'search',
                                        type: 'font-awesome',
                                        color: Colors.textPrimaryDark
                                    }}
                                />
                            </View>

                            <View style={{ width: "75%", marginLeft: -23 }}>
                                {carregandoFunc
                                    ? (
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            <ActivityIndicator style={{ margin: 10 }} />
                                            <Text> Buscando... </Text>
                                        </View>
                                    ) : (
                                        <TextInput
                                            type="select"
                                            label=" "
                                            id="nomeFunc"
                                            ref="nomeFunc"
                                            value={nomeFunc}
                                            selectedValue=""
                                            options={funcionariosSelect}
                                            onChange={this.onInputChangeListaFunc}
                                        />
                                    )
                                }

                            </View>
                        </View >

                        <TextInput
                            label="Motorista Free-Lance"
                            id="man_fvm_nome_mot"
                            ref="man_fvm_nome_mot"
                            value={man_fvm_nome_mot}
                            maxLength={60}
                            onChange={this.onInputChange}
                        />




                        <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10 }}>
                            <View style={{ width: "50%", margin: 0, padding: 0 }}>
                                <CheckBox
                                    title='Linhas regulares'
                                    checked={checkedLinhasRegulares}
                                    onPress={() => this.setState({ checkedLinhasRegulares: !checkedLinhasRegulares })}
                                    containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                />
                            </View>

                            {checkedLinhasRegulares ? (
                                <View style={{ width: "50%", margin: 0, padding: 0 }}>
                                    <CheckBox
                                        title='Todos Serviços'
                                        checked={checkedTodosServicos}
                                        onPress={() =>
                                            this.setState({
                                                checkedTodosServicos: !checkedTodosServicos
                                            }, this.buscaServicos(checkedTodosServicos ? 'C' : 'T'))
                                        }
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View>
                            ) : null}
                        </View>

                        {checkedLinhasRegulares ? (
                            <View>
                                {carregandoServico
                                    ? (
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            <ActivityIndicator
                                                style={{
                                                    margin: 10,
                                                }}
                                            />
                                            <Text>
                                                Buscando Serviços
                                            </Text>
                                        </View>
                                    )
                                    : (
                                        <TextInput
                                            type="select"
                                            label="Serviço"
                                            id="pas_serv_codigo"
                                            ref="pas_serv_codigo"
                                            value={pas_serv_codigo}
                                            options={servicoSelect}
                                            onChange={this.onInputChangeServico}
                                        />
                                    )
                                }
                            </View>
                        ) : null}






                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    type="time"
                                    label="Hora Início Tacóg."
                                    id="man_fvm_data_hora_ini"
                                    ref="man_fvm_data_hora_ini"
                                    value={man_fvm_data_hora_ini || new Date()}
                                    dateFormat="HH:mm"
                                    onChange={this.onInputChange}
                                    validator={data => moment(data, "H:mm", true).isValid()}
                                    required={true}
                                    errorMessage="Formato correto HH:MM"
                                />
                            </View>

                            <View style={{ width: "47%" }}>
                                <TextInput
                                    type="time"
                                    label="Hora Fim Tacóg."
                                    id="man_fvm_data_hora_fim"
                                    ref="man_fvm_data_hora_fim"
                                    value={man_fvm_data_hora_fim || new Date()}
                                    dateFormat="H:mm"
                                    onChange={this.onInputChange}
                                    validator={data => moment(data, "H:mm", true).isValid()}
                                    required={true}
                                    errorMessage="Formato correto HH:MM"
                                />
                            </View>
                        </View>

                        <TextInput
                            pickerItemsFefault={4}
                            type="select"
                            label="Ocorrência da Viagem"
                            id="man_fv_ocorrencia"
                            ref="man_fv_ocorrencia"
                            value={man_fv_ocorrencia}
                            options={ocorrenciaSelect}
                            onChange={this.onInputChange}
                            required={true}
                            errorMessage="Selecione uma Ocorrência"
                        />

                        <TextInput
                            label="Observação"
                            id="man_fv_obs"
                            ref="man_fv_obs"
                            value={man_fv_obs}
                            maxLength={100}
                            onChange={this.onInputChange}
                            multiline={true}
                        />



                        <Divider style={{ marginTop: 25 }} />
                        <Divider />
                        <Divider />
                        <Divider style={{ marginBottom: 40 }} />



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
                                    label="Odôm. Chegada"
                                    id="man_fv_odo_fim"
                                    ref="man_fv_odo_fim"
                                    value={man_fv_odo_fim}
                                    onChange={this.onInputChangeKm}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Km Viagem"
                                    id="man_fv_km_viagem"
                                    ref="man_fv_km_viagem"
                                    value={man_fv_km_viagem}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>

                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Km Rota"
                                    id="man_fv_km_rota"
                                    ref="man_fv_km_rota"
                                    value={man_fv_km_rota}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Qtde Arla"
                                    id="man_fv_qtde_arla"
                                    ref="man_fv_qtde_arla"
                                    value={String(man_fv_qtde_arla)}
                                    maxLength={10}
                                    keyboardType="numeric"
                                    masker={maskDigitarVlrMoeda}
                                    onChange={this.onInputChangeQtdeArla}
                                />
                            </View>

                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Média Arla Km/Lts"
                                    id="man_fv_media_arla"
                                    ref="man_fv_media_arla"
                                    value={man_fv_media_arla}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
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

                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Qtde Comb. Extra"
                                    id="man_fv_qtde_comb_extra"
                                    ref="man_fv_qtde_comb_extra"
                                    value={man_fv_qtde_comb_extra}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Qtde Combustível"
                                    id="man_fv_qtde_comb"
                                    ref="man_fv_qtde_comb"
                                    value={String(man_fv_qtde_comb)}
                                    maxLength={10}
                                    keyboardType="numeric"
                                    masker={maskDigitarVlrMoeda}
                                    onChange={this.onInputChangeQtdeComb}
                                />
                            </View>

                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Média Comb. Km/Lts"
                                    id="man_fv_media"
                                    ref="man_fv_media"
                                    value={man_fv_media}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>


                        <Divider style={{ marginTop: 10 }} />
                        <Divider />
                        <Divider />
                        <Divider style={{ marginBottom: 30 }} />


                        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                            <View style={{ width: "50%", margin: 0, padding: 0 }}>
                                <CheckBox
                                    title='Tanque cheio?'
                                    key={man_fv_sit_rota}
                                    checked={checkedFinalRota}
                                    onPress={() => this.setState({ checkedFinalRota: !checkedFinalRota })}
                                    containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    disabled={vlrStringParaFloat(man_fv_qtde_comb) === 0 ? true : false}
                                />
                            </View>

                            <View style={{ width: "50%", margin: 0, padding: 0 }}>
                                <CheckBox
                                    title='Gerar O.S.'
                                    key={geraOS}
                                    checked={checkedGeraOS}
                                    onPress={() => this.setState({ checkedGeraOS: !checkedGeraOS })}
                                    containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                />
                            </View>
                        </View>


                        {checkedGeraOS
                            ? (
                                <View>
                                    <TextInput
                                        label="Defeitos (Mecânica/Elétrica/Lubrificação)"
                                        id="defeito_mec_ele_lub"
                                        ref="defeito_mec_ele_lub"
                                        value={defeito_mec_ele_lub}
                                        onChange={this.onInputChange}
                                        multiline={true}
                                        style={{
                                            height: 70
                                        }}
                                    />

                                    <TextInput
                                        label="Defeitos (Chapeação/Borracharia)"
                                        id="defeito_chap_borr"
                                        ref="defeito_chap_borr"
                                        value={defeito_chap_borr}
                                        onChange={this.onInputChange}
                                        multiline={true}
                                        style={{
                                            height: 70
                                        }}
                                    />

                                </View>
                            ) : null
                        }



                        <CheckBox
                            title='Baldeação do Veículo'
                            key={baldeacao}
                            checked={checkedBaldeacao}
                            onPress={() => this.setState({ checkedBaldeacao: !checkedBaldeacao })}
                            containerStyle={{ padding: 0, margin: 0, marginBottom: 15, backgroundColor: 'transparent' }}
                        />

                        {checkedBaldeacao ? (
                            <VeiculosSelect
                                label="Veículo"
                                id="veiculo_select_bald"
                                value={veiculo_select_bald}
                                codVeiculo={codVeiculoBald}
                                onChange={this.onInputChangeVeiculoBald}
                                onErro={this.onErroChangeBald}
                                tipo="fichaSaida"
                            />
                        ) : null}

                    </View>




                    {/* -------------------------------- */}
                    {/* MODAL PARA BUSCA DO FUNCIONÁRIOS */}
                    {/* -------------------------------- */}
                    <Modal
                        transparent={false}
                        visible={this.state.modalFuncBuscaVisible}
                        animationType={"slide"}
                    >

                        <SafeAreaView style={{ backgroundColor: Colors.primary, flex: 1 }}>

                            <HeaderComponent
                                color={'white'}
                                titleCenterComponent={'Buscar Motorista'}
                                pressLeftComponen={() => this.onAbrirFuncBuscaModal(!this.state.modalFuncBuscaVisible)}
                                iconLeftComponen={'chevron-left'}
                            />


                            <SearchBar
                                placeholder="Busca por Nome"
                                lightTheme={true}
                                onChangeText={this.onBuscaNomeChange}
                                inputStyle={{ backgroundColor: 'white' }}
                                containerStyle={{ backgroundColor: Colors.primaryLight }}
                                clearIcon={true}
                            />

                            <View style={{
                                flex: 1,
                                backgroundColor: Colors.background,
                            }}>

                                <ScrollView
                                    style={{ flex: 1, }}
                                    keyboardShouldPersistTaps="always"
                                >
                                    <View style={{ marginTop: 4 }}>
                                        <FlatList
                                            data={listaRegistrosFunc}
                                            renderItem={this.renderItemFunc}
                                            contentContainerStyle={{ paddingBottom: 100 }}
                                            keyExtractor={registro => String(registro.rh_func_codigo) + String(registro.rh_func_empresa)}
                                            onRefresh={this.onRefreshFunc}
                                            refreshing={refreshing}
                                            onEndReached={this.carregarMaisRegistrosFunc}
                                            ListFooterComponent={this.renderListFooter}
                                        />
                                    </View>
                                </ScrollView>
                            </View>
                        </SafeAreaView>
                    </Modal>




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
                    icon={{
                        name: 'check',
                        type: 'font-awesome',
                        color: Colors.textOnPrimary
                    }}
                />

                <Button
                    title="LIMPAR TELA"
                    onPress={this.onLimparTela}
                    color={Colors.textOnPrimary}
                    backgroundColor='#ccc'
                    buttonStyle={{ margin: 5, marginTop: 0 }}
                    icon={{
                        name: 'close',
                        type: 'font-awesome',
                        color: Colors.textOnPrimary
                    }}
                />


            </View>
        )
    }
}
