import React, {Component} from 'react';
import {
    View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator,
    ScrollView, Modal, PermissionsAndroid, SafeAreaView
} from 'react-native';

const {OS} = Platform;
import axios from 'axios';
import Alert from '../components/Alert';
import {Card, Divider, Icon} from 'react-native-elements';
import {ProgressDialog} from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import {maskDate} from '../utils/Maskers';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import NetInfo from '@react-native-community/netinfo';
import GetLocation from 'react-native-get-location';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";
import {verifyGeolocationActive, verifyLocationPermission} from "../components/getGeolocation";

moment.locale('pt-BR');

const DATE_FORMAT = 'DD/MM/YYYY';

const CardViewItem = ({registro, onRegistroPress, onRegistroLongPress, onCheckOutPress, onOSPress, onOcorrenciaPress}) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 10,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            elevation: 0,
        }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.adm_spcl_idf)}
                onLongPress={() => onRegistroLongPress(registro.adm_spcl_idf)}
            >

                <View style={{paddingLeft: 10, marginTop: 20, fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            #{registro.adm_spcl_idf}
                        </Text>
                    </View>
                    <View style={{flex: 4, flexDirection: 'row'}}>
                        {/* <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Data {': '}
                        </Text> */}
                        <Text>
                            {moment(registro.adm_spcl_data).format('DD/MM/YYYY')}
                            {/* {moment(registro.adm_spcl_data).format('DD/MM/YYYY [às] HH:mm')} */}
                        </Text>
                    </View>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Veículo {': '}
                        </Text>
                        <Text>
                            {registro.adm_spcl_veiculo}
                        </Text>
                    </View>
                </View>

                {registro.adm_spcl_escala ? (
                    <View style={{paddingLeft: 10, paddingVertical: 4, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Escala {': '}
                        </Text>
                        <Text>
                            {registro.adm_spcl_escala}
                        </Text>
                    </View>
                ) : null}

                {registro.adm_spcl_obs ? (
                    <View style={{paddingLeft: 20, paddingVertical: 4}}>
                        <Text style={{color: Colors.textPrimaryDark, fontSize: 15}}>
                            {registro.adm_spcl_obs}
                        </Text>
                    </View>
                ) : null}

                {/* <Divider /> */}

            </TouchableOpacity>

            <View
                style={{
                    flex: 1,
                    margin: 0,
                    marginLeft: 5,
                    marginTop: 10,
                    marginBottom: 5,
                    paddingTop: 15,
                    height: 60,
                    width: "95%",
                    borderTopWidth: 1,
                    borderColor: Colors.dividerDark,
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{
                        flex: 1,
                        marginTop: 5,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Icon
                            name='check-square-o'
                            type='font-awesome'
                            color="#10734a"
                            marginTop={2}
                            size={17}
                        />
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: "#10734a", fontSize: 12, marginTop: 1, marginBottom: 5}}>
                            Check-In
                        </Text>
                        <Text style={{color: "#10734a", fontSize: 10, marginTop: -5, marginBottom: 5}}>
                            {moment(registro.adm_spcl_data).format('DD/MM/YYYY HH:mm')}
                        </Text>
                    </View>
                </View>

                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity
                        onPress={() => onCheckOutPress(registro.adm_spcl_idf, registro.adm_spcl_local_checkout)}
                    >
                        <View style={{
                            flex: 1,
                            marginTop: 5,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Icon
                                name='share-square-o'
                                type='font-awesome'
                                color={registro.adm_spcl_checkout ? "#10734a" : "#d50000"}
                                marginTop={2}
                                size={17}
                            />
                        </View>
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{
                                color: registro.adm_spcl_checkout ? "#10734a" : "#d50000",
                                fontSize: 12,
                                marginTop: 1,
                                marginBottom: 5
                            }}>
                                Check-Out
                            </Text>
                            {registro.adm_spcl_checkout ? (
                                <Text style={{color: "#10734a", fontSize: 10, marginTop: -5, marginBottom: 5}}>
                                    {moment(registro.adm_spcl_checkout).format('DD/MM/YYYY HH:mm')}
                                </Text>
                            ) : null}
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{flex: 0.8, justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity
                        onPress={() => onOSPress(registro.adm_spcl_idf, registro.man_sp_obs, true)}
                    >
                        <View style={{
                            flex: 1,
                            marginTop: 5,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Icon
                                name='wrench'
                                type='font-awesome'
                                color={Colors.primaryDark}
                                marginTop={2}
                                size={17}
                            />
                        </View>
                        <Text style={{
                            color: Colors.primaryDark,
                            fontSize: 11,
                            marginTop: 5,
                            marginBottom: 5,
                            textDecorationLine: registro?.man_sp_obs ? 'underline' : 'none'
                        }}>
                            O.S.
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{flex: 0.8, justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity
                        onPress={() => onOcorrenciaPress(registro.adm_spcl_idf, registro.adm_spcl_ocorrencia, true)}
                    >
                        <View style={{
                            flex: 1,
                            marginTop: 5,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Icon
                                name='list-alt'
                                type='font-awesome'
                                color={Colors.primaryDark}
                                marginTop={2}
                                size={17}
                            />
                        </View>
                        <Text style={{
                            color: Colors.primaryDark,
                            fontSize: 11,
                            marginTop: 5,
                            marginBottom: 5,
                            textDecorationLine: registro?.adm_spcl_ocorrencia ? 'underline' : 'none'
                        }}>
                            Ocorrência
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </Card>
    )
}

export default class CheckListScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            listaRegistros: [],
            aguarde: false,
            refreshing: false,
            carregando: false,
            carregarMais: false,
            pagina: 1,
            netStatus: 1,
            dataIni: moment(moment().subtract(10, 'days')).format(DATE_FORMAT),
            dataFim: moment(new Date()).format(DATE_FORMAT),
            adm_spcl_veiculo: '',
            temFiltro: false,
            modalFiltrosVisible: false,
            modalOSVisible: false,
            man_sp_obs: '',
            modalOcorrenciaVisible: false,
            adm_spcl_idf: 0,
            adm_spcl_ocorrencia: '',
            loadingAdd: false,
            debounce: 0,
        };
        NetInfo.addEventListener(state => {
            this.onNetEvento(state)
        });
    }

    onNetEvento = (info) => {
        let state = this.state;
        // console.log('onNetEvento: ', info)
        if (info.isConnected) {
            state.netStatus = 1;
        } else {
            state.netStatus = 0;
        }
        this.setState(state);
    }

    componentDidMount() {
        this.setState({
                refreshing: true,
            },
            this.getListaRegistros()
        );
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    getListaRegistros = () => {
        const {adm_spcl_veiculo, dataIni, dataFim, pagina, listaRegistros} = this.state;
        axios.get('/checkList', {
            params: {
                tipoDig: 2,
                page: pagina,
                limite: 10,
                veic: adm_spcl_veiculo,
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

    onRegistroPress = (adm_spcl_idf) => {
        // console.log('onRegistroPress: ', adm_spcl_idf);

        this.setState({aguarde: true});
        axios.get('/checkList/show/' + adm_spcl_idf)
            .then(response => {
                this.setState({aguarde: false});

                // console.log('onRegistroPress: ', response.data);

                this.props.navigation.navigate('CheckListItemScreen', {
                    registro: {
                        ...response.data.dados,
                        listaRegistros: response.data.listaItens,
                    },
                    onRefresh: this.onRefresh
                });
            }).catch(ex => {
            this.setState({aguarde: false});
            console.warn(ex);
            console.warn(ex.response);
        });
    }

    onAddPress = async () => {

        this.setState({loadingAdd: true});

        // VERIFICA SE A PERMISAO DE GEOLOCATION ESTA ATIVADA OU NEGADA
        if (await verifyLocationPermission()) {
            Alert.showAlert("Acesso a geolocalização foi negada!");
            this.setState({loadingAdd: false});
            return;
        }


        if (await verifyGeolocationActive()) {
            Alert.showAlert("Geolocalização desativada!")
            this.setState({loadingAdd: false});
            return;
        }


        if (!this.state.netStatus) {
            Alert.showAlert('Dispositivo sem conexão');
        } else {
            // console.log('onAddPress');
            this.requestLocationPermission().then(() => {
                GetLocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 30000,
                })
                    .then(location => {
                        const local = String(location.latitude) + ',' + String(location.longitude);
                        // console.log('onAddPress: ', local);
                        this.setState({aguarde: false, loadingAdd: false});
                        this.props.navigation.navigate('CheckListItemScreen', {
                            registro: {
                                adm_spcl_idf: 0,
                                adm_spcl_local_checkin: local,
                            },
                            onRefresh: this.onRefresh
                        });
                    }).catch(ex => {
                    this.setState({aguarde: false, loadingAdd: false});
                    const {code, message} = ex;
                    console.warn(ex, code, message);
                    // console.log('requestLocationPermission: ', message)
                    // console.log('requestLocationPermission: ', code)
                    // console.log('requestLocationPermission: ', message)

                    if (message === 'Location not available') {
                        Alert.showAlert('Serviço de localização está desabilitado', () => {
                            GetLocation.openGpsSettings();
                        });
                    } else {
                        if (code === '1') {
                            // iOS
                            // Permission Denied or Location Disabled
                            // Android
                            // Location Disabled
                            Alert.showAlert('Serviço de localização está desabilitado', () => {
                                GetLocation.openGpsSettings();
                            });
                        }
                        if (code === '5') {
                            // Android
                            // Permission Denied
                            Alert.showAlert('Você precisa autorizar o usa de localização', () => {
                                GetLocation.openAppSettings();
                            });
                        }
                        if (code === '3') {
                            // Android and iOS
                            // Timeout
                            Alert.showAlert('Tempo esgotado para obter a localização');
                        }
                    }
                })
            })
        }
    }


    onRegistroLongPress = (adm_spcl_idf) => {
        Alert.showConfirm("Deseja excluir este registro?",
            {text: "Cancelar"},
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(adm_spcl_idf),
                style: "destructive"
            }
        )
    }

    onExcluirRegistro = (adm_spcl_idf) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Dispositivo sem conexão');
        } else {
            this.setState({aguarde: true});
            axios.delete('/checkList/delete/' + adm_spcl_idf)
                .then(response => {
                    const listaRegistros = [...this.state.listaRegistros];
                    const index = listaRegistros.findIndex(registro => registro.adm_spcl_idf === adm_spcl_idf);
                    listaRegistros.splice(index, 1);
                    this.setState({
                        listaRegistros,
                        aguarde: false
                    });
                }).catch(ex => {
                console.warn(ex);
                console.warn(ex.response);
                this.setState({aguarde: false});
            })
        }
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

    renderItem = ({item}) => {
        return (
            <CardViewItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
                onRegistroLongPress={this.onRegistroLongPress}
                onCheckOutPress={this.onCheckOutPress}
                onOSPress={this.onOSPress}
                onOcorrenciaPress={this.onOcorrenciaPress}
            />
        )
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


    requestLocationPermission = async () => {
        if (OS === 'android') {
            return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        }
        return;
    }


    onCheckOutPress = (adm_spcl_idf, adm_spcl_local_checkout) => {
        if (!adm_spcl_local_checkout) {
            if (!this.state.netStatus) {
                Alert.showAlert('Não é possível fazer Check-Out. Dispositivo sem conexão');
            } else {
                Alert.showConfirm("Fazer o Check-Out?",
                    {
                        text: "Não",
                        style: "destructive"
                    },
                    {
                        text: "Sim",
                        onPress: () => this.onGravarCheckOutPress(adm_spcl_idf),
                        style: "destructive"
                    }
                )
            }
        }
    }

    onGravarCheckOutPress = (adm_spcl_idf) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Não é possível salvar. Dispositivo sem conexão');
        } else {
            this.setState({aguarde: true});
            this.requestLocationPermission().then(() => {
                // console.log('requestLocationPermission');

                GetLocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 30000,
                })
                    .then(location => {
                        const local = String(location.latitude) + ',' + String(location.longitude);
                        // console.log('checkOutVerificaAPIGoogle: ', local);

                        axios.put(`/checkList/checkOut/${adm_spcl_idf}/${local}`)
                            .then(response => {
                                this.setState({
                                    aguarde: false
                                }, this.getListaRegistros);
                            }).catch(ex => {
                            console.warn(ex, ex.response);
                            this.setState({aguarde: false});
                        })
                    })
                    .catch(ex => {
                        this.setState({aguarde: false});
                        const {code, message} = ex;
                        console.warn(ex, code, message);
                        // console.log('requestLocationPermission: ', message)
                        // console.log('requestLocationPermission: ', code)
                        // console.log('requestLocationPermission: ', message)

                        if (message === 'Location not available') {
                            Alert.showAlert('Serviço de localização está desabilitado', () => {
                                GetLocation.openGpsSettings();
                            });
                        } else {
                            if (code === '1') {
                                // iOS
                                // Permission Denied or Location Disabled
                                // Android
                                // Location Disabled
                                Alert.showAlert('Serviço de localização está desabilitado', () => {
                                    GetLocation.openGpsSettings();
                                });
                            }
                            if (code === '5') {
                                // Android
                                // Permission Denied
                                Alert.showAlert('Você precisa autorizar o usa de localização', () => {
                                    GetLocation.openAppSettings();
                                });
                            }
                            if (code === '3') {
                                // Android and iOS
                                // Timeout
                                Alert.showAlert('Tempo esgotado para obter a localização');
                            }
                        }
                    })
            })
        }
    }


    // SETA AS VARIAVES NO MODAL ORDEM DE SERVICO
    onOSPress = (adm_spcl_idf, man_sp_obs, visible) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Dispositivo sem conexão');
        } else {
            this.setState({
                modalOSVisible: visible,
                adm_spcl_idf: adm_spcl_idf,
                man_sp_obs: man_sp_obs,
            });
        }
    };

    // SETA O UPDATE DA ORDEM DE SERVICO
    onOSPressPut = async (adm_spcl_idf, man_sp_obs, visible) => {
        try {
            if ((!visible) && (adm_spcl_idf) && (man_sp_obs)) {
                this.setState({aguarde: true});
                axios.put(`${"/checkList/ordemServico/" + adm_spcl_idf + "/" + man_sp_obs}`).then(response => {
                    this.setState({
                        aguarde: false,
                        modalOSVisible: false
                    }, this.getListaRegistros);

                }).catch(ex => {
                    Alert.showAlert(`${'ERROR ' + ex?.response?.status + ' ' + ex?.response?.data?.message?.slice(0, 50) + '...'} `)
                    console.log('ex response', ex.response);
                    this.setState({aguarde: false, modalOSVisible: false});
                })
            }
        } catch (error) {
            console.log('catch error', error);
        }
    };

    // SETA AS VARIAVES NO MODAL OCORRENCIA
    onOcorrenciaPress = (adm_spcl_idf, adm_spcl_ocorrencia, visible) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Dispositivo sem conexão');
        } else {
            this.setState({
                modalOcorrenciaVisible: visible,
                adm_spcl_idf: adm_spcl_idf,
                adm_spcl_ocorrencia: adm_spcl_ocorrencia,
            });
        }
    };

    // SETA O UPDATE DA OCORRENCIA
    onOcorrenciaPressPut = (adm_spcl_idf, adm_spcl_ocorrencia, visible) => {
        try {
            if (!this.state.netStatus) {
                Alert.showAlert('Dispositivo sem conexão');
            } else {
                if ((!visible) && (adm_spcl_idf) && (adm_spcl_ocorrencia)) {
                    this.setState({aguarde: true});
                    axios.put(`/checkList/ocorrencia/${adm_spcl_idf}/${adm_spcl_ocorrencia}`).then(response => {
                        this.setState({
                            aguarde: false,
                            modalOcorrenciaVisible: false,
                        }, this.getListaRegistros);
                    }).catch(ex => {
                        Alert.showAlert(`${'ERROR ' + ex?.response?.status + ' ' + ex?.response?.data?.message?.slice(0, 50) + '...'} `)
                        console.log('ex response', ex.response);
                        this.setState({aguarde: false, modalOcorrenciaVisible: false});
                    })
                }
            }
        } catch (error) {
            console.log('catch error', error);
        }
    };


    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------


    render() {
        const {
            listaRegistros, refreshing, aguarde,
            adm_spcl_veiculo, adm_spcl_idf, adm_spcl_ocorrencia, man_sp_obs,
            dataIni, dataFim, netStatus
        } = this.state;

        // console.log('CheckListScreen: ', this.state.netStatus);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Check-List dos Veículos'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

                {/*{netStatus ? null : (*/}
                {/*<Text style={{textAlign: 'center', color: '#d50000', marginTop: 2}}>*/}
                {/*Dispositivo sem conexão*/}
                {/*</Text>*/}
                {/*)}*/}

                <FlatList
                    style={{
                        backgroundColor: 'white'
                    }}
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{paddingBottom: 100}}
                    keyExtractor={registro => String(registro.adm_spcl_idf)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />


                {/* ----------------------------- */}
                {/* MODAL PARA ORDEM SERVIÇO      */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalOSVisible}
                    onRequestClose={() => {
                        console.log("Modal os FECHOU.")
                    }}
                    animationType={"fade"}
                    transparent={true}
                >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                        <View style={{
                            // flex: 1,
                            width: "90%",
                            // paddingTop: 30,
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
                                    }}>Ordem de Serviço</Text>
                                </View>

                                <View style={{marginTop: 4, paddingVertical: 10}}>
                                    <TextInput
                                        label="Descrição dos Serviços"
                                        id="man_sp_obs"
                                        ref="man_sp_obs"
                                        value={man_sp_obs}
                                        maxLength={200}
                                        onChange={this.onInputChange}
                                        multiline={true}
                                        height={100}
                                    />

                                    <Button
                                        title="SALVAR"
                                        onPress={() => this.onOSPressPut(adm_spcl_idf, man_sp_obs, false)}
                                        buttonStyle={{marginTop: 15, height: 35}}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'check',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />

                                    <Button
                                        title="FECHAR"
                                        onPress={() => this.setState({modalOSVisible: false})}
                                        buttonStyle={{marginTop: 15, height: 35}}
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


                {/* ----------------------------- */}
                {/* MODAL PARA OCORRENCIA         */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalOcorrenciaVisible}
                    onRequestClose={() => {
                        console.log("Modal OBS FECHOU.")
                    }}
                    animationType={"fade"}
                    transparent={true}
                >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                        <View style={{
                            // flex: 1,
                            width: "90%",
                            // paddingTop: 30,
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
                                    }}>Ocorrência</Text>
                                </View>

                                <View style={{marginTop: 4, paddingVertical: 10}}>
                                    <TextInput
                                        label="Ocorrência"
                                        id="adm_spcl_ocorrencia"
                                        ref="adm_spcl_ocorrencia"
                                        value={adm_spcl_ocorrencia}
                                        maxLength={200}
                                        onChange={this.onInputChange}
                                        multiline={true}
                                        height={100}
                                    />

                                    <Button
                                        title="SALVAR"
                                        onPress={() => {
                                            this.onOcorrenciaPressPut(adm_spcl_idf, adm_spcl_ocorrencia, false)
                                        }}
                                        buttonStyle={{marginTop: 15, height: 35}}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'check',
                                            type: 'font-awesome',
                                            color: Colors.textOnPrimary
                                        }}
                                    />

                                    <Button
                                        title="FECHAR"
                                        onPress={() => this.setState({modalOcorrenciaVisible: false})}
                                        buttonStyle={{marginTop: 15, height: 35}}
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


                {/* ----------------------------- */}
                {/* MODAL PARA FILTROS            */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalFiltrosVisible}
                    onRequestClose={() => {
                        console.log("Modal FILTROS FECHOU.")
                    }}
                    animationType={"fade"}
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
                                    }}>Filtrar</Text>
                                </View>

                                <View style={{marginTop: 4, paddingVertical: 10}}>

                                    <ScrollView style={{height: 50, width: "100%", marginBottom: 10}}>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{width: "47%", marginRight: 20}}>
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
                                            <View style={{width: "47%"}}>
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

                                    <TextInput
                                        label="Veículo"
                                        id="adm_spcl_veiculo"
                                        ref="adm_spcl_veiculo"
                                        value={adm_spcl_veiculo}
                                        maxLength={9}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                    <Button
                                        title="FILTRAR"
                                        onPress={() => {
                                            this.onSearchPress(!this.state.modalFiltrosVisible)
                                        }}
                                        buttonStyle={{marginTop: 15, height: 35}}
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
                                        buttonStyle={{marginTop: 10, height: 35}}
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
                    marginBottom={90}
                    marginRight={10}
                />

                <FloatActionButton
                    loading={this?.state?.loadingAdd}
                    disabled={this?.state?.loadingAdd}
                    iconFamily="MaterialIcons"
                    iconName="add"
                    iconColor={Colors.textOnAccent}
                    onPress={this.onAddPress}
                    backgroundColor={Colors.primary}
                    marginRight={10}
                />

                <ProgressDialog
                    visible={aguarde}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </SafeAreaView>
        )
    }
}
