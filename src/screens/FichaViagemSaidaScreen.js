import React, { Component } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    FlatList, Modal, TouchableOpacity
} from 'react-native';
import { Card, Divider, SearchBar } from 'react-native-elements';
import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog, ConfirmDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import Icon from '../components/Icon';

import VeiculosSelect from '../components/VeiculosSelect';
import FuncionariosSelect from '../components/FuncionariosSelect';
import RotasSelect from '../components/RotasSelect';
import LinhasSelect from '../components/LinhasSelect';

const stateInicial = {
    veiculo_select: null,
    funcionario_select: null,
    rota_select: null,
    linha_select: null,

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
    codRota: '',
    codLinha: '',
    man_rt_flag_eventual: 'N',

    man_fv_odo_ini: '',
    man_fv_km_ini: '',
    man_fvd_disco: '',
    man_fv_obs: '',
    pas_serv_codigo: null,
    servicoSelect: [],
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


export default class zFichaViagemSaidaScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            salvado: false,
            carregandoFunc: false,
            carregandoServico: false,

            ...stateInicial,
        }
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
                codRota: value.codRota ? value.codRota : '',
                man_rt_flag_eventual: value.man_rt_flag_eventual,
                man_fv_odo_ini: value.kmOdo,
                man_fv_km_ini: value.kmAcum,
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

    onInputChangeLinha = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        if (value) {
            this.setState({
                codLinha: value.pas_lin_codigo,
            });
            if (value.pas_lin_codigo) {
                this.buscaServicos(value.pas_lin_codigo);
            }
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

        if ((this.state.funcionariosSelect) && (!this.state.empFunc)) {
            if (!this.state.man_fvm_nome_mot) {
                Alert.showAlert("Informe o Motorista");
                return;
            }
        }

        if ((this.state.rota_select === undefined) || (!this.state.rota_select)) {
            Alert.showAlert('Informe a Rota');
            return;
        }

        if (this.state.man_rt_flag_eventual !== 'S') {
            if ((this.state.linha_select === undefined) || (!this.state.linha_select)) {
                Alert.showAlert('Informe a Linha');
                return;
            }

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

        if (checkFormIsValid(this.refs)) {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }

    onSalvarRegistro = () => {
        this.setState({ salvado: true });

        const { veiculo_select, funcionarioSelect, rota_select, man_rt_flag_eventual,
            man_fv_odo_ini, man_fv_km_ini, man_fv_obs, man_fvd_disco, pas_serv_codigo,
            man_fvm_nome_mot, codFunc, empFunc, nomeFunc } = this.state;

        // let codFunc = 0
        // let empFunc = 0
        // if (funcionarios) {
        //     const ind = funcionarios.key.indexOf("_");
        //     const tam = funcionarios.key.length;
        //     codFunc = funcionarios.key.substr(0, ind).trim();
        //     empFunc = funcionarios.key.substr(ind + 1, tam).trim();
        // }

        const registro = {
            man_fv_idf_rota: veiculo_select.idfRota,
            man_fv_veiculo: veiculo_select.codVeic,
            man_fv_rota: rota_select.man_rt_codigo,
            man_rt_flag_eventual: man_rt_flag_eventual,
            pas_serv_codigo,

            man_fvm_motorista: codFunc,
            man_fvm_empresa_mot: empFunc,
            man_fvm_nome_mot: codFunc ? '.' : man_fvm_nome_mot,

            man_fv_odo_ini,
            man_fv_km_ini,
            man_fv_obs,
            man_fvd_disco,
        };

        // console.log(registro);

        axios.post('/fichaViagem/saida', registro)
            .then(response => {

                Alert.showAlert("Saída gravada com sucesso.")

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

    buscaFuncionários = (value) => {
        this.setState({ funcionariosSelect: [], empFunc: '', });

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
        this.setState({ servicoSelect: [] });
        this.setState({ carregandoServico: true });
        axios.get('/listaServicos', {
            params: {
                linha: value
            }
        }).then(response => {
            const { data } = response;
            const servicoSelect = data.map(regList => {
                return {
                    key: regList.pas_serv_codigo,
                    label: regList.pas_serv_codigo + ' - ' + regList.pas_serv_horario + ' - ' + regList.pas_serv_descricao
                }
            });

            let servico = 0;
            if (data.length > 0) {
                servico = servicoSelect[0].key;
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
        const { man_fv_odo_ini, man_fv_obs, man_fvm_nome_mot, pas_serv_codigo, man_fvd_disco,
            servicoSelect, loading, salvado, carregandoServico,
            veiculo_select, rota_select, linha_select, listaRegistrosFunc,
            codVeiculo, codRota, man_rt_flag_eventual, codLinha,
            funcionariosSelect, codFunc, nomeFunc, carregandoFunc,
            refreshing,
        } = this.state;

        return (
            <View style={{ flex: 1, }}>
                <StatusBar />


                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >
                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                    >

                        <VeiculosSelect
                            label="Veículo"
                            id="veiculo_select"
                            value={veiculo_select}
                            codVeiculo={codVeiculo}
                            onChange={this.onInputChangeVeiculo}
                            onErro={this.onErroChange}
                            tipo="fichaSaida"
                        />

                        {/* <FuncionariosSelect
                            label="Motorista"
                            id="funcionario_select"
                            value={codFunc}
                            codFunc={codFunc}
                            onChange={this.onInputChangeFunc}
                        /> */}

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

                        <RotasSelect
                            label="Rota"
                            id="rota_select"
                            value={rota_select}
                            codRota={codRota}
                            // codRota={veiculo_select && veiculo_select.codRota ? veiculo_select.codRota : ''}
                            onChange={this.onInputChangeRota}
                            enabled={veiculo_select && veiculo_select.sitRota === 'A' ? false : true}
                        />


                        {String(man_rt_flag_eventual) === 'S'
                            ? (null)
                            : (
                                <View>
                                    <LinhasSelect
                                        label="Linha"
                                        id="linha_select"
                                        codLinha={codLinha}
                                        onChange={this.onInputChangeLinha}
                                        value={linha_select}
                                    />

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
                                                onChange={this.onInputChange}
                                            />
                                        )
                                    }
                                </View>
                            )
                        }



                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: "47%", marginRight: 20 }}>
                                <TextInput
                                    label="Odômetro"
                                    id="man_fv_odo_ini"
                                    ref="man_fv_odo_ini"
                                    value={String(man_fv_odo_ini)}
                                    maxLength={60}
                                    onChange={this.onInputChange}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={{ width: "47%" }}>
                                <TextInput
                                    label="Nº Disco"
                                    id="man_fvd_disco"
                                    ref="man_fvd_disco"
                                    value={String(man_fvd_disco)}
                                    onChange={this.onInputChange}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <TextInput
                            label="Observação"
                            id="man_fv_obs"
                            ref="man_fv_obs"
                            value={man_fv_obs}
                            maxLength={100}
                            onChange={this.onInputChange}
                            multiline={true}
                        />


                        <Button
                            title="SALVAR"
                            loading={loading}
                            onPress={this.onFormSubmit}
                            color={Colors.textOnPrimary}
                            buttonStyle={{ marginBottom: 5, marginTop: 20 }}
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
                            buttonStyle={{ marginBottom: 5, marginTop: 0 }}
                            icon={{
                                name: 'close',
                                type: 'font-awesome',
                                color: Colors.textOnPrimary
                            }}
                        />

                    </View>



                    {/* -------------------------------- */}
                    {/* MODAL PARA BUSCA DO FUNCIONÁRIOS */}
                    {/* -------------------------------- */}
                    <Modal
                        transparent={false}
                        visible={this.state.modalFuncBuscaVisible}
                        onRequestClose={() => { console.log("Modal FUNCIONARIO FECHOU.") }}
                        animationType={"slide"}
                    >
                        <View style={{ backgroundColor: Colors.primary, flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => { this.onAbrirFuncBuscaModal(!this.state.modalFuncBuscaVisible) }}
                            >
                                <Icon family="MaterialIcons"
                                    name="arrow-back"
                                    color={Colors.textOnPrimary}
                                    style={{ padding: 16 }} />
                            </TouchableOpacity>

                            <Text style={{
                                color: Colors.textPrimaryLight,
                                marginTop: 15,
                                marginBottom: 15,
                                marginLeft: 16,
                                textAlign: 'center',
                                fontSize: 20,
                                fontWeight: 'bold',
                            }}>Buscar Funcionário</Text>
                        </View>

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
                        }} >

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
                    </Modal>




                    <ProgressDialog
                        visible={salvado}
                        title="App Nordeste"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}
