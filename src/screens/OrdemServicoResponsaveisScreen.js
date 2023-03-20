import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    SafeAreaView
} from 'react-native';
const { OS } = Platform;

import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import StatusBar from '../components/StatusBar';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { vlrStringParaFloat } from '../utils/Maskers';
import { getFilial } from '../utils/LoginManager';
import TextInput from '../components/TextInput';
import HeaderComponent from "../components/HeaderComponent";

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress, onFinalizarPress, onAbrirPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.man_osf_sequencia)}
                    onLongPress={() => onRegistroLongPress(registro.man_osf_sequencia)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                {registro.man_osf_funcionario ? 'Funcionário' : 'Terceirizado'}{': '}
                            </Text>
                            <Text>
                                {registro.man_osf_funcionario}
                            </Text>
                        </View>
                        {/* <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Valor {': '}
                            </Text>
                            <Text>
                                {parseFloat(registro.man_osf_valor).toFixed(2)}
                            </Text>
                        </View> */}
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                        <Text>
                            {registro.man_osf_nome}
                        </Text>
                    </View>

                    {registro.man_osf_obs ? (
                        <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                            <Text>
                                {registro.man_osf_obs}
                            </Text>
                        </View>
                    ) : null}

                </TouchableOpacity>
            </View>
        </Card>
    )
}

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


export default class OrdemServicoResponsaveisScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            man_os_idf: props.navigation.state.params.man_os_idf ? props.navigation.state.params.man_os_idf : 0,
            man_grupo_servico: props.navigation.state.params.man_grupo_servico ? props.navigation.state.params.man_grupo_servico : 0,
            man_os_situacao: props.navigation.state.params.man_os_situacao ? props.navigation.state.params.man_os_situacao : '',
            man_osf_nome_funcionario: '',
            man_osf_obs: '',

            funcionariosSelect: [],
            codFunc: '',
            empFunc: '',
            nomeFunc: '',
            carregandoFunc: false,
            modalFuncBuscaVisible: false,

            listaRegistros: [],
            refreshing: false,
            carregando: false,
            carregarMais: false,
            loading: false,
            pagina: 1,
        }
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({
                filial,
                refreshing: false
            });
        })
        this.getListaRegistros();
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    getListaRegistros = () => {
        const { pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/ordemServicos/listaResponsaveis/' + this.state.man_os_idf, {
            params: {
                grupo: this.state.man_grupo_servico,
            }
        })
            .then(response => {
                const novosRegistros = pagina === 1
                    ? response.data.data
                    : listaRegistros.concat(response.data.data);
                const total = response.data.total;
                this.setState({
                    listaRegistros: novosRegistros,
                    refreshing: false,
                    carregando: false,
                    carregarMais: novosRegistros.length < total
                })
            }).catch(ex => {
                console.warn('Erro Busca:', ex);
                this.setState({
                    refreshing: false,
                    carregando: false,
                });
            })
    }

    // onRegistroPress = (man_osf_sequencia) => {
    //     console.log('onRegistroPress: ', man_osf_sequencia);

    //     this.setState({ carregarRegistro: true });
    //     axios.get('/ordemServicos/show/' + this.state.man_os_idf + '/' + man_osf_sequencia)
    //         .then(response => {
    //             this.setState({ carregarRegistro: false });

    //             console.log('onRegistroPress: ', response.data);

    //             this.props.navigation.navigate('OrdemServicoScreen', {
    //                 registro: {
    //                     ...response.data,
    //                 },
    //                 onRefresh: this.onRefresh
    //             });
    //         }).catch(ex => {
    //             this.setState({ carregarRegistro: false });
    //             console.warn(ex);
    //             console.warn(ex.response);
    //         });
    // }


    onRegistroLongPress = (man_osf_sequencia) => {
        Alert.alert("Excluir registro", `Deseja excluir este Responsável?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(man_osf_sequencia),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (man_osf_sequencia) => {
        this.setState({ refreshing: true });
        axios.delete('/ordemServicos/deleteResponsaveis/' + this.state.man_os_idf + '/' + man_osf_sequencia)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.man_osf_sequencia === man_osf_sequencia);
                listaRegistros.splice(index, 1);
                this.setState({
                    listaRegistros,
                    refreshing: false
                });
            }).catch(ex => {
                console.warn(ex);
                console.warn(ex.response);
                this.setState({ refreshing: false });
            })
    }


    carregarMaisRegistros = () => {
        const { carregarMais, refreshing, carregando, pagina } = this.state;
        if (carregarMais && !refreshing && !carregando) {
            this.setState({
                carregando: true,
                pagina: pagina + 1,
            }, this.getListaRegistros);
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


    renderItem = ({ item }) => {
        return (
            <CardViewItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
                onRegistroLongPress={this.onRegistroLongPress}
                onFinalizarPress={this.onFinalizarPress}
                onAbrirPress={this.onAbrirPress}
            />
        )
    }


    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }


    onInputChangeServico = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            this.setState({
                codServico: value.man_serv_codigo,
                descr_servico: value.man_serv_descricao,
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
        if ((!this.state.funcionariosSelect) && (!this.state.funcionariosSelect.man_serv_codigo) && (!this.state.man_osf_nome_funcionario)) {
            Alert.alert("Atenção", `Informe um Responsável`, [{ text: "OK" }])
            return;
        }

        this.onSalvarRegistro();
    }

    onSalvarRegistro = () => {
        const { man_os_idf, man_osf_valor, man_osf_obs, codFunc, empFunc, man_osf_nome_funcionario } = this.state;

        const registro = {
            man_osf_ordem_servico: man_os_idf,
            man_osf_grupo: '00010001',
            man_osf_funcionario: String(codFunc),
            man_osf_empresa_funcionario: String(empFunc),
            man_osf_nome_funcionario: String(man_osf_nome_funcionario),
            man_osf_valor: vlrStringParaFloat(man_osf_valor),
            man_osf_obs,
        };

        // console.log('onSalvarRegistro: ', registro);
        // return;

        this.setState({ salvado: true });

        let axiosMethod;
        // if (man_os_idf) {
        // axiosMethod = axios.put('/ordemServicos/updateResponsaveis/' + this.state.man_os_idf + '/' + String(servico_select.man_serv_codigo), registro);
        // } else {
        axiosMethod = axios.post('/ordemServicos/storeResponsaveis', registro);
        // }
        axiosMethod.then(response => {
            this.setState({
                man_osf_nome_funcionario: '',
                man_osf_obs: '',
                funcionariosSelect: [],
                codFunc: '',
                empFunc: '',
                nomeFunc: '',
                carregandoFunc: false,
                modalFuncBuscaVisible: false,
                salvado: false,
                refreshing: true
            });
            this.getListaRegistros();
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

    carregarMaisRegistrosFunc = () => {
        const { carregarMais, refreshing, carregando, pagina } = this.state;
        if (carregarMais && !refreshing && !carregando) {
            this.setState({
                carregando: true,
                pagina: pagina + 1,
            }, this.getListaRegistrosFunc);
        }
    }


    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // ------------------------------------------------------------


    render() {
        const { listaRegistros, refreshing, carregarRegistro, loading, salvado,
            funcionariosSelect, codFunc, nomeFunc, listaRegistrosFunc, carregandoFunc,
            man_osf_nome_funcionario, man_osf_obs } = this.state;

        // console.log('OrdemServicoResponsaveisScreen: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Responsáveis'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
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
                            label="Terceirizado"
                            id="man_osf_nome_funcionario"
                            ref="man_osf_nome_funcionario"
                            value={man_osf_nome_funcionario}
                            maxLength={100}
                            onChange={this.onInputChange}
                            multiline={true}
                        />

                        <TextInput
                            label="Observação"
                            id="man_osf_obs"
                            ref="man_osf_obs"
                            value={man_osf_obs}
                            maxLength={100}
                            onChange={this.onInputChange}
                            multiline={true}
                        />


{this.state.man_os_situacao === 'A' ? (
                       <Button
                            title="SALVAR SERVIÇO"
                            loading={salvado}
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
) : null}

                    </View>


                    <FlatList
                        data={listaRegistros}
                        renderItem={this.renderItem}
                        contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
                        keyExtractor={registro => String(registro.man_osf_sequencia)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />

                </ScrollView>

                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </SafeAreaView >
        )
    }
}
