import React, { Component } from 'react';
import {
    View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator,
    ScrollView, Modal, PermissionsAndroid, SafeAreaView, Pressable, KeyboardAvoidingView
} from 'react-native';

const { OS } = Platform;
import axios from 'axios';
import Alert from '../components/Alert';
import { Card, Divider, Icon, CheckBox } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskDate } from '../utils/Maskers';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import NetInfo from '@react-native-community/netinfo';
import GetLocation from 'react-native-get-location';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";
import { verifyGeolocationActive, verifyLocationPermission } from "../components/getGeolocation";

moment.locale('pt-BR');

const DATE_FORMAT = 'DD/MM/YYYY';

const CardViewItem = ({ registro, onRegistroPress, onCheckPress }) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 10,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            elevation: 0,
        }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.adm_spcli_situacao === 'SIM' ? "#10734a" : "#d32f2f" }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.adm_spcl_idf)}
                >

                    <View style={{ paddingLeft: 10, marginTop: 10, fontSize: 13, flexDirection: 'row', display: 'flex' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, width: 65 }} numberOfLines={1}>
                                #{registro.adm_spcl_idf}
                            </Text>
                        </View>
                        <View style={{ flex: 4, flexDirection: 'row', paddingLeft: '5%' }}>
                            <Text>
                                {moment(registro.adm_spcl_data).format('DD/MM/YYYY [às] HH:mm')}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row', paddingRight: '5%' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Veículo {': '}
                            </Text>
                            <Text>
                                {registro.adm_spcl_veiculo}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 20, paddingVertical: 4, paddingBottom: 5 }}>
                        <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                            {registro.perfil_check} - {registro.adm_pes_nome}
                        </Text>
                        {registro.adm_spcl_obs ? (
                            <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                                OBS - {registro.adm_spcl_obs}
                            </Text>
                        ) : null}
                    </View>

                    <Divider />

                    <View style={{ paddingLeft: 10, paddingVertical: 7 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }}>
                            Check-List - {registro.adm_spcli_check}
                        </Text>
                        <Text style={{ paddingLeft: 20, color: Colors.textPrimaryDark, fontSize: 15 }}>
                            {registro.adm_spicl_descricao}
                        </Text>
                        {registro.adm_spcli_obs ? (
                            <Text style={{ paddingLeft: 20, color: Colors.textPrimaryDark, fontSize: 15 }}>
                                OBS - {registro.adm_spcli_obs}
                            </Text>
                        ) : null}
                    </View>
                </TouchableOpacity>

                {registro.adm_spcli_check === 'NC' ? (
                    <View
                        style={{
                            flex: 1,
                            paddingVertical: 5,
                            borderTopWidth: 1,
                            borderColor: Colors.dividerDark,
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}
                    >

                        <View style={{ flex: 1, }}>
                            <TouchableOpacity
                                onPress={() => onCheckPress(registro.adm_spcl_idf, registro.adm_spcli_item, registro.adm_spcli_situacao)}
                            >
                                <View style={{
                                    flex: 1,
                                    paddingVertical: 5,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center'

                                }}>
                                    <Icon
                                        name={registro.adm_spcli_situacao === 'SIM' ? 'check-circle' : 'times-circle'}
                                        type='font-awesome'
                                        color={registro.adm_spcli_situacao === 'SIM' ? "#10734a" : "#d32f2f"}
                                        size={22}
                                        containerStyle={{
                                            height: 10
                                        }}
                                    />
                                    <Text style={{
                                        color: registro.adm_spcli_situacao === 'SIM' ? "#10734a" : "#d32f2f",
                                        fontSize: 14,
                                        marginLeft: 5,
                                    }}>
                                        {registro.adm_spcli_situacao === 'SIM' ? 'Desmarcar Checagem' : 'Marcar Checagem'}
                                    </Text>
                                    {registro.adm_spcli_data_checagem ? (
                                        <Text style={{ color: "#10734a", fontSize: 13, marginLeft: 10 }}>
                                            {moment(registro.adm_spcli_data_checagem).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

            </View>
        </Card>
    )
}

export default class CheckListConferenciaScreen extends Component {

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
            adm_spcl_idf: 0,
            adm_spcl_veiculo: '',
            temFiltro: false,
            modalFiltrosVisible: false,
            loadingAdd: false,

            checkConforme: false,
            checkNaoConforme: true,
            checkNaoAplica: false,
            checkChecado: false,
            checkNaoChecado: true,
        };
        NetInfo.addEventListener(state => {
            this.onNetEvento(state)
        });
    }

    onNetEvento = (info) => {
        let state = this.state;
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
        const { adm_spcl_veiculo, checkConforme, checkNaoConforme, checkNaoAplica, checkChecado, checkNaoChecado, dataIni, dataFim,
            pagina, listaRegistros } = this.state;

        const param = {
            page: pagina,
            limite: 10,
            checagem: 1,
            checkConforme: checkConforme ? 'CO' : '',
            checkNaoConforme: checkNaoConforme ? 'NC' : '',
            checkNaoAplica: checkNaoAplica ? 'NA' : '',
            checkChecado: checkChecado ? 'SIM' : '',
            checkNaoChecado: checkNaoChecado ? 'NAO' : '',
            veic: String(adm_spcl_veiculo),
        }

        // console.log('getListaRegistros ---------------------------------------------------------------------- ')
        // console.log('getListaRegistros: ', param)

        axios.get('/checkList/listaItens', { params: param })
            .then(response => {

                // console.log('getListaRegistros: ', response.data)

                const novosRegistros = pagina === 1
                    ? response.data.data
                    : listaRegistros.concat(response.data.data);
                const total = response.data.total;
                this.setState({
                    listaRegistros: novosRegistros,
                    refreshing: false,
                    carregando: false,
                    carregarMais: novosRegistros && novosRegistros.length < total,
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
        this.setState({ aguarde: true });
        axios.get('/checkList/show/' + adm_spcl_idf)
            .then(response => {
                this.setState({ aguarde: false });
                this.props.navigation.navigate('CheckListItemScreen', {
                    registro: {
                        ...response.data.dados,
                        listaRegistros: response.data.listaItens,
                    },
                    onRefresh: this.onRefresh
                });
            }).catch(ex => {
                this.setState({ aguarde: false });
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
                onCheckPress={this.onCheckPress}
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


    requestLocationPermission = async () => {
        if (OS === 'android') {
            return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        }
        return;
    }


    onCheckPress = (adm_spcl_idf, adm_spcli_item, adm_spcli_situacao) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Não é possível fazer Check-Out. Dispositivo sem conexão');
        } else {
            Alert.showConfirm("Confirma checagem?",
                {
                    text: "Não",
                    style: "destructive"
                },
                {
                    text: "Sim",
                    onPress: () => this.onGravarCheckPress(adm_spcl_idf, adm_spcli_item, adm_spcli_situacao),
                    style: "destructive"
                }
            )
        }
    }

    onGravarCheckPress = (adm_spcl_idf, adm_spcli_item, adm_spcli_situacao) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Não é possível salvar. Dispositivo sem conexão');
        } else {
            this.setState({ aguarde: true });

            const registro = {
                adm_spcl_idf: adm_spcl_idf,
                adm_spcli_item: adm_spcli_item,
                adm_spcli_situacao: adm_spcli_situacao === 'SIM' ? 'NAO' : 'SIM',
            };

            axios.put('/checkList/mudaSituacao', registro)
                .then(response => {
                    this.setState({
                        refreshing: true,
                        aguarde: false
                    });

                    this.getListaRegistros();
                }).catch(ex => {
                    console.warn(ex, ex.response);
                    this.setState({ aguarde: false });
                })
        }
    }






    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------


    render() {
        const {
            listaRegistros, refreshing, aguarde, adm_spcl_veiculo,
            checkConforme, checkNaoConforme, checkNaoAplica, checkChecado, checkNaoChecado,
            conforme, naoConforme, naoAplica, checado, naoChecado,
            dataIni, dataFim, netStatus
        } = this.state;

        // console.log('CheckListConferenciaScreen: ', this.state.netStatus);

        return (
            <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Check-List - Conferência'}
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
                        backgroundColor: Colors.backgroundColor
                    }}
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.adm_spcl_idf) + '_' + String(registro.adm_spcli_item)}
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
                    <Pressable onPress={() => this.setState({ modalFiltrosVisible: false })} style={{
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

                                <View style={{ backgroundColor: Colors.primary, flexDirection: 'row' }}>
                                    <Text style={{
                                        color: Colors.textOnPrimary,
                                        marginTop: 15,
                                        marginBottom: 15,
                                        marginLeft: 16,
                                        textAlign: 'center',
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        height: 30,
                                    }}>Filtrar</Text>
                                </View>

                                <View style={{ marginTop: 4, paddingVertical: 10 }}>

                                    <View>
                                        <CheckBox
                                            title='Em Conforme'
                                            key={conforme}
                                            checked={checkConforme}
                                            onPress={() => this.setState({ checkConforme: !checkConforme })}
                                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                        />

                                        <CheckBox
                                            title='Não Conforme'
                                            key={naoConforme}
                                            checked={checkNaoConforme}
                                            onPress={() => this.setState({ checkNaoConforme: !checkNaoConforme })}
                                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                        />
                                        <CheckBox
                                            title='Não se Aplica'
                                            key={naoAplica}
                                            checked={checkNaoAplica}
                                            onPress={() => this.setState({ checkNaoAplica: !checkNaoAplica })}
                                            containerStyle={{ padding: 0, margin: 0, marginBottom: 20, backgroundColor: 'transparent' }}
                                        />
                                    </View>

                                    <View>
                                        <CheckBox
                                            title='Checado'
                                            key={checado}
                                            checked={checkChecado}
                                            onPress={() => this.setState({ checkChecado: !checkChecado })}
                                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                        />
                                        <CheckBox
                                            title='Não Checado'
                                            key={naoChecado}
                                            checked={checkNaoChecado}
                                            onPress={() => this.setState({ checkNaoChecado: !checkNaoChecado })}
                                            containerStyle={{ padding: 0, margin: 0, marginBottom: 20, backgroundColor: 'transparent' }}
                                        />
                                    </View>


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
                                        buttonStyle={{ marginTop: 15 }}
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
                                        buttonStyle={{ marginTop: 15 }}
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
                    </Pressable>
                </Modal>



                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="cached"
                    iconColor={Colors.textOnPrimary}
                    onPress={this.onRefresh}
                    backgroundColor={Colors.primary}
                    marginBottom={90}
                />

                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="search"
                    iconColor={Colors.textOnPrimary}
                    onPress={() => {
                        this.onSearchPress(true)
                    }}
                    backgroundColor={Colors.primary}
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
