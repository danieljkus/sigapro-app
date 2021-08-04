import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
const { OS } = Platform;

import axios from 'axios';
import { Card, Divider } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskDate } from '../utils/Maskers';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-BR');

const DATE_FORMAT = 'DD/MM/YYYY';

const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, marginLeft: 5, marginRight: 5, marginBottom: 2, marginTop: 3, borderRadius: 2, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.adm_spcl_idf)}
                onLongPress={() => onRegistroLongPress(registro.adm_spcl_idf)}
            >

                <View style={{ paddingLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Data {': '}
                        </Text>
                        <Text>
                            {moment(registro.adm_spcl_data).format('DD/MM/YYYY [às] HH:mm')}
                        </Text>
                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Veículo {': '}
                        </Text>
                        <Text>
                            {registro.adm_spcl_veiculo}
                        </Text>
                    </View>
                </View>

                <Divider />

                {registro.adm_spcl_obs ? (
                    <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                        <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                            {registro.adm_spcl_obs}
                        </Text>
                    </View>
                ) : null}

            </TouchableOpacity>

        </Card>
    )
}

export default class CheckListScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        dataIni: moment(moment().subtract(10, 'days')).format(DATE_FORMAT),
        dataFim: moment(new Date()).format(DATE_FORMAT),
        adm_spcl_veiculo: '',

        temFiltro: false,
        modalFiltrosVisible: false,
    };

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
        const { adm_spcl_veiculo, dataIni, dataFim, pagina, listaRegistros } = this.state;
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
        console.log('onRegistroPress: ', adm_spcl_idf);

        this.setState({ carregarRegistro: true });
        axios.get('/checkList/show/' + adm_spcl_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });

                console.log('onRegistroPress: ', response.data);

                this.props.navigation.navigate('CheckListItemScreen', {
                    registro: {
                        ...response.data.dados,
                        listaRegistros: response.data.listaItens,
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
        // console.log('onAddPress');

        this.props.navigation.navigate('CheckListItemScreen', {
            registro: {
                adm_spcl_idf: 0,
            },
            onRefresh: this.onRefresh
        });
    }

    onRegistroLongPress = (adm_spcl_idf) => {
        Alert.alert("Excluir registro", `Deseja excluir este Registro?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(adm_spcl_idf),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (adm_spcl_idf) => {
        this.setState({ refreshing: true });
        axios.delete('/checkList/delete/' + adm_spcl_idf)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.adm_spcl_idf === adm_spcl_idf);
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
            adm_spcl_veiculo, dataIni, dataFim, idf, numero, filialSelect } = this.state;

        // console.log('CheckListScreen: ', this.state);

        return (
            <View style={{ flex: 1, }}>
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.adm_spcl_idf)}
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
                            paddingTop: 10,
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

            </View>
        )
    }
}