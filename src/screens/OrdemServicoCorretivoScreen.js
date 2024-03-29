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

import moment from 'moment';
import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import StatusBar from '../components/StatusBar';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';
import { getFilial } from '../utils/LoginManager';
import ServicosOSSelect from '../components/ServicosOSSelect';
import TextInput from '../components/TextInput';
import HeaderComponent from "../components/HeaderComponent";

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;

const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress, onFinalizarPress, onAbrirPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.man_sos_situacao === 'A' ? 'red' : '#10734a' }}>
                <TouchableOpacity
                    onPress={() => Alert.alert("Situação do Serviço", `Deseja alterar a situação deste serviço?`, [
                        { text: "Não" },
                        {
                            text: "Sim",
                            onPress: () => onRegistroPress(registro),
                            style: "destructive"
                        }
                    ])}
                    // onPress={() => onRegistroPress(registro)}
                    onLongPress={() => onRegistroLongPress(registro.man_sos_servico)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Serviço {': '}
                            </Text>
                            <Text>
                                {registro.man_sos_servico}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Situação {': '}
                            </Text>
                            <Text>
                                {registro.man_sos_situacao_descr}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                        <Text>
                            {registro.man_serv_descricao}
                        </Text>
                    </View>

                    {registro.man_sos_complemento ? (
                        <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                            <Text>
                                {registro.man_sos_complemento}
                            </Text>
                        </View>
                    ) : null}

                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class OrdemServicoCorretivoScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            man_os_idf: props.navigation.state.params.man_os_idf ? props.navigation.state.params.man_os_idf : 0,
            man_grupo_servico: props.navigation.state.params.man_grupo_servico ? props.navigation.state.params.man_grupo_servico : 0,
            man_os_situacao: props.navigation.state.params.man_os_situacao ? props.navigation.state.params.man_os_situacao : '',
            man_sos_complemento: '',

            servico_select: null,
            codServico: '',

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
        axios.get('/ordemServicos/listaCorretivas/' + this.state.man_os_idf, {
            params: {
                grupo: this.state.man_grupo_servico,
            }
        }).then(response => {
            this.setState({
                listaRegistros: response.data,
                refreshing: false,
                carregando: false,
            })
        }).catch(ex => {
            console.warn('Erro Busca:', ex);
            this.setState({
                refreshing: false,
                carregando: false,
            });
        })
    }

    onRegistroPress = (registro) => {
        const reg = {
            controle: this.state.man_os_idf,
            servico: registro.man_sos_servico,
            situacao: registro.man_sos_situacao === 'A' ? 'F' : 'A',
            dataFim: registro.man_sos_situacao === 'A' ? moment().format("YYYY-MM-DD") : '',
        };

        this.setState({ carregarRegistro: true });
        axios.put('/ordemServicos/mudaSituacaoCorretivas', reg)
            .then(response => {
                this.setState({ carregarRegistro: false });
                this.getListaRegistros();

            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
    }

    onRegistroLongPress = (man_sos_servico) => {
        Alert.alert("Excluir registro", `Deseja excluir este Serviço?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(man_sos_servico),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (man_sos_servico) => {
        this.setState({ refreshing: true });
        axios.delete('/ordemServicos/deleteCorretivas/' + this.state.man_os_idf + '/' + man_sos_servico)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.man_sos_servico === man_sos_servico);
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
        if ((!this.state.servico_select) || (!this.state.servico_select.man_serv_codigo)) {
            Alert.alert("Atenção", `Informe o Serviço`, [{ text: "OK" }])
            return;
        }

        this.onSalvarRegistro();
    }

    onSalvarRegistro = () => {
        const { man_os_idf, man_sos_valor, man_sos_complemento, servico_select } = this.state;

        const registro = {
            man_sos_idf: man_os_idf,
            man_sos_servico: String(servico_select.man_serv_codigo),
            man_sos_complemento,
            man_sos_valor: vlrStringParaFloat(man_sos_valor),
            man_sos_situacao: 'A',
        };

        this.setState({ salvado: true });

        let axiosMethod;
        axios.post('/ordemServicos/storeCorretivas', registro)
            .then(response => {
                this.setState({
                    man_sos_complemento: '',
                    servico_select: null,
                    codServico: '',
                    salvado: false,
                    refreshing: true
                });
                this.getListaRegistros();
            }).catch(ex => {
                this.setState({ salvado: false });
                console.warn(ex);
            })
    }

    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // ------------------------------------------------------------


    render() {
        const { listaRegistros, refreshing, carregarRegistro, loading, salvado,
            servico_select, codServico, man_sos_complemento } = this.state;

        // console.log('OrdemServicoCorretivoScreen: ', this.state);

        return (
            <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Serviços Corretivos'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

                <StatusBar />


                <View
                    style={{ paddingVertical: 8, paddingHorizontal: 16, paddingVertical: 20 }}
                >
                    <ServicosOSSelect
                        label="Serviço"
                        id="servico_select"
                        codServico={codServico}
                        tipoServico={'C'}
                        onChange={this.onInputChangeServico}
                        value={servico_select}
                        select={false}
                        grupo={this.state.man_grupo_servico}
                        veiculo=''
                    />

                    <TextInput
                        label="Observação"
                        id="man_sos_complemento"
                        ref="man_sos_complemento"
                        value={man_sos_complemento}
                        maxLength={100}
                        onChange={this.onInputChange}
                        multiline={true}
                        height={50}
                    />


                    {this.state.man_os_situacao === 'A' ? (
                        <Button
                            title="SALVAR SERVIÇO"
                            loading={salvado}
                            onPress={this.onFormSubmit}
                            buttonStyle={{ height: 45 }}
                            backgroundColor={Colors.buttonPrimary}
                            // disabled={true}
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
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                    keyExtractor={registro => String(registro.man_sos_servico)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />

                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </SafeAreaView >
        )
    }
}
