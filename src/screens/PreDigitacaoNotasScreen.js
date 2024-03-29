import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, SafeAreaView, Modal, ScrollView } from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import HeaderComponent from "../components/HeaderComponent";
import TextInput from '../components/TextInput';
import { maskDate, maskValorMoeda } from '../utils/Maskers';
import Button from '../components/Button';
import { getFilial } from '../utils/LoginManager';
import Alert from '../components/Alert';
import NetInfo from '@react-native-community/netinfo';

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;
const DATE_FORMAT = 'DD/MM/YYYY';

const CardViewItem = ({ registro, onRegistroLongPress, onBaixarXML }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.estoq_nfpd_sit_nfe === 'PEN' ? "#d32f2f" : registro.estoq_nfpd_sit_nfe === 'BAI' ? "#DAA520" : Colors.primary }}>
                <TouchableOpacity
                    onLongPress={() => onRegistroLongPress(registro.estoq_nfpd_chave)}
                >
                    <View style={{ paddingLeft: 10, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 1.8, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                NFe {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_num_nfe}
                            </Text>
                        </View>
                        <View style={{ flex: 1.2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                {registro.estoq_nfpd_empresa === '1' ? 'EN' : registro.estoq_nfpd_empresa === '2' ? 'NT' : 'NS'}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Data {': '}
                            </Text>
                            <Text>
                                {moment(registro.estoq_nfpd_data).format('DD/MM/YYYY')}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 1.8, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Filial {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_filial}
                            </Text>
                        </View>
                        <View style={{ flex: 1.2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Sit {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_sit_nfe}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Valor {': '}
                            </Text>
                            <Text>
                                {maskValorMoeda(parseFloat(registro.estoq_nfpd_valor_nfe))}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Emit {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_cnpj_emit}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Dest {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_cnpj_dest}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Razão Social: {' '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_razao_social}
                            </Text>
                        </Text>
                    </View>

                    {registro.estoq_nfpd_nome ? (
                        <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                            <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Nome: {' '}
                                </Text>
                                <Text>
                                    {registro.estoq_nfpd_nome}
                                </Text>
                            </Text>
                        </View>
                    ) : null}

                    <Divider />

                    <View style={{ paddingLeft: 10, marginTop: 2, fontSize: 13 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Chave: {' '}
                            </Text>
                        </Text>
                    </View>
                    <View style={{ paddingLeft: 10, marginBottom: 5 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                            <Text style={{ fontSize: 13 }}>
                                {registro.estoq_nfpd_chave}
                            </Text>
                        </Text>
                    </View>


                    {registro.estoq_nfpd_sit_nfe === 'PEN' ? (
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
                                    onPress={() => onBaixarXML(registro)}
                                >
                                    <View style={{
                                        flex: 1,
                                        paddingVertical: 5,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center'

                                    }}>
                                        <Icon
                                            name='download'
                                            type='font-awesome'
                                            color="#10734a"
                                            size={22}
                                            containerStyle={{
                                                height: 10
                                            }}
                                        />
                                        <Text style={{
                                            color: "#10734a",
                                            fontSize: 14,
                                            marginLeft: 5,
                                        }}>
                                            Baixar XML NFe
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}


                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class PreDigitacaoNotasScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listaRegistros: [],
            refreshing: false,
            carregando: false,
            carregarMais: false,
            baixandoXML: false,
            pagina: 1,
            netStatus: 1,

            modalFiltrosVisible: false,
            dataIni: moment(moment().subtract(30, 'days')).format(DATE_FORMAT),
            // dataIni: moment(new Date()).format(DATE_FORMAT),
            dataFim: moment(new Date()).format(DATE_FORMAT),
            filial: '',
            nfe: '',
            cnpj: '',
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
        // getFilial().then(filial => {
        //     this.setState({
        //         filial,
        //         refreshing: false,
        //     }, this.getListaRegistros());
        // })
        this.setState({ refreshing: false });
        this.getListaRegistros();
    }



    getListaRegistros = () => {
        const { dataIni, dataFim, filial, nfe, cnpj, pagina, listaRegistros } = this.state;
        this.setState({ refreshing: true, });

        // console.log('getListaRegistros: ', dataIni)
        // console.log('getListaRegistros: ', dataFim)

        axios.get('/preDigitacaoNotas', {
            params: {
                page: pagina,
                limite: 10,
                dtIni: moment(dataIni, DATE_FORMAT).format("YYYY-MM-DD"),
                dtFim: moment(dataFim, DATE_FORMAT).format("YYYY-MM-DD"),
                filial,
                nfe,
                cnpj,
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

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }


    onAddPress = () => {
        this.props.navigation.navigate('PreDigitacaoNotaScreen', {
            estoq_nfpd_chave: '',
            onRefresh: this.onRefresh
        });
    }




    onRegistroLongPress = (estoq_nfpd_chave) => {
        Alert.showConfirm("Deseja excluir este registro?",
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(estoq_nfpd_chave),
                style: "destructive"
            }
        )
    }

    onExcluirRegistro = (estoq_nfpd_chave) => {
        this.setState({ refreshing: true });

        axios.delete('/preDigitacaoNotas/delete/' + estoq_nfpd_chave)
            .then(response => {

                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.estoq_nfpd_chave === estoq_nfpd_chave);
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


    onBaixarXML = (registro) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Não é possível baixar. Dispositivo sem conexão');
        } else {
            Alert.showConfirm("Baixar XML da NFe?",
                {
                    text: "Não",
                    style: "destructive"
                },
                {
                    text: "Sim",
                    onPress: () => this.onBaixarXMLNFe(registro),
                    style: "destructive"
                }
            )
        }
    }

    onBaixarXMLNFe = (registro) => {
        if (!this.state.netStatus) {
            Alert.showAlert('Não é possível baixar. Dispositivo sem conexão');
        } else {
            this.setState({ baixandoXML: true });

            const reg = {
                chave: registro.estoq_nfpd_chave,
                cpf_cnpj: registro.estoq_nfpd_cnpj_dest,
            };

            axios.get('/notasFiscais/buscaNFe', {
                params: {
                    chave: registro.estoq_nfpd_chave,
                    cpf_cnpj: registro.estoq_nfpd_cnpj_dest,
                }
            }).then(response => {

                Alert.showAlert('XML baixado com sucesso');

                this.setState({
                    baixandoXML: false
                }, this.getListaRegistros);

            }).catch(ex => {
                console.warn(ex, ex.response);
                this.setState({ baixandoXML: false });
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
                onRegistroLongPress={this.onRegistroLongPress}
                onBaixarXML={this.onBaixarXML}
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
        const { listaRegistros, dataIni, dataFim, filial, nfe, cnpj,
            refreshing, baixandoXML, } = this.state;

        return (
            <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'NFEs Pré-Digitadas'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.estoq_nfpd_chave)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />


                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="search"
                    iconColor={Colors.textOnPrimary}
                    onPress={() => { this.onSearchPress(true) }}
                    backgroundColor={Colors.primary}
                    // marginBottom={90}
                    marginRight={10}
                />

                {/* <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="add"
                    iconColor={Colors.textOnAccent}
                    onPress={this.onAddPress}
                    backgroundColor={Colors.primary}
                    marginRight={10}
                /> */}



                {/* ----------------------------- */}
                {/* MODAL PARA FILTROS            */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalFiltrosVisible}
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


                                    <TextInput
                                        label="Filial"
                                        id="filial"
                                        ref="filial"
                                        value={filial}
                                        maxLength={10}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                    <TextInput
                                        label="Numero NFe"
                                        id="nfe"
                                        ref="nfe"
                                        value={nfe}
                                        maxLength={10}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                    <TextInput
                                        label="CNPJ"
                                        id="cnpj"
                                        ref="cnpj"
                                        value={cnpj}
                                        maxLength={10}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />



                                    <Button
                                        title="FILTRAR"
                                        onPress={() => { this.onSearchPress(!this.state.modalFiltrosVisible) }}
                                        buttonStyle={{ marginTop: 10 }}
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
                                        buttonStyle={{ marginTop: 10 }}
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

                <ProgressDialog
                    visible={baixandoXML}
                    title="SIGA PRO"
                    message="Baixando XML da Nota. Aguarde..."
                />
            </SafeAreaView>
        )
    }
}
