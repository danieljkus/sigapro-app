import React, { Component } from 'react';
import { View, ScrollView, Text, FlatList, ActivityIndicator, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { Card, Divider, SearchBar, CheckBox } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import { getTemPermissao, getPermissoes } from '../utils/LoginManager';
import { maskValorMoeda } from '../utils/Maskers';
import moment from 'moment';
import Icon from '../components/Icon';
import HeaderComponent from "../components/HeaderComponent";
import VeiculosSelect from '../components/VeiculosSelect';

const RegistroItem = ({ registro }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        {moment(registro.pas_via_data_viagem).format("DD/MM/YYYY")}
                    </Text>
                </View>
                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Horário {': '}
                        </Text>
                        <Text>
                            {registro.hora_fim ? registro.hora_ini : registro.hora_ini + ' / ' + registro.hora_fim}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Serviço {': '}
                        </Text>
                        <Text>
                            {registro.pas_via_servico_extra ? registro.pas_via_servico_extra : registro.pas_via_servico}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Veículo {': '}
                        </Text>
                        <Text>
                            {registro.veic1 ? registro.veic1 : registro.veic2}
                        </Text>
                    </View>
                </View>

                <Divider />

                <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                        {registro.desc_sec_ini + ' a ' + registro.desc_sec_fim}
                    </Text>
                </View>
            </View>
        </Card>
    )
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



export default class EscalaVeiculoScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvando: false,
            refreshing: false,
            carregarRegistro: false,
            man_ev_veiculo_trocar: '',
            qtdeComb: 0,
            dataComb: '',
            filial: 0,
            descFilial: '',

            veiculo_select: null,
            codVeiculo: '',

            idfFichaViagem: 0,
            viagemDiaAtual: false,

            listaRegistrosFunc: [],
            modalFuncBuscaVisible: false,
            carregandoFunc: false,
            funcionariosSelect: [],
            funcionario_select: null,
            codFunc: '',
            empFunc: '',
            nomeFunc: '',
            nomeFuncFL: '',

            checkedFichaSaida: false,

            ...props.navigation.state.params.registro,
        }
    }

    componentDidMount() {
        getPermissoes().then(permissoes => {
            this.setState({ permissoes });
        })

        const veiculo = this.state.registro.veic2 ? this.state.registro.veic2 : (this.state.registro.veic1 ? this.state.registro.veic1 : '');

        this.setState({
            viagemDiaAtual: this.state.registro.pas_via_data_viagem === moment().format('YYYY-MM-DD') ? true : false,
        });


        if ((veiculo) && (veiculo !== '')) {
            this.setState({ carregarRegistro: true });

            axios.get('/escalaVeiculos/show', {
                params: {
                    veiculo,
                    servico: this.state.registro.pas_via_servico,
                    servico_extra: this.state.registro.pas_via_servico_extra,
                    data: this.state.registro.pas_via_data_viagem,
                }
            }).then(response => {
                this.setState({ carregarRegistro: false });

                let funcionariosSelect = [];
                if (response.data.codMot) {
                    funcionariosSelect = [{
                        key: response.data.codMot + '_' + response.data.empMot,
                        label: response.data.nomeMot
                    }]
                }
                
                this.setState({
                    carregarRegistro: false,
                    qtdeComb: response.data.qtdeComb,
                    dataComb: response.data.dataComb,
                    filial: response.data.filial,
                    descFilial: response.data.descFilial,

                    codVeiculo: veiculo,
                    idfFichaViagem: response.data.idfFichaViagem,

                    codFunc: response.data.codMot,
                    empFunc: response.data.empMot,
                    nomeFunc: '',
                    nomeFuncFL: !response.data.codMot && response.data.nomeMot ? response.data.nomeMot : '',
                    funcionariosSelect,

                    // listaHistorico: response.data.listaHistorico,
                });

            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
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
            });
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistros: [],
            msgErroVeiculo: msgErro,
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


    onFormSubmit = (event) => {
        if ((this?.state?.veiculo_select === undefined) || (!this?.state?.veiculo_select) || (!this?.state?.veiculo_select?.codVeic)) {
            Alert.showAlert('Informe o Veículo');
            return;
        }
        if (this?.state?.msgErroVeiculo?.trim() !== '') {
            Alert.showAlert(this?.state?.msgErroVeiculo);
            return;
        }

        if (this.state.checkedFichaSaida) {
            if ((this.state.funcionariosSelect) && (!this.state.empFunc)) {
                if (!this.state.man_fvm_nome_mot) {
                    Alert.showAlert("Informe o Motorista");
                    return;
                }
            }
        }

        this.onSalvarRegistro();
    }

    onSalvarRegistro = () => {
        this.setState({ salvando: true });

        const idf = this.state.registro.idf2 ? this.state.registro.idf2 : (this.state.registro.idf1 ? this.state.registro.idf1 : 0);

        const reg = {
            idf: idf,
            idfFichaViagem: this.state.idfFichaViagem,

            man_ev_veiculo: this.state.veiculo_select.codVeic,
            man_ev_data_ini: this.state.registro.pas_via_data_viagem,
            man_ev_servico: this.state.registro.pas_via_servico,
            man_ev_servico_estra: this.state.registro.pas_via_servico_extra,

            codMot: this.state.codFunc,
            empMot: this.state.empFunc,
            nomeMot: this.state.codFunc ? this.state.funcionariosSelect[0].label : this.state.nomeFuncFL,

            gravarFichaSaida: this.state.checkedFichaSaida,
        };

        axios.put('/escalaVeiculos/trocaCarro', reg)
            .then(response => {
                if (response.data === 'OK') {
                    this.props.navigation.goBack(null);
                    if (this.props.navigation.state.params.onRefresh) {
                        this.props.navigation.state.params.onRefresh();
                    }
                } else {
                    this.setState({ salvando: false });
                    Alert.showAlert(response.data);
                }
            }).catch(ex => {
                this.setState({ salvando: false });
                console.warn(ex);
                console.warn(ex.response);
                Alert.showAlert(ex);
            })
    }



    renderItem = ({ item, index }) => {
        return (
            <RegistroItem
                registro={item}
            />
        )
    }


    onAbrirLog = () => {
        this.props.navigation.navigate('EscalaVeiculoLogScreen', {
            man_ev_idf: this.state.registro.idf1,
        });
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

    renderItemFunc = ({ item, index }) => {
        return (
            <RegistroFunc
                registro={item}
                onRegistroFuncPress={this.onRegistroFuncPress}
            />
        )
    }





    render() {
        const { pas_via_data_viagem, pas_via_servico, pas_serv_linha, pas_via_servico_extra,
            idf1, idf2, veic1, veic2, desc_sec_ini, desc_sec_fim, hora_ini, hora_fim,
        } = this.state.registro;
        const { viagemDiaAtual, man_ev_veiculo_trocar, salvando, loading, refreshing, carregarRegistro, permissoes,
            veiculo_select, codVeiculo, codFunc, nomeFunc, nomeFuncFL, funcionariosSelect, carregandoFunc, listaRegistrosFunc, checkedFichaSaida,
        } = this.state;

        // console.log('this.state', this.state);

        return (
            <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Detalhes da Escala'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    <View style={{ marginBottom: 0, paddingHorizontal: 16, }}>
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
                                    {moment(pas_via_data_viagem).format("DD/MM/YYYY")}
                                </Text>
                            </View>
                            {/* <View style={{ flex: 2, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                    Veículo{': '}
                                </Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                    {veic2 ? veic2 : veic1}
                                </Text>
                            </View> */}
                        </View>

                        <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                            <View style={{ flex: 2, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                    Serviço{': '}
                                </Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                    {pas_via_servico + (pas_via_servico_extra ? ' / ' + pas_via_servico_extra : '')}
                                </Text>
                            </View>
                            <View style={{ flex: 2, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                    Horário{': '}
                                </Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                    {hora_ini + ' / ' + hora_fim}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                Linha {': '}
                            </Text>
                            <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                {desc_sec_ini + ' a ' + desc_sec_fim}
                            </Text>
                        </View>

                    </View>



                    <View
                        style={{ flex: 1, paddingVertical: 30, paddingHorizontal: 16 }}
                    >
                        {getTemPermissao('ESCALAVEICULOSTROCARVEICSCREEN', permissoes) ? (
                            <View style={{ marginBottom: 30 }}>

                                <VeiculosSelect
                                    label="Veículo"
                                    id="veiculo_select"
                                    value={veiculo_select}
                                    codVeiculo={codVeiculo}
                                    onChange={this.onInputChangeVeiculo}
                                    onErro={this.onErroChange}
                                    tipo=""
                                    enabled={!this.state.idfFichaViagem}
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
                                            enabled={!this.state.idfFichaViagem}
                                        />
                                    </View>

                                    <View style={{ width: "7%", }}>
                                        {this.state.idfFichaViagem ? null : (
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
                                        )}
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
                                                    enabled={!this.state.idfFichaViagem}
                                                />
                                            )
                                        }
                                    </View>
                                </View >

                                <TextInput
                                    label="Motorista Free-Lance"
                                    id="nomeFuncFL"
                                    ref="nomeFuncFL"
                                    value={nomeFuncFL}
                                    maxLength={60}
                                    onChange={this.onInputChange}
                                    enabled={!this.state.idfFichaViagem}
                                />

                                {this.state.idfFichaViagem || !viagemDiaAtual ? null : (
                                    <CheckBox
                                        title='Gravar Ficha de Saída'
                                        checked={checkedFichaSaida}
                                        onPress={() => this.setState({ checkedFichaSaida: !checkedFichaSaida })}
                                        size={25}
                                        textStyle={{ fontSize: 18 }}
                                        containerStyle={{ padding: 0, margin: 0, marginBottom: 30, backgroundColor: 'transparent' }}
                                    />
                                )}

                            </View>
                        ) : null}





                        {this.state.filial ? (
                            <View style={{ marginBottom: 30 }}>
                                <Text style={{
                                    color: Colors.textSecondaryDark,
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginBottom: 10,
                                    marginRight: 5,
                                    borderBottomWidth: 2,
                                    borderColor: Colors.dividerDark,
                                }}>
                                    Último Abastecimento
                                </Text>
                                <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                        Data {': '}
                                    </Text>
                                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                        {this.state.dataComb ? moment(this.state.dataComb).format("DD/MM/YYYY hh:mm") : ''}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                        Qtde {': '}
                                    </Text>
                                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                        {this.state.qtdeComb ? maskValorMoeda(parseFloat(this.state.qtdeComb)) + ' Lt' : ''}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5, paddingRight: 5 }}>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                        Filial {': '}
                                    </Text>
                                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                        {this.state.filial ? this.state.filial + ' - ' + this.state.descFilial : ''}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: "center" }}>
                                    <Button
                                        title="Log"
                                        onPress={this.onAbrirLog}
                                        color={Colors.textOnPrimary}
                                        buttonStyle={{ margin: 5, marginTop: 10, height: 20, width: 150 }}
                                        // buttonStyle={{ margin: 5, marginTop: 10, height: 20 }}
                                        // buttonStyle={{ marginBottom: 0, marginTop: 0, height: 10, width: 150 }}
                                        icon={{
                                            name: 'file-text-o',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary,
                                        }}
                                    />
                                </View>
                            </View>
                        ) : null}

                    </View>

                    {/* <Text style={{ color: Colors.textSecondaryDark, fontSize: 8, textAlign: 'center' }}>
                        {idf2 ? idf2 : idf1}
                    </Text> */}


                    {/* -------------------------------- */}
                    {/* MODAL PARA BUSCA DO FUNCIONÁRIOS */}
                    {/* -------------------------------- */}
                    <Modal
                        style={{
                            flex: 1,
                        }}
                        transparent={false}
                        visible={this.state.modalFuncBuscaVisible}
                        animationType={"slide"}
                    >
                        <SafeAreaView style={{ backgroundColor: Colors.white, flex: 0, flexDirection: 'row' }} />

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
                        visible={carregarRegistro}
                        title="SIGA PRO"
                        message="Carregando. Aguarde..."
                    />

                </ScrollView>

                {this.state.idfFichaViagem ? null : (
                    <Button
                        title="SALVAR"
                        loading={salvando}
                        onPress={this.onFormSubmit}
                        color={Colors.textOnPrimary}
                        buttonStyle={{ margin: 5, marginTop: 10 }}
                        icon={{
                            name: 'check',
                            type: 'font-awesome',
                            color: Colors.textOnPrimary
                        }}
                    />
                )}
            </SafeAreaView>
        )
    }
}
