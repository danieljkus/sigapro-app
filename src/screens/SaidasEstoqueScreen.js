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
    Modal,
    SafeAreaView
} from 'react-native';
const { OS } = Platform;

import axios from 'axios';
import { Card, Divider } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskDate, maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';
import FiliaisSelect from '../components/FiliaisSelect';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { getFilial } from '../utils/LoginManager';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";
moment.locale('pt-BR');

const DATE_FORMAT = 'DD/MM/YYYY';

const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.estoq_me_idf)}
            // onLongPress={() => onRegistroLongPress(registro.estoq_me_idf)}
            >

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Data {': '}
                        </Text>
                        <Text>
                            {moment(registro.estoq_me_data).format('DD/MM/YYYY')}
                        </Text>
                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Usuário {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_usuario}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            IDF {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_idf}
                        </Text>
                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Número {': '}
                        </Text>
                        <Text>
                            {registro.estoq_me_numero}
                        </Text>
                    </View>
                </View>


                {registro.estoq_me_obs ? (
                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                        <Text>
                            {registro.estoq_me_obs}
                        </Text>
                    </View>
                ) : null}
            </TouchableOpacity>

        </Card>
    )
}

export default class SaidasEstoqueScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        empresa: '',
        dataIni: moment(moment().subtract(10, 'days')).format(DATE_FORMAT),
        dataFim: moment(new Date()).format(DATE_FORMAT),
        estoq_mei_filial: '',
        idf: '',
        numero: '',

        filialSelect: null,

        temFiltro: false,
        modalFiltrosVisible: false,
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({
                refreshing: true,
                estoq_mei_filial: filial
            });

            if (filial) {
                axios.get('/listaFiliais', {
                    params: {
                        codFilial: filial
                    }
                }).then(response => {
                    const { data } = response;
                    this.setState({
                        filialSelect: {
                            adm_fil_codigo: filial,
                            adm_fil_descricao: data[0].adm_fil_descricao
                        },
                    },
                        this.getListaRegistros()
                    );
                });
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
                estoq_mei_filial: value.adm_fil_codigo
            });
        }
    }

    getListaRegistros = () => {
        const { estoq_mei_filial, dataIni, dataFim, idf, numero, pagina, listaRegistros } = this.state;

        axios.get('/saidasEstoque', {
            params: {
                tipoDig: 2,
                page: pagina,
                limite: 10,
                filial: estoq_mei_filial,
                idf,
                numero,
                dtIni: moment(dataIni, DATE_FORMAT).format("YYYY-MM-DD"),
                dtFim: moment(dataFim, DATE_FORMAT).format("YYYY-MM-DD"),
            }
        }).then(response => {
            const novosRegistros = pagina === 1
                ? response.data.data
                : listaRegistros.concat(response.data.data);
            const total = response.data.total;
            this.setState({
                listaRegistros: novosRegistros,
                refreshing: false,
                carregando: false,
                carregarMais: novosRegistros.length < total,
            })
        }).catch(ex => {
            console.warn('Erro Busca:', ex);
            this.setState({
                refreshing: false,
                carregando: false,
            });
        })
    }

    onRegistroPress = (estoq_me_idf) => {
        this.setState({ carregarRegistro: true });
        axios.get('/saidasEstoque/show/' + estoq_me_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });

                let tipo_destino = '';
                let codVeiculo = '';
                let codFilial = '';
                let codCC = '';
                let controleOS = '';
                let estoq_mei_ordem_servico = '';
                let cod_destino = '';
                let cod_ccdestino = '';

                if ((response.data.listaItens[0].estoq_mei_ordem_servico !== '') && (response.data.listaItens[0].estoq_mei_ordem_servico !== null)) {
                    tipo_destino = 'OS';
                    cod_destino = response.data.listaItens[0].estoq_mei_ordem_servico;
                    estoq_mei_ordem_servico = response.data.listaItens[0].estoq_mei_ordem_servico;
                    controleOS = response.data.listaItens[0].man_osm_controle;
                } else if ((response.data.listaItens[0].estoq_mei_veic_dest !== '') && (response.data.listaItens[0].estoq_mei_veic_dest !== null)) {
                    tipo_destino = 'VEIC';
                    codVeiculo = response.data.listaItens[0].estoq_mei_veic_dest;
                    cod_destino = response.data.listaItens[0].estoq_mei_veic_dest;
                } else if ((response.data.listaItens[0].estoq_mei_cc_dest !== '') && (response.data.listaItens[0].estoq_mei_cc_dest !== null)) {
                    tipo_destino = 'CC';
                    codFilial = response.data.listaItens[0].estoq_mei_fil_dest;
                    cod_destino = response.data.listaItens[0].estoq_mei_fil_dest;
                    codCC = response.data.listaItens[0].estoq_mei_cc_dest;
                    cod_ccdestino = response.data.listaItens[0].estoq_mei_cc_dest;
                }

                this.props.navigation.navigate('SaidaEstoqueItensScreen', {
                    registro: {
                        ...response.data,
                        checkedVeiculo: response.data.listaItens[0].estoq_mei_veic_dest ? true : false,
                        checkedFilial: response.data.listaItens[0].estoq_mei_cc_dest ? true : false,
                        checkedOS: response.data.listaItens[0].estoq_mei_ordem_servico ? true : false,

                        tipo_destino,
                        codVeiculo,
                        codFilial,
                        codCC,
                        codOS: '',
                        controleOS,
                        descricaoOS: '',
                        estoq_mei_ordem_servico,
                    },
                    onRefresh: this.onRefresh
                });
            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
    }

    onAddPress = () => {
        this.props.navigation.navigate('SaidaEstoqueItensScreen', {
            registro: {
                estoq_me_idf: 0,
                estoq_me_data: '', //moment(new Date()).format('DD/MM/YYYY'),
                estoq_me_numero: '0',
                estoq_me_obs: 'BAIXA SIGAPRO',

                estoq_mei_seq: 0,
                estoq_mei_item: 0,
                estoq_mei_qtde_mov: 0,
                estoq_mei_valor_unit: 0,
                estoq_mei_total_mov: 0,
                estoq_mei_obs: '',

                checkedVeiculo: true,
                checkedFilial: false,
                checkedOS: false,

                tipo_destino: 'VEIC',
                descr_destino: '',

                veiculo_select: [],
                codVeiculo: '',

                filial_select: [],
                codFilial: '',

                cc_select: [],
                codCC: '',

                codOS: '',
                controleOS: '',
                descricaoOS: '',
                estoq_mei_ordem_servico: '',
            },
            onRefresh: this.onRefresh
        });
    }

    onRegistroLongPress = (estoq_me_idf) => {
        Alert.alert("Excluir registro", `Deseja excluir este Registro?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(estoq_me_idf),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (estoq_me_idf) => {
        this.setState({ refreshing: true });
        axios.delete('/saidasEstoque/delete/' + estoq_me_idf)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.estoq_me_idf === estoq_me_idf);
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

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
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
            />
        )
    }


    onSearchPress = (visible) => {
        this.setState({ modalFiltrosVisible: visible });
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onClosePress = (visible) => {
        this.setState({ modalFiltrosVisible: visible });
    }




    render() {
        const { listaRegistros, refreshing, carregarRegistro,
            estoq_mei_filial, dataIni, dataFim, idf, numero, filialSelect } = this.state;

        // console.log('SaidasEstoqueScreen: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Baixas do Estoque'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.estoq_me_idf)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />




                {/* ----------------------------- */}
                {/* MODAL PARA FILTROS            */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalFiltrosVisible}
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
                            width: "90%",
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
                                    }}>Filtrar</Text>
                                </View>

                                <View style={{ marginTop: 4, paddingVertical: 10 }}>

                                    <ScrollView style={{ height: 50, width: "100%", marginBottom: 10 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ width: "47%", marginRight: 20 }}>
                                                <TextInput
                                                    type="date"
                                                    label="Data Início"
                                                    id="dataIni"
                                                    ref="dataIni"
                                                    value={dataIni}
                                                    masker={maskDate}
                                                    dateFormat={DATE_FORMAT}
                                                    onChange={this.onInputChange}
                                                    validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                                    fontSize={12}
                                                />
                                            </View>
                                            <View style={{ width: "47%" }}>
                                                <TextInput
                                                    type="date"
                                                    label="Data Fim"
                                                    id="dataFim"
                                                    ref="dataFim"
                                                    value={dataFim}
                                                    masker={maskDate}
                                                    dateFormat={DATE_FORMAT}
                                                    onChange={this.onInputChange}
                                                    validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                                    fontSize={12}
                                                />
                                            </View>
                                        </View>
                                    </ScrollView>

                                    <FiliaisSelect
                                        label="Filial"
                                        id="filialSelect"
                                        codFilial={estoq_mei_filial}
                                        onChange={this.onInputChangeFilial}
                                        value={filialSelect}
                                        enabled={true}
                                    />

                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: "47%", marginRight: 20 }}>
                                            <TextInput
                                                label="IDF"
                                                id="idf"
                                                ref="idf"
                                                value={idf}
                                                maxLength={10}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ width: "47%" }}>
                                            <TextInput
                                                label="Número"
                                                id="numero"
                                                ref="numero"
                                                value={numero}
                                                maxLength={10}
                                                onChange={this.onInputChange}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>



                                    <Button
                                        title="FILTRAR"
                                        onPress={() => { this.onSearchPress(!this.state.modalFiltrosVisible) }}
                                        buttonStyle={{ marginTop: 15}}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'filter',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />
                                    <Button
                                        title="FECHAR"
                                        onPress={() => { this.onClosePress(!this.state.modalFiltrosVisible) }}
                                        buttonStyle={{ marginTop: 10}}
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


                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="search"
                    iconColor={Colors.textOnPrimary}
                    onPress={() => { this.onSearchPress(true) }}
                    backgroundColor={Colors.primary}
                    marginBottom={90}
                    marginRight={10}
                />

                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="add"
                    iconColor={Colors.textOnAccent}
                    onPress={this.onAddPress}
                    backgroundColor={Colors.primary}
                    marginRight={10}
                />

                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </SafeAreaView>
        )
    }
}
