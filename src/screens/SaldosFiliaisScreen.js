import React, {Component} from 'react';
import {
    View, Text, FlatList, Modal, Platform, TouchableOpacity, ActivityIndicator, SafeAreaView
} from 'react-native';
import {Icon, Card, SearchBar} from 'react-native-elements';
import {ProgressDialog} from 'react-native-simple-dialogs';
import axios from 'axios';
import Colors from '../values/Colors';
import {maskValorMoeda} from '../utils/Maskers';
import Button from '../components/Button';
import {maskDate} from '../utils/Maskers';
import Alert from '../components/Alert';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";

moment.locale('pt-BR');

const RegistroItem = ({registro, onBloquearTudoPress, onLiberarTudoPress, onLiberarDinPress, onLiberarReqPress}) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 7,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            elevation: 0,
        }}>
            <View style={{
                borderLeftWidth: 5,
                borderLeftColor: registro.pas_csf_situacao === 'B' ? '#b71c1c' : Colors.primary
            }}>
                <View style={{paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Filial{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {registro.pas_csf_filial}
                        </Text>
                    </View>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Situação{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {registro.pas_csf_situacao}
                        </Text>
                    </View>
                </View>

                <View style={{flexDirection: 'row', paddingLeft: 20}}>
                    <Text>
                        {registro.adm_fil_descricao}
                    </Text>
                </View>


                <View style={{paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Limite{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {maskValorMoeda(parseFloat(registro.pas_csf_valor_limite))}
                        </Text>
                    </View>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Bloqueio{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {registro.pas_csf_data_bloqueio ? moment(registro.pas_csf_data_bloqueio).format('DD/MM/YYYY') : ''}
                        </Text>
                    </View>
                </View>

                <View style={{paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Dinheiro{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {maskValorMoeda(parseFloat(registro.pas_csf_valor_bloqueio))}
                        </Text>
                    </View>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Requisição{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {maskValorMoeda(parseFloat(registro.pas_csf_valor_bloqueio_req))}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        margin: 0,
                        padding: 0,
                        marginTop: 5,
                        height: 35,
                        borderTopWidth: 1,
                        borderColor: Colors.dividerDark,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: 3, alignItems: 'center'}}>
                            <TouchableOpacity
                                onPress={() => onBloquearTudoPress(registro.pas_csf_filial)}
                            >
                                <View style={{marginTop: 10, flexDirection: 'row'}}>
                                    <Icon
                                        name='lock'
                                        type='font-awesome'
                                        color={Colors.primaryLight}
                                        size={17}
                                    />
                                    <Text style={{color: Colors.primaryLight, fontSize: 13, marginLeft: 5}}>
                                        Bloquear Tudo
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 3, alignItems: 'center'}}>
                            <TouchableOpacity
                                onPress={() => onLiberarTudoPress(registro.pas_csf_filial)}
                            >
                                <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center'}}>
                                    <Icon
                                        name='check'
                                        type='font-awesome'
                                        color={Colors.primaryLight}
                                        size={18}
                                    />
                                    <Text style={{color: Colors.primaryLight, fontSize: 13, marginLeft: 5}}>
                                        Liberar Tudo
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        margin: 0,
                        padding: 0,
                        marginTop: 5,
                        height: 40,
                        borderTopWidth: 1,
                        borderColor: Colors.dividerDark,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: 3, alignItems: 'center'}}>
                            <TouchableOpacity
                                onPress={() => onLiberarDinPress(registro.pas_csf_filial)}
                            >
                                <View style={{marginTop: 10, flexDirection: 'row'}}>
                                    <Icon
                                        name='money'
                                        type='font-awesome'
                                        color={Colors.primaryLight}
                                        size={17}
                                    />
                                    <Text style={{color: Colors.primaryLight, fontSize: 13, marginLeft: 5}}>
                                        Liberar Dinheiro
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 3, alignItems: 'center'}}>
                            <TouchableOpacity
                                onPress={() => onLiberarReqPress(registro.pas_csf_filial)}
                            >
                                <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center'}}>
                                    <Icon
                                        name='list-alt'
                                        type='font-awesome'
                                        color={Colors.primaryLight}
                                        size={18}
                                    />
                                    <Text style={{color: Colors.primaryLight, fontSize: 13, marginLeft: 5}}>
                                        Liberar Requisição
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </View>
        </Card>
    )
}


export default class SaldosFiliaisScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidMount() {
        this.setState({refreshing: true,});
        this.getListaRegistros();
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    getListaRegistros = () => {
        const {buscaNome, pagina, listaRegistros} = this.state;

        axios.get('/saldosFiliais', {
            params: {
                page: pagina,
                limite: 10,
                filial: buscaNome,
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
            console.warn(ex);
            console.warn(ex.response);
            this.setState({
                refreshing: false,
                carregando: false,
            });
        })
    }


    onBloquearTudoPress = (pas_csf_filial) => {
        this.setState({carregarRegistro: true});
        axios.put('/saldosFiliais/bloquearTudo/' + pas_csf_filial)
            .then(response => {
                this.setState({carregarRegistro: false, refreshing: true});
                this.getListaRegistros();
            }).catch(ex => {
            this.setState({carregarRegistro: false});
            console.warn(ex);
            console.warn(ex.response);
        });
    }

    onLiberarTudoPress = (pas_csf_filial) => {
        this.setState({carregarRegistro: true});
        axios.put('/saldosFiliais/liberarGeral/' + pas_csf_filial)
            .then(response => {
                this.setState({carregarRegistro: false, refreshing: true});
                this.getListaRegistros();
            }).catch(ex => {
            this.setState({carregarRegistro: false});
            console.warn(ex);
            console.warn(ex.response);
        });
    }


    onLiberarDinPress = (pas_csf_filial) => {
        this.setState({carregarRegistro: true});
        axios.put('/saldosFiliais/liberarDinheiro/' + pas_csf_filial)
            .then(response => {
                this.setState({carregarRegistro: false, refreshing: true});
                this.getListaRegistros();
            }).catch(ex => {
            this.setState({carregarRegistro: false});
            console.warn(ex);
            console.warn(ex.response);
        });
    }

    onLiberarReqPress = (pas_csf_filial) => {
        this.setState({carregarRegistro: true});
        axios.put('/saldosFiliais/liberarReq/' + pas_csf_filial)
            .then(response => {
                this.setState({carregarRegistro: false, refreshing: true});
                this.getListaRegistros();
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
                onBloquearTudoPress={this.onBloquearTudoPress}
                onLiberarTudoPress={this.onLiberarTudoPress}
                onLiberarDinPress={this.onLiberarDinPress}
                onLiberarReqPress={this.onLiberarReqPress}
            />
        )
    }

    onRefreshPress = (visible) => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onBuscaNome = (text) => {
        clearTimeout(this.buscaTimeout);
        this.setState({
            pagina: 1,
            refreshing: true,
            buscaNome: text,
        })
        this.buscaTimeout = setTimeout(() => {
            this.getListaRegistros();
        }, 1000);
    }


    render() {
        const {listaRegistros, refreshing, carregarRegistro} = this.state;

        // console.log('SaldosFiliaisScreen.this.state: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: '#1F829C', flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Saldo das Filiais'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <View style={{flex: 1, backgroundColor: Colors.background}}>
                    <SearchBar
                        placeholder="Buscar Filial"
                        lightTheme={true}
                        onChangeText={this.onBuscaNome}
                        inputStyle={{backgroundColor: 'white'}}
                        containerStyle={{backgroundColor: Colors.primaryLight}}
                    />

                    <FlatList

                        data={listaRegistros}
                        renderItem={this.renderItem}
                        contentContainerStyle={{paddingBottom: 100, backgroundColor: Colors.background}}
                        keyExtractor={registro => String(registro.pas_csf_filial)}
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

                </View>
            </SafeAreaView>

        )
    }
}
