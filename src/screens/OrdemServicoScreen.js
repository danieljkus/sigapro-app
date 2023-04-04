import React, { Component } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    FlatList, Modal, TouchableOpacity, SafeAreaView
} from 'react-native';
import { CheckBox, Divider, SearchBar } from 'react-native-elements';
import axios from 'axios';
import StatusBar from '../components/StatusBar';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import Icon from '../components/Icon';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import moment from 'moment';
import { maskDate, maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';
import { getFilial } from '../utils/LoginManager';
import FiliaisSelect from '../components/FiliaisSelect';
import VeiculosSelect from '../components/VeiculosSelect';
import RotasSelect from '../components/RotasSelect';
import HeaderComponent from "../components/HeaderComponent";

const DATE_FORMAT = 'DD/MM/YYYY';

export const OPCOES_COMBO_GRUPO = [
    { key: '00010001', label: 'MECÂNICA - ELETÉTRICA - LUBRIF.' },
    { key: '00010002', label: 'CHAPEAÇÃO - BORRACHARIA' },
]

const RegistroFunc = ({ registro, onRegistroFuncPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
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


export default class OrdemServicoScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvado: false,

            man_os_idf: props.navigation.state.params.registro.man_os_idf ? props.navigation.state.params.registro.man_os_idf : 0,
            man_osm_controle: props.navigation.state.params.registro.man_osm_controle ? props.navigation.state.params.registro.man_osm_controle : 0,
            man_os_data_inicial: props.navigation.state.params.registro.man_os_data_inicial ? moment(props.navigation.state.params.registro.man_os_data_inicial).format(DATE_FORMAT) : moment(new Date()).format(DATE_FORMAT),
            man_os_data_fim: props.navigation.state.params.registro.man_os_data_fim ? moment(props.navigation.state.params.registro.man_os_data_fim).format(DATE_FORMAT) : '',
            man_os_data_prevista: props.navigation.state.params.registro.man_os_data_prevista ? moment(props.navigation.state.params.registro.man_os_data_prevista).format(DATE_FORMAT) : moment(new Date()).format(DATE_FORMAT),

            man_os_filial: props.navigation.state.params.registro.man_os_filial ? props.navigation.state.params.registro.man_os_filial : '',
            man_os_situacao: props.navigation.state.params.registro.man_os_situacao ? props.navigation.state.params.registro.man_os_situacao : 'A',
            man_os_situacao_descr: props.navigation.state.params.registro.man_os_situacao_descr ? props.navigation.state.params.registro.man_os_situacao_descr : 'ABERTA',
            man_os_valor: props.navigation.state.params.registro.man_os_valor ? props.navigation.state.params.registro.man_os_valor : 0,
            man_osm_km_acumulado: props.navigation.state.params.registro.man_osm_km_acumulado ? props.navigation.state.params.registro.man_osm_km_acumulado : 0,
            man_osm_km_odometro: props.navigation.state.params.registro.man_osm_km_odometro ? props.navigation.state.params.registro.man_osm_km_odometro : 0,

            man_osm_veiculo: props.navigation.state.params.registro.man_osm_veiculo ? props.navigation.state.params.registro.man_osm_veiculo : '',
            man_osm_motorista: props.navigation.state.params.registro.man_osm_motorista ? props.navigation.state.params.registro.man_osm_motorista : '',
            man_osm_nome_motorista: props.navigation.state.params.registro.man_osm_nome_motorista ? props.navigation.state.params.registro.man_osm_nome_motorista : '',
            man_osm_oficina: props.navigation.state.params.registro.man_osm_oficina ? props.navigation.state.params.registro.man_osm_oficina : '',
            man_osm_rota: props.navigation.state.params.registro.man_osm_rota ? props.navigation.state.params.registro.man_osm_rota : '',

            man_grupo_servico: '00010001',

            filial_select: null,
            codFilial: '',

            veiculo_select: null,
            codVeiculo: '',

            funcionariosSelect: [],
            codFunc: '',
            empFunc: '',
            nomeFunc: '',
            carregandoFunc: false,
            modalFuncBuscaVisible: false,

            rota_select: null,
            codRota: '',

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
                codFilial: this.props.navigation.state.params.registro.man_os_filial ? this.props.navigation.state.params.registro.man_os_filial : filial,

                codVeiculo: this.props.navigation.state.params.registro.man_osm_veiculo ? this.props.navigation.state.params.registro.man_osm_veiculo : '',

                codFunc: this.props.navigation.state.params.registro.man_osm_motorista ? this.props.navigation.state.params.registro.man_osm_motorista : '',
                empFunc: this.props.navigation.state.params.registro.man_osm_empresa_motorista ? this.props.navigation.state.params.registro.man_osm_empresa_motorista : '',
                nomeFunc: this.props.navigation.state.params.registro.nome_motorista ? this.props.navigation.state.params.registro.nome_motorista : '',

                codRota: this.props.navigation.state.params.registro.man_osm_rota ? this.props.navigation.state.params.registro.man_osm_rota : '',
            });

            if (this.props.navigation.state.params.registro.man_osm_motorista) {
                this.buscaFuncionários(this.props.navigation.state.params.registro.man_osm_motorista);
            }
        })
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
                codFilial: value.adm_fil_codigo,
                descr_destino: value.adm_fil_descricao,
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
                man_osm_km_odometro: value.kmOdo,
                man_osm_km_acumulado: value.kmAcum,
            });
        }
    }

    onInputChangeRota = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codRota: value.man_rt_codigo,
                man_rt_flag_eventual: value.man_rt_flag_eventual,
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

        if ((!this?.state?.filial_select) || (!this?.state?.filial_select?.adm_fil_codigo)) {
            Alert.showAlert('Informe uma Filial');
            return;
        }

        if ((this?.state?.veiculo_select === undefined) || (!this?.state?.veiculo_select) || (!this?.state?.veiculo_select?.codVeic)) {
            Alert.showAlert('Informe o Veículo');
            return;
        }

        if (this?.state?.msgErroVeiculo?.trim() !== '') {
            Alert.showAlert(this?.state?.msgErroVeiculo);
            return;
        }


        this.onSalvarRegistro();
    };

    onSalvarRegistro = () => {
        const { man_os_idf, man_os_valor, man_os_data_prevista, man_osm_km_acumulado, man_osm_oficina,
            codFunc, empFunc, man_osm_nome_motorista,
            filial_select, veiculo_select, rota_select, funcionariosSelect } = this.state;

        const registro = {
            man_os_idf,
            man_os_filial: filial_select.adm_fil_codigo,
            man_osm_veiculo: veiculo_select.codVeic,
            man_os_data_prevista: moment(man_os_data_prevista, DATE_FORMAT).format("YYYY-MM-DD HH:mm"),
            man_os_valor: vlrStringParaFloat(man_os_valor),
            man_osm_km_acumulado: parseInt(man_osm_km_acumulado),
            man_osm_km_odometro: parseInt(man_osm_km_acumulado),

            man_osm_motorista: codFunc,
            man_osm_empresa_motorista: empFunc,
            man_osm_nome_motorista: codFunc ? '.' : man_osm_nome_motorista,

            man_osm_rota: rota_select && rota_select.man_rt_codigo ? rota_select.man_rt_codigo : '',
            man_osm_oficina: null,
        };

        // console.log('onSalvarRegistro: ', registro);
        // return;

        this.setState({ salvado: true });

        let axiosMethod;
        if (man_os_idf) {
            axiosMethod = axios.put('/ordemServicos/update/' + man_os_idf, registro);
        } else {
            axiosMethod = axios.post('/ordemServicos/store', registro);
        }
        axiosMethod.then(response => {
            if (man_os_idf) {
                this.setState({ salvado: false });
                this.props.navigation.goBack(null);
                if (this.props.navigation.state.params.onRefresh) {
                    this.props.navigation.state.params.onRefresh();
                }
            } else {
                this.setState({
                    man_os_idf: response.data.idf,
                    man_osm_controle: response.data.controle,
                    salvado: false
                });
                Alert.showAlert('O.S Gravada com sucesso');
            }
        }).catch(ex => {
            this.setState({ salvado: false });
            console.warn(ex);
        })
    }


    // ---------------------------------------------------------------------------
    // FUNÇÕES PARA FUNCIONARIOS
    // ---------------------------------------------------------------------------

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
                            man_osm_nome_motorista: data[0].adm_pes_nome,
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

    onRegistroFuncPress = (rh_func_codigo, rh_func_empresa) => {
        this.setState({
            codFunc: rh_func_codigo,
            empFunc: rh_func_empresa,
        });
        this.onAbrirFuncBuscaModal(false);
        this.buscaFuncionários(rh_func_codigo);
    }

    onAbrirFuncBuscaModal = (visible) => {
        if (visible) {
            this.setState({modalFuncBuscaVisible: visible});
        } else {
            this.setState({
                buscaNome: '',
                refreshing: false,
                carregarRegistro: false,
                carregando: false,
                carregarMais: false,
                pagina: 1,
                modalFuncBuscaVisible: visible
            });
        }
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




    onAbrirCorretivas = () => {
        this.props.navigation.navigate('OrdemServicoCorretivoScreen', {
            man_os_idf: this.state.man_os_idf,
            man_grupo_servico: this.state.man_grupo_servico,
            man_os_situacao: this.state.man_os_situacao,
        });
    }

    onAbrirPreventivas = () => {
        this.props.navigation.navigate('OrdemServicoPreventivoScreen', {
            man_os_idf: this.state.man_os_idf,
            man_grupo_servico: this.state.man_grupo_servico,
            man_osm_veiculo: this.state.man_osm_veiculo,
            man_os_situacao: this.state.man_os_situacao,
        });
    }

    onAbrirPecas = () => {
        this.props.navigation.navigate('OrdemServicoPecasScreen', {
            man_os_idf: this.state.man_os_idf,
            man_os_situacao: this.state.man_os_situacao,
        });
    }

    onAbrirResponsaveis = () => {
        this.props.navigation.navigate('OrdemServicoResponsaveisScreen', {
            man_os_idf: this.state.man_os_idf,
            man_grupo_servico: this.state.man_grupo_servico,
            man_os_situacao: this.state.man_os_situacao,
        });
    }

    onAbrirDefeitos = () => {
        this.props.navigation.navigate('OrdemServicoDefeitosConstScreen', {
            man_os_idf: this.state.man_os_idf,
            man_grupo_servico: this.state.man_grupo_servico,
            man_os_situacao: this.state.man_os_situacao,
        });
    }

    onAbrirPendencias = () => {
        this.props.navigation.navigate('OrdemServicoServPendenteScreen', {
            man_os_idf: this.state.man_os_idf,
            man_grupo_servico: this.state.man_grupo_servico,
            man_osm_veiculo: this.state.man_osm_veiculo,
            man_os_situacao: this.state.man_os_situacao,
        });
    }






    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------




    render() {
        const { man_os_idf, man_os_data_inicial, man_os_data_fim, man_os_filial, man_os_situacao, man_os_situacao_descr, man_os_valor, man_os_data_prevista,
            man_osm_controle, man_osm_veiculo, man_osm_motorista, man_osm_empresa_motorista, man_osm_km_acumulado, man_osm_km_odometro,
            man_osm_oficina, man_osm_rota, man_grupo_servico,
            filial_select, codFilial, veiculo_select, codVeiculo, rota_select, codRota,
            funcionariosSelect, codFunc, nomeFunc, listaRegistrosFunc, carregandoFunc,
            usuario, carregarRegistro, loading, refreshing, salvado } = this.state;

        // console.log('OrdemServicoScreen - STATE: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Ordem Serviço'}
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
                                    id="man_osm_controle"
                                    ref="man_osm_controle"
                                    value={String(man_osm_controle)}
                                    onChange={this.onInputChange}
                                    maxLength={6}
                                    keyboardType="numeric"
                                    enabled={false}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Situação"
                                    id="man_os_situacao_descr"
                                    ref="man_os_situacao_descr"
                                    value={String(man_os_situacao_descr)}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>


                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Emissão"
                                    id="man_os_data_inicial"
                                    ref="man_os_data_inicial"
                                    value={String(man_os_data_inicial)}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Encerramento"
                                    id="man_os_data_fim"
                                    ref="man_os_data_fim"
                                    value={String(man_os_data_fim)}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    type="date"
                                    label="Previsão"
                                    id="man_os_data_prevista"
                                    ref="man_os_data_prevista"
                                    value={man_os_data_prevista}
                                    masker={maskDate}
                                    dateFormat={DATE_FORMAT}
                                    onChange={this.onInputChange}
                                    validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                    editable={man_os_situacao === 'F' ? false : true}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Valor"
                                    id="man_os_valor"
                                    ref="man_os_valor"
                                    value={maskValorMoeda(man_os_valor)}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                        </View>


                        <FiliaisSelect
                            label="Filial"
                            id="filial_select"
                            codFilial={codFilial}
                            onChange={this.onInputChangeFilial}
                            value={filial_select}
                            enabled={!man_os_idf}
                        />

                        <VeiculosSelect
                            label="Veículo"
                            id="veiculo_select"
                            value={veiculo_select}
                            codVeiculo={codVeiculo}
                            onChange={this.onInputChangeVeiculo}
                            onErro={this.onErroChange}
                            tipo=""
                            enabled={!man_os_idf}
                        />

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Km"
                                    id="man_osm_km_acumulado"
                                    ref="man_osm_km_acumulado"
                                    value={man_osm_km_acumulado}
                                    onChange={this.onInputChange}
                                    enabled={false}
                                />
                            </View>
                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Odômetro"
                                    id="man_osm_km_odometro"
                                    ref="man_osm_km_odometro"
                                    value={man_osm_km_odometro}
                                    onChange={this.onInputChangeKm}
                                    keyboardType="numeric"
                                    enabled={false}
                                />
                            </View>
                        </View>

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

                        <RotasSelect
                            label="Rota"
                            id="rota_select"
                            value={rota_select}
                            codRota={codRota}
                            onChange={this.onInputChangeRota}
                        />

                        <Divider style={{ backgroundColor: Colors.dividerDark }} />

                        {man_os_idf ? (
                            <View >
                                <View style={{ marginTop: 20 }} >
                                    <TextInput
                                        type="select"
                                        label="Grupo"
                                        id="man_grupo_servico"
                                        ref="man_grupo_servico"
                                        value={man_grupo_servico}
                                        options={OPCOES_COMBO_GRUPO}
                                        onChange={this.onInputChange}
                                    />
                                </View>

                                <Divider style={{ backgroundColor: Colors.dividerDark }} />

                                <View style={{ flexDirection: 'row', justifyContent: "center", marginBottom: 4, marginTop: 20 }} >
                                    <View style={{ flex: 2, marginRight: 2 }}>
                                        <Button
                                            title="PREVENTIVAS"
                                            onPress={() => { this.onAbrirPreventivas() }}
                                            buttonStyle={{ height: 70 }}
                                            backgroundColor={Colors.primaryLight}
                                            textStyle={{
                                                fontWeight: 'bold',
                                                fontSize: 15
                                            }}
                                            icon={{
                                                name: 'stethoscope',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 2, marginLeft: 2 }}>
                                        <Button
                                            title="CORRETIVAS"
                                            onPress={() => { this.onAbrirCorretivas() }}
                                            buttonStyle={{ height: 70 }}
                                            backgroundColor={Colors.primaryLight}
                                            textStyle={{
                                                fontWeight: 'bold',
                                                fontSize: 15
                                            }}
                                            icon={{
                                                name: 'wrench',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: "center", marginBottom: 4 }} >
                                    <View style={{ flex: 2, marginRight: 2 }}>
                                        <Button
                                            title="PEÇAS"
                                            onPress={() => { this.onAbrirPecas() }}
                                            buttonStyle={{ height: 70 }}
                                            backgroundColor={Colors.primaryLight}
                                            textStyle={{
                                                fontWeight: 'bold',
                                                fontSize: 15
                                            }}
                                            icon={{
                                                name: 'th',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 2, marginLeft: 2 }}>
                                        <Button
                                            title="RESPONSÁVEIS"
                                            onPress={() => { this.onAbrirResponsaveis() }}
                                            buttonStyle={{ height: 70 }}
                                            backgroundColor={Colors.primaryLight}
                                            textStyle={{
                                                fontWeight: 'bold',
                                                fontSize: 15
                                            }}
                                            icon={{
                                                name: 'user-o',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: "center", marginBottom: 20 }} >
                                    <View style={{ flex: 2, marginRight: 2 }}>
                                        <Button
                                            title="DEFEITOS"
                                            onPress={() => { this.onAbrirDefeitos() }}
                                            buttonStyle={{ height: 70 }}
                                            backgroundColor={Colors.primaryLight}
                                            textStyle={{
                                                fontWeight: 'bold',
                                                fontSize: 15
                                            }}
                                            icon={{
                                                name: 'bug',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 2, marginLeft: 2 }}>
                                        <Button
                                            title="SERV. PEND."
                                            onPress={() => { this.onAbrirPendencias() }}
                                            buttonStyle={{ height: 70 }}
                                            backgroundColor={Colors.primaryLight}
                                            textStyle={{
                                                fontWeight: 'bold',
                                                fontSize: 15
                                            }}
                                            icon={{
                                                name: 'clock-o',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>
                                </View>


                            </View>
                        ) : null}


                        {this.state.man_os_situacao === 'A' ? (
                            <View style={{ flex: 1, marginTop: 10, marginBottom: 20 }}>
                                <Button
                                    title="SALVAR O.S"
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
                        ) : null}


                    </View>



                    {/* -------------------------------- */}
                    {/* MODAL PARA BUSCA DO FUNCIONÁRIOS */}
                    {/* -------------------------------- */}
                    <Modal
                        transparent={false}
                        visible={this.state.modalFuncBuscaVisible}
                        onRequestClose={() => {
                            console.log("Modal FUNCIONARIO FECHOU.")
                        }}
                        animationType={"slide"}
                    >
                        <SafeAreaView style={{backgroundColor: Colors.primary, flex: 1}}>

                            <HeaderComponent
                                color={'white'}
                                titleCenterComponent={'Buscar Funcionário'}
                                pressLeftComponen={() => this.onAbrirFuncBuscaModal(!this.state.modalFuncBuscaVisible)}
                                iconLeftComponen={'chevron-left'}
                            />

                            <SearchBar
                                placeholder="Busca por Nome"
                                lightTheme={true}
                                onChangeText={this.onBuscaNomeChange}
                                inputStyle={{backgroundColor: 'white'}}
                                containerStyle={{backgroundColor: Colors.primaryLight}}
                                clearIcon={true}
                            />

                            <View style={{
                                flex: 1,
                                backgroundColor: Colors.background,
                            }}>

                                <ScrollView
                                    style={{flex: 1,}}
                                    keyboardShouldPersistTaps="always"
                                >
                                    <View style={{marginTop: 4}}>
                                        <FlatList
                                            data={listaRegistrosFunc}
                                            renderItem={this.renderItemFunc}
                                            contentContainerStyle={{paddingBottom: 100}}
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
