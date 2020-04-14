import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    ActivityIndicator, ScrollView,
    PermissionsAndroid
} from 'react-native';
import { Icon, Card, Divider, CheckBox } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import GetLocation from 'react-native-get-location';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { maskDate } from '../utils/Maskers';
import Alert from '../components/Alert';

import VeiculosSelect from '../components/VeiculosSelect';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onRegistroPress, onSulcagemPress }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Pneu{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.pneus_mov_pneu}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Posição{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.pneus_mov_posicao}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Eixo{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.pneus_mov_eixo}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Marca{': '}
                    </Text>
                    <Text>
                        {registro.pneus_mar_descricao}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Modelo{': '}
                    </Text>
                    <Text>
                        {registro.pneus_mod_descricao}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Dimenssão{': '}
                    </Text>
                    <Text>
                        {registro.pneus_dim_descricao}
                    </Text>
                </View>

                <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Data{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {moment(registro.pneus_mov_data).format("DD/MM/YYYY")}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Vida{': '}
                        </Text>
                        <Text style={{ fontSize: 12, marginTop: 2 }}>
                            {registro.pneus_vd_vida === "0" ? 'NOVO' : registro.pneus_vd_vida + 'º VIDA'}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Km Vida{': '}
                        </Text>
                        <Text>
                            {registro.pneus_vd_km_vida}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        margin: 0,
                        marginTop: 5,
                        height: 40,
                        borderTopWidth: 1,
                        borderColor: Colors.dividerDark,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => onSulcagemPress(registro.pneus_mov_pneu, registro.pneus_vd_vida, registro.pneus_mov_posicao)}
                    >
                        <View style={{ width: 100, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='bars'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={17}
                            />
                            <Text style={{ color: Colors.primaryLight, fontSize: 13, marginLeft: 5 }} >
                                Sulcagem
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onRegistroPress(registro.pneus_mov_idf)}
                    >
                        <View style={{ width: 100, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='retweet'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                            <Text style={{ color: Colors.primaryLight, fontSize: 13, marginLeft: 5 }} >
                                Trocar Pneu
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View >
        </Card >
    )
}


export default class PneusVeiculosScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        veiculo_select: null,
        codVeiculo: '',

        pneus_os_data: '',
        pneus_os_longitude: '',
        pneus_os_longitude: '',
    };

    componentDidMount() {

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
                refreshing: true,
            }, this.getListaRegistros());
        }
    }

    onErroChange = msgErro => {
        this.setState({
            listaRegistros: [],
            msgErroVeiculo: msgErro,
        })
    }


    getListaRegistros = () => {
        const { veiculo_select, pagina, listaRegistros } = this.state;

        axios.get('/pneus/listaVeiculo', {
            params: {
                veiculo: veiculo_select.codVeic,
            }
        }).then(response => {

            this.setState({
                listaRegistros: response.data.dados,
                pneus_os_data: response.data.dataCheckIn,
                refreshing: false,
                carregando: false,
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

    onRegistroPress = (pneus_mov_idf) => {
        this.setState({ carregarRegistro: true });

        axios.get('/pneus/showMovPneu/' + pneus_mov_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });
                response.data.registro.tipoTela = 'VEIC';
                this.props.navigation.navigate('PneusTrocaScreen', {
                    registro: {
                        registro: response.data.registro,
                        // listaHistorico: response.data.listaHistorico,
                    },
                    onRefresh: this.onRefresh,
                });
            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
    }

    onSulcagemPress = (pneus_mov_pneu, pneus_vd_vida, pneus_mov_posicao) => {
        this.setState({ carregarRegistro: true });

        axios.get('/pneus/listaSulcagens', {
            params: {
                pneu: pneus_mov_pneu,
            }
        })
            .then(response => {
                this.setState({ carregarRegistro: false });
                this.props.navigation.navigate('PneusSulcagemScreen', {
                    listaHistorico: response.data,
                    tipoTela: 'VEIC',
                    pneus_sul_pneu: pneus_mov_pneu,
                    pneus_sul_vida: pneus_vd_vida,
                    pneus_sul_pos_veic: pneus_mov_posicao,
                    pneus_sul_veiculo: this.state.veiculo_select.codVeic,
                    onRefresh: this.onRefresh,
                });
            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
    }

    onCheckinPress = (pneus_mov_pneu) => {
        this.setState({ carregarRegistro: true });

        this.requestLocationPermission().then(() => {

            GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 30000,
            })
                .then(location => {

                    console.log('onCheckinPress1: ', location);

                    const registro = {
                        pneus_os_veiculo: this.state.veiculo_select.codVeic,
                        pneus_os_latitude: location.latitude,
                        pneus_os_longitude: location.longitude,
                    };

                    this.state.pneus_os_data = moment().format('YYYY-MM-DD HH:mm');

                    axios.put('/pneus/gravarOS', registro)
                        .then(response => {
                            this.setState({
                                carregarRegistro: false,
                                pneus_os_data: moment().format('YYYY-MM-DD HH:mm'),
                                pneus_os_latitude: location.latitude,
                                pneus_os_longitude: location.longitude,
                            });

                            // this.props.navigation.state.params.onRefresh();

                        }).catch(ex => {
                            const { response } = ex;
                            this.setState({ carregarRegistro: false });
                            if (response) {
                                // erro no servidor
                                Alert.showAlert('Não foi possível concluir a solicitação.');
                                // } else {
                                //     // sem internet
                                //     Alert.showAlert('Verifique sua conexão com a internet.');
                            }
                        })

                })
                .catch(ex => {
                    this.setState({ carregarRegistro: false });

                    const { code, message } = ex;
                    console.warn(ex, code, message);
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
                })

        })
    }

    requestLocationPermission = () => {
        if (OS === 'android') {
            return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        }
        navigator.geolocation.requestAuthorization();
        return Promise.resolve();
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

    renderItem = ({ item, index }) => {
        return (
            <RegistroItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
                onSulcagemPress={this.onSulcagemPress}
                onCheckinPress={this.onCheckinPress}
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
        this.setState({ modalFiltrosVisible: visible });
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }


    render() {
        const { listaRegistros, refreshing, carregarRegistro,
            veiculo_select, codVeiculo, pneus_os_data } = this.state;

        console.log('PneusVeiculosScreen.this.state: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                <View style={{ margin: 10, marginBottom: -10, padding: 0 }}>
                    <VeiculosSelect
                        label="Veículo"
                        id="veiculo_select"
                        value={veiculo_select}
                        codVeiculo={codVeiculo}
                        onChange={this.onInputChangeVeiculo}
                        onErro={this.onErroChange}
                        tipo=""
                    />

                    {veiculo_select && veiculo_select.codVeic ? (
                        <View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                    Data Check-in{': '}
                                </Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                    {moment(pneus_os_data).format('DD/MM/YYYY [às] HH:mm')}
                                </Text>
                            </View>

                            <Button
                                title="Check-in do Veículo"
                                loading={this.state.salvando}
                                onPress={this.onCheckinPress}
                                color={Colors.textOnPrimary}
                                buttonStyle={{ marginBottom: 30, marginTop: 10 }}
                                icon={{
                                    name: 'map-marker',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />
                        </View>
                    ) : null}
                </View>

                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.pneus_mov_pneu)}
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

            </View >

        )
    }
}