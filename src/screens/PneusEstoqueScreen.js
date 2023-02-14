import React, {Component} from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView, SafeAreaView
} from 'react-native';
import {Icon, Card, Divider, CheckBox} from 'react-native-elements';
import {ProgressDialog} from 'react-native-simple-dialogs';
import axios from 'axios';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import {maskDate} from '../utils/Maskers';
import {getFilial} from '../utils/LoginManager';
import FiliaisSelect from '../components/FiliaisSelect';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";

moment.locale('pt-BR');

const {OS} = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({registro, onRegistroPress}) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 7,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            elevation: 0,
        }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.pneus_mov_idf)}
            >
                <View style={{paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Pneu{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {registro.pneus_mov_pneu}
                        </Text>
                    </View>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Filial{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {registro.pneus_mov_filial}
                        </Text>
                    </View>
                </View>

                <View style={{flexDirection: 'row', paddingLeft: 20}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Marca{': '}
                    </Text>
                    <Text>
                        {registro.pneus_mar_descricao}
                    </Text>
                </View>

                <View style={{flexDirection: 'row', paddingLeft: 20}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Modelo{': '}
                    </Text>
                    <Text>
                        {registro.pneus_mod_descricao}
                    </Text>
                </View>

                <View style={{flexDirection: 'row', paddingLeft: 20}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Dimenssão{': '}
                    </Text>
                    <Text>
                        {registro.pneus_dim_descricao}
                    </Text>
                </View>

                <View style={{paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Data{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 12, marginTop: 3}}>
                            {moment(registro.pneus_mov_data).format("DD/MM/YYYY")}
                        </Text>
                    </View>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Vida{': '}
                        </Text>
                        <Text style={{fontSize: 12, marginTop: 2}}>
                            {registro.pneus_mov_vida === "0" ? 'NOVO' : registro.pneus_mov_vida + 'º VIDA'}
                        </Text>
                    </View>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Km Vida{': '}
                        </Text>
                        <Text>
                            {registro.pneus_mov_km_ini}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Card>
    )
}


export default class PneusEstoqueScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        pneus_mov_pneu: '',
        pneus_mov_filial: '',
        pneus_cp_marca: '',
        pneus_cp_modelo: '',
        pneus_cp_dimenssao: '',

        filialSelect: null,
        marcaSelect: [],
        modeloSelect: [],
        dimenssaoSelect: [],

        temFiltro: false,
        modalFiltrosVisible: false,
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({
                refreshing: true,
                pneus_mov_filial: filial
            });

            if (filial) {
                axios.get('/listaFiliais', {
                    params: {
                        codFilial: filial
                    }
                }).then(response => {
                    const {data} = response;
                    // console.log('FiliaisSelect.componentDidMount: ', data);
                    this.setState({
                            filialSelect: {
                                adm_fil_codigo: filial,
                                adm_fil_descricao: data[0].adm_fil_descricao
                            },
                        },
                        this.getListaRegistros()
                    );
                });
            } else {
                this.getListaRegistros();
            }

            this.buscaMarca();
            this.buscaModelo();
            this.buscaDimenssoes();
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
        // console.log('onInputChangeFilial: ', state);

        if (value) {
            this.setState({
                pneus_mov_filial: value.adm_fil_codigo
            });
        }
    }


    getListaRegistros = () => {
        const {
            pneus_mov_pneu, pneus_mov_filial, pneus_cp_marca, pneus_cp_modelo, pneus_cp_dimenssao,
            pagina, listaRegistros
        } = this.state;

        const temFiltro = pneus_mov_pneu !== '' || pneus_mov_filial !== '' || pneus_cp_marca !== '' || pneus_cp_modelo !== '' || pneus_cp_dimenssao !== '';

        axios.get('/pneus/listaEstoque', {
            params: {
                page: pagina,
                limite: 10,
                pneu: pneus_mov_pneu,
                filial: pneus_mov_filial,
                marca: pneus_cp_marca,
                modelo: pneus_cp_modelo,
                dimenssao: pneus_cp_dimenssao,
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
                temFiltro
            })
        }).catch(ex => {
            console.warn(ex);
            console.warn(ex.response);
            this.setState({
                refreshing: false,
                carregando: false,
                temFiltro
            });
        })
    }

    onRegistroPress = (pneus_mov_idf) => {
        this.setState({carregarRegistro: true});

        axios.get('/pneus/showMovPneu/' + pneus_mov_idf)
            .then(response => {
                this.setState({carregarRegistro: false});
                response.data.tipoTela = 'EST';
                this.props.navigation.navigate('PneusTrocaScreen', {
                    registro: {
                        registro: response.data,
                    },
                    onRefresh: this.onRefresh,
                });
            }).catch(ex => {
            this.setState({carregarRegistro: false});
            console.warn(ex);
            console.warn(ex.response);
        });
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    carregarMaisRegistros = () => {
        const {carregarMais, refreshing, carregando, pagina} = this.state;
        if (carregarMais && !refreshing && !carregando) {
            this.setState({
                carregando: true,
                pagina: pagina + 1,
            }, this.getListaRegistros);
        }
    }


    renderListFooter = () => {
        const {carregando} = this.state;

        if (carregando) {
            return (
                <View style={{marginTop: 8}}>
                    <ActivityIndicator size="large"/>
                </View>
            )
        }

        return null;
    }

    renderItem = ({item, index}) => {
        return (
            <RegistroItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
            />
        )
    }

    onRefreshPress = (visible) => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onSearchPress = (visible) => {
        this.setState({modalFiltrosVisible: visible});
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onClosePress = (visible) => {
        this.setState({modalFiltrosVisible: visible});
    }

    onClearSearchPress = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
            temFiltro: false,
            filialSelect: null,
            pneus_mov_pneu: '',
            pneus_mov_filial: '',
            pneus_cp_marca: '',
            pneus_cp_modelo: '',
            pneus_cp_dimenssao: '',
        }, this.getListaRegistros);
    }


    buscaMarca = () => {
        this.setState({marcaSelect: [], pneus_cp_marca: ''});
        axios.get('/pneus/listaMarcas', {}).then(response => {
            const {data} = response;
            const marcaSelect = data.map(regList => {
                return {
                    key: regList.pneus_mar_codigo,
                    label: regList.pneus_mar_descricao
                }
            });
            marcaSelect.unshift({key: 0, label: "Selecione uma Marca"});
            this.setState({
                marcaSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                marcaSelect: [{label: "Marca não encontrda", key: 0}],
            });
        })

    }

    buscaModelo = () => {
        this.setState({modeloSelect: [], pneus_cp_modelo: ''});
        axios.get('/pneus/listaModelos', {}).then(response => {
            const {data} = response;
            const modeloSelect = data.map(regList => {
                return {
                    key: regList.pneus_mod_codigo,
                    label: regList.pneus_mod_descricao
                }
            });
            modeloSelect.unshift({key: 0, label: "Selecione um Modelo"});
            this.setState({
                modeloSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                modeloSelect: [{label: "Modelo não encontrdo", key: 0}],
            });
        })

    }

    buscaDimenssoes = () => {
        this.setState({dimenssaoSelect: [], pneus_cp_dimenssao: ''});
        axios.get('/pneus/listaDimenssoes', {}).then(response => {
            const {data} = response;
            const dimenssaoSelect = data.map(regList => {
                return {
                    key: regList.pneus_dim_codigo,
                    label: regList.pneus_dim_descricao
                }
            });
            dimenssaoSelect.unshift({key: 0, label: "Selecione uma Dimenssão"});
            this.setState({
                dimenssaoSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                dimenssaoSelect: [{label: "Dimenssão não encontrda", key: 0}],
            });
        })

    }


    render() {
        const {
            listaRegistros, refreshing, carregarRegistro, temFiltro,
            pneus_mov_pneu, pneus_mov_filial, pneus_cp_marca, pneus_cp_modelo, pneus_cp_dimenssao,
            filialSelect, marcaSelect, modeloSelect, dimenssaoSelect
        } = this.state;

        // console.log('PneusEstoqueScreen.this.state: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Pneus em Estoque'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{paddingBottom: 100}}
                    keyExtractor={registro => String(registro.pneus_mov_pneu)}
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
                    onRequestClose={() => {
                        console.log("Modal FILTROS FECHOU.")
                    }}
                    animationType={"slide"}
                    transparent={true}
                >
                    <View style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <View style={{
                            width: "90%",
                        }}>
                            <View style={{
                                paddingVertical: 15,
                                paddingHorizontal: 15,
                                backgroundColor: Colors.background,
                                borderRadius: 5,
                            }}>

                                <View style={{backgroundColor: Colors.primary, flexDirection: 'row'}}>
                                    <Text style={{
                                        color: Colors.textOnPrimary,
                                        marginTop: 15,
                                        marginBottom: 15,
                                        marginLeft: 16,
                                        textAlign: 'center',
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                    }}>Filtrar Estoque</Text>
                                </View>

                                <View style={{marginTop: 4, paddingVertical: 10}}>

                                    <FiliaisSelect
                                        label="Filial"
                                        id="filialSelect"
                                        codFilial={pneus_mov_filial}
                                        onChange={this.onInputChangeFilial}
                                        value={filialSelect}
                                        enabled={true}
                                    />

                                    <TextInput
                                        label="Pneu"
                                        id="pneus_mov_pneu"
                                        ref="pneus_mov_pneu"
                                        value={pneus_mov_pneu}
                                        maxLength={20}
                                        onChange={this.onInputChange}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Marca"
                                        id="pneus_cp_marca"
                                        ref="pneus_cp_marca"
                                        value={pneus_cp_marca}
                                        selectedValue=""
                                        options={marcaSelect}
                                        onChange={this.onInputChange}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Modelo"
                                        id="pneus_cp_modelo"
                                        ref="pneus_cp_modelo"
                                        value={pneus_cp_modelo}
                                        selectedValue=""
                                        options={modeloSelect}
                                        onChange={this.onInputChange}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Dimenssão"
                                        id="pneus_cp_dimenssao"
                                        ref="pneus_cp_dimenssao"
                                        value={pneus_cp_dimenssao}
                                        selectedValue=""
                                        options={dimenssaoSelect}
                                        onChange={this.onInputChange}
                                    />


                                    <Button
                                        title="FILTRAR"
                                        onPress={() => {
                                            this.onSearchPress(!this.state.modalFiltrosVisible)
                                        }}
                                        buttonStyle={{marginTop: 10}}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'filter',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />
                                    <Button
                                        title="FECHAR"
                                        onPress={() => {
                                            this.onClosePress(!this.state.modalFiltrosVisible)
                                        }}
                                        buttonStyle={{marginTop: 10}}
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
                    onPress={() => {
                        this.onSearchPress(true)
                    }}
                    backgroundColor={Colors.primary}
                    marginRight={10}
                />

                {
                    temFiltro
                        ? (
                            <FloatActionButton
                                iconFamily="MaterialIcons"
                                iconName="clear"
                                iconColor={Colors.textOnPrimary}
                                onPress={this.onClearSearchPress}
                                backgroundColor={Colors.primary}
                                marginRight={60}
                            />
                        ) : null
                }

                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />


            </SafeAreaView>

        )
    }
}
