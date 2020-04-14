import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Icon, Card, Divider, CheckBox } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { maskDate } from '../utils/Maskers';

import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onRegistroPress }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <TouchableOpacity
                    // onPress={() => onRegistroPress(registro.adm_vei_idf)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                Veículo{': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                {registro.adm_vei_idf}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Placa{': '}
                            </Text>
                            <Text style={{ fontSize: 12, marginTop: 2 }}>
                                {registro.adm_vei_placa}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Lotação{': '}
                            </Text>
                            <Text>
                                {registro.adm_vei_lotacao_sentado}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Local{': '}
                        </Text>
                        <Text>
                            {registro.adm_veiloc_descricao}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Espécie{': '}
                        </Text>
                        <Text>
                            {registro.adm_veiesp_descricao}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Tipo{': '}
                        </Text>
                        <Text>
                            {registro.adm_veitp_descricao}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 7 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Motor{': '}
                        </Text>
                        <Text>
                            {registro.adm_veimotor_descricao}
                        </Text>
                    </View>

                    <Divider />

                    <Text style={{ paddingLeft: 10, marginTop: 7, fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                        Última O.S Aberta na Matriz
                    </Text>
                    <View style={{ paddingLeft: 10, marginBottom: 7, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 3, flexDirection: 'row', paddingLeft: 10 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Nº{': '}
                            </Text>
                            <Text>
                                {registro.num_ult_os}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Data{': '}
                            </Text>
                            <Text style={{ fontSize: 12, marginTop: 2 }}>
                                {moment(registro.data_ult_os).format("DD/MM/YYYY")}
                            </Text>
                        </View>
                        {/* <View style={{ flex: 3, flexDirection: 'row', fontSize: 10 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Dias {': '}
                            </Text>
                            <Text>
                                {registro.data_ult_os}
                            </Text>
                        </View> */}
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Situação{': '}
                            </Text>
                            <Text>
                                {registro.sit_ult_os === 'F' ? 'FIN' : 'ABE'}
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ paddingHorizontal: 10, marginVertical: 7 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Localização Atual{': '}
                        </Text>
                        <Text style={{ paddingLeft: 10 }}>
                            {renderLocalizacao(registro.fil_fim, registro.desc_fil_fim, registro.sentido, registro.servico, registro.rota, registro.sec1, registro.sec2, registro.hora1, registro.hora2)}
                        </Text>
                    </View>

                </TouchableOpacity>
            </View >
        </Card >
    )
}

const renderLocalizacao = (fil_fim, desc_fil_fim, sentido, servico, rota, sec1, sec2, hora1, hora2) => {
    if (fil_fim) {
        return 'FILIAL: ' + fil_fim + ' - ' + desc_fil_fim;
    } else {
        if (servico) {
            return 'VIAGEM ROTA: ' + rota + '   SERVIÇO: ' + servico + ' - ' + (sentido === 'I' ? (sec1 + ' a ' + sec2 + ' [' + hora1 + ']') : (sec2 + ' a ' + sec1 + ' [' + hora2 + ']'));
        } else {
            return rota ? 'VIAGEM ROTA: ' + rota : '';
        }
    }
};


export default class VeiculosScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        adm_vei_idf: '',
        adm_veiloc_codigo: '',
        adm_veiesp_codigo: '',
        adm_veitp_codigo: '',
        adm_veimotor_codigo: '',
        localSelect: [],
        especieSelect: [],
        tipoSelect: [],
        motorSelect: [],
        temFiltro: false,
        modalFiltrosVisible: false,
    };

    componentDidMount() {
        this.setState({ refreshing: true });
        this.getListaRegistros();
        this.buscaLocal();
        this.buscaEspecie();
        this.buscaTipo();
        this.buscaMotor();
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeData = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }



    getListaRegistros = () => {
        const { adm_vei_idf, adm_veiloc_codigo, adm_veiesp_codigo, adm_veitp_codigo, adm_veimotor_codigo,
            pagina, listaRegistros } = this.state;

        const temFiltro = adm_vei_idf !== '' || adm_veiloc_codigo !== '' || adm_veiesp_codigo !== '' || adm_veitp_codigo !== '' || adm_veimotor_codigo !== '';

        axios.get('/escalaVeiculos/listaVeiculos', {
            params: {
                page: pagina,
                limite: 10,
                veiculo: adm_vei_idf,
                local: adm_veiloc_codigo,
                especie: adm_veiesp_codigo,
                tipo: adm_veitp_codigo,
                motor: adm_veimotor_codigo,
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

    onClosePress = (visible) => {
        this.setState({ modalFiltrosVisible: visible });
    }

    onClearSearchPress = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
            temFiltro: false,
            adm_vei_idf: '',
            adm_veiloc_codigo: '',
            adm_veiesp_codigo: '',
            adm_veitp_codigo: '',
            adm_veimotor_codigo: '',
        }, this.getListaRegistros);
    }


    buscaLocal = () => {
        this.setState({ localSelect: [], adm_veiloc_codigo: '' });
        axios.get('/listaLocalizacoes', {
        }).then(response => {
            const { data } = response;
            const localSelect = data.map(regList => {
                return {
                    key: regList.adm_veiloc_codigo,
                    label: regList.adm_veiloc_descricao
                }
            });
            localSelect.unshift({ key: 0, label: "Selecione uma Localização" });
            this.setState({
                localSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                localSelect: [{ label: "Localização não encontrdo", key: 0 }],
            });
        })

    }

    buscaEspecie = () => {
        this.setState({ especieSelect: [], adm_veiesp_codigo: '' });
        axios.get('/listaEspecies', {
        }).then(response => {
            const { data } = response;
            const especieSelect = data.map(regList => {
                return {
                    key: regList.adm_veiesp_codigo,
                    label: regList.adm_veiesp_descricao
                }
            });
            especieSelect.unshift({ key: 0, label: "Selecione uma Espécie" });
            this.setState({
                especieSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                especieSelect: [{ label: "Espécie não encontrda", key: 0 }],
            });
        })

    }

    buscaTipo = () => {
        this.setState({ tipoSelect: [], adm_veitp_codigo: '' });
        axios.get('/listaTipos', {
        }).then(response => {
            const { data } = response;
            const tipoSelect = data.map(regList => {
                return {
                    key: regList.adm_veitp_codigo,
                    label: regList.adm_veitp_descricao
                }
            });
            tipoSelect.unshift({ key: 0, label: "Selecione um Tipo" });
            this.setState({
                tipoSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                tipoSelect: [{ label: "Tipo não encontrdo", key: 0 }],
            });
        })

    }

    buscaMotor = () => {
        this.setState({ motorSelect: [], adm_veimotor_codigo: '' });
        axios.get('/listaMotores', {
        }).then(response => {
            const { data } = response;
            const motorSelect = data.map(regList => {
                return {
                    key: regList.adm_veimotor_codigo,
                    label: regList.adm_veimotor_descricao
                }
            });
            motorSelect.unshift({ key: 0, label: "Selecione um Motor" });
            this.setState({
                motorSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                motorSelect: [{ label: "Motor não encontrdo", key: 0 }],
            });
        })

    }



    render() {
        const { listaRegistros, refreshing, carregarRegistro, temFiltro,
            adm_vei_idf, adm_veiloc_codigo, adm_veiesp_codigo, adm_veitp_codigo, adm_veimotor_codigo,
            localSelect, especieSelect, tipoSelect, motorSelect } = this.state;

        // console.log('adm_vei_idf: ', this.state.adm_vei_idf);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>


                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.adm_vei_idf)}
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
                    onRequestClose={() => { console.log("Modal FILTROS FECHOU.") }}
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
                            flex: 1,
                            width: "90%",
                            paddingTop: 100,
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
                                    }}>Filtrar Veículos</Text>
                                </View>

                                <View style={{ marginTop: 4, paddingVertical: 10 }}>

                                    <TextInput
                                        label="Veículo"
                                        id="adm_vei_idf"
                                        ref="adm_vei_idf"
                                        value={adm_vei_idf}
                                        maxLength={20}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                    <TextInput
                                        type="select"
                                        label="Localização"
                                        id="adm_veiloc_codigo"
                                        ref="adm_veiloc_codigo"
                                        value={adm_veiloc_codigo}
                                        selectedValue=""
                                        options={localSelect}
                                        onChange={this.onInputChange}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Espécie"
                                        id="adm_veiesp_codigo"
                                        ref="adm_veiesp_codigo"
                                        value={adm_veiesp_codigo}
                                        selectedValue=""
                                        options={especieSelect}
                                        onChange={this.onInputChange}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Tipo"
                                        id="adm_veitp_codigo"
                                        ref="adm_veitp_codigo"
                                        value={adm_veitp_codigo}
                                        selectedValue=""
                                        options={tipoSelect}
                                        onChange={this.onInputChange}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Motor"
                                        id="adm_veimotor_codigo"
                                        ref="adm_veimotor_codigo"
                                        value={adm_veimotor_codigo}
                                        selectedValue=""
                                        options={motorSelect}
                                        onChange={this.onInputChange}
                                    />


                                    <Button
                                        title="FILTRAR"
                                        onPress={() => { this.onSearchPress(!this.state.modalFiltrosVisible) }}
                                        buttonStyle={{ marginTop: 15, height: 35 }}
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
                                        buttonStyle={{ marginTop: 10, height: 35 }}
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


            </View >

        )
    }
}