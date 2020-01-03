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

const RegistroItem = ({ registro, somente_escala_filial, onRegistroPress, onRegistroLongPress }) => {
    return (

        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.man_ev_idf)}
                    onLongPress={() => onRegistroLongPress(registro.man_ev_idf)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Horário {': '}
                            </Text>
                            <Text>
                                {registro.pas_serv_sentido === 'I' ? registro.hora1 : registro.hora2}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Serviço {': '}
                            </Text>
                            <Text>
                                {registro.man_ev_servico}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Veículo {': '}
                            </Text>
                            <Text>
                                {registro.man_ev_veiculo}
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                        <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                            { registro.pas_sec_descricao_ini + ' a ' + registro.pas_sec_descricao_fim }
                            {/* {registro.pas_serv_sentido === 'I' ? (registro.sec1 + ' a ' + registro.sec2) : (registro.sec2 + ' a ' + registro.sec1)} */}
                        </Text>
                    </View>

                    {/* <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                        <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                            {registro.pas_serv_sentido + ' - ' + String(registro.mun1) + ' - ' + String(registro.mun2)}
                        </Text>
                    </View> */}

                    <Divider />

                    <View style={{ paddingLeft: 15, paddingVertical: 3, paddingBottom: 5 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 10 }}>
                            Grupo: {registro.man_ev_grupo}   {registro.man_eg_descricao}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class EscalaVeiculosScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        man_ev_data_ini: moment(new Date()).format(DATE_FORMAT),
        // man_ev_data_ini: '',
        man_ev_veiculo: '',
        man_ev_servico: '',
        man_ev_grupo: '',
        grupoSelect: [],
        somente_escala_filial: true,
        temFiltro: false,
        modalFiltrosVisible: false,
    };

    componentDidMount() {
        this.setState({ refreshing: true });
        this.getListaRegistros();
        this.buscaGrupo();
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
        const { man_ev_data_ini, man_ev_grupo, man_ev_servico, man_ev_veiculo,
            somente_escala_filial, pagina, listaRegistros } = this.state;

        const temFiltro = man_ev_grupo || man_ev_servico !== '' || man_ev_veiculo !== '';

        console.log('getListaRegistros: ', somente_escala_filial);

        axios.get('/escalaVeiculos', {
            params: {
                page: pagina,
                limite: 10,
                data: moment(man_ev_data_ini, DATE_FORMAT).format("YYYY-MM-DD"),
                veiculo: man_ev_veiculo,
                servico: man_ev_servico,
                grupo: man_ev_grupo,
                somente_escala_filial: somente_escala_filial ? 1 : 0,
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

    onRegistroPress = (man_ev_idf) => {
        this.setState({ carregarRegistro: true });

        axios.get('/escalaVeiculos/show/' + man_ev_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('registro: ', response.data);

                this.props.navigation.navigate('EscalaVeiculoScreen', {
                    registro: {
                        registro: response.data.registro,
                        qtdeComb: response.data.qtdeComb,
                        dataComb: response.data.dataComb,
                        filial: response.data.filial,
                        descFilial: response.data.descFilial,
                        listaHistorico: response.data.listaHistorico,
                    },
                    onRefresh: this.onRefresh
                });
            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
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
                somente_escala_filial={this.state.somente_escala_filial}
                onRegistroPress={this.onRegistroPress}
                onRegistroLongPress={this.onRegistroLongPress}
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

    onClearSearchPress = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
            temFiltro: false,
            man_ev_veiculo: '',
            man_ev_servico: '',
            man_ev_grupo: '',
        }, this.getListaRegistros);
    }

    onAntPress = () => {
        const { man_ev_data_ini } = this.state;
        const data = moment(man_ev_data_ini, DATE_FORMAT).format("YYYY-MM-DD");
        const dataNova = moment(data).subtract(1, 'days').format(DATE_FORMAT);
        // console.log('onAntPress: ', dataNova);
        this.setState({
            pagina: 1,
            refreshing: true,
            man_ev_data_ini: dataNova,
        }, this.getListaRegistros);
    }

    onProxPress = () => {
        const { man_ev_data_ini } = this.state;
        const data = moment(man_ev_data_ini, DATE_FORMAT).format("YYYY-MM-DD");
        const dataNova = moment(data).add(1, 'days').format(DATE_FORMAT);
        // console.log('onProxPress: ', dataNova);
        this.setState({
            pagina: 1,
            refreshing: true,
            man_ev_data_ini: dataNova,
        }, this.getListaRegistros);
    }


    buscaGrupo = () => {
        const { man_ev_grupo } = this.state;
        this.setState({ grupoSelect: [], man_ev_grupo: '' });
        axios.get('/escalaVeiculos/listaGrupos', {
        }).then(response => {
            const { data } = response;
            const grupoSelect = data.map(regList => {
                return {
                    key: regList.man_eg_codigo,
                    label: regList.man_eg_descricao
                }
            });
            grupoSelect.unshift({ key: 0, label: "Selecione um Grupo" });
            this.setState({
                grupoSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                grupoSelect: [{ label: "Grupo não encontrdo", key: 0 }],
            });
        })

    }


    render() {
        const { listaRegistros, refreshing, carregarRegistro, temFiltro, somente_escala_filial,
            man_ev_data_ini, man_ev_veiculo, man_ev_servico, man_ev_grupo, grupoSelect } = this.state;

        // console.log('man_ev_data_ini: ', man_ev_data_ini);
        // console.log('man_ev_data_ini: ', moment(man_ev_data_ini).format("YYYY-MM-DD"));

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                <View style={{ marginBottom: 3 }}>
                    <ScrollView style={{ height: 50, width: "100%", borderWidth: 1, borderColor: Colors.dividerDark }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 2 }}>
                            <View style={{ flex: 2, padding: 0 }}>
                                <Button
                                    title=""
                                    onPress={() => { this.onAntPress() }}
                                    backgroundColor={Colors.primaryLight}
                                    icon={{
                                        name: 'backward',
                                        type: 'font-awesome',
                                        color: Colors.textOnPrimary
                                    }}
                                />
                            </View>

                            <View style={{ flex: 5, padding: 0, paddingHorizontal: 20, borderWidth: 1, borderColor: Colors.dividerDark }}>
                                <Text style={{
                                    position: 'absolute',
                                    marginLeft: 20,
                                    fontSize: 12,
                                }}>
                                    {moment(moment(man_ev_data_ini, DATE_FORMAT).format("YYYY-MM-DD")).format("dddd")}
                                </Text>
                                <TextInput
                                    type="date"
                                    label=" "
                                    id="man_ev_data_ini"
                                    ref="man_ev_data_ini"
                                    value={man_ev_data_ini}
                                    masker={maskDate}
                                    dateFormat={DATE_FORMAT}
                                    onChange={this.onInputChangeData}
                                    borderWidth={0}
                                    fontSize={20}
                                />
                            </View>

                            <View style={{ flex: 2, padding: 0 }}>
                                <Button
                                    title=""
                                    onPress={() => { this.onProxPress() }}
                                    backgroundColor={Colors.primaryLight}
                                    icon={{
                                        name: 'forward',
                                        type: 'font-awesome',
                                        color: Colors.textOnPrimary
                                    }}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>

                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyExtractor={registro => String(registro.man_ev_idf)}
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
                                    }}>Filtrar Escala</Text>
                                </View>

                                <View style={{ marginTop: 4, paddingVertical: 10 }}>

                                    <TextInput
                                        label="Veículo"
                                        id="man_ev_veiculo"
                                        ref="man_ev_veiculo"
                                        value={man_ev_veiculo}
                                        maxLength={20}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                    <TextInput
                                        label="Serviço"
                                        id="man_ev_servico"
                                        ref="man_ev_servico"
                                        value={man_ev_servico}
                                        maxLength={20}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                    <TextInput
                                        type="select"
                                        label="Grupo"
                                        id="man_ev_grupo"
                                        ref="man_ev_grupo"
                                        value={man_ev_grupo}
                                        selectedValue=""
                                        options={grupoSelect}
                                        onChange={this.onInputChange}
                                    />

                                    <CheckBox
                                        title='Somente escala da sua filial'
                                        key={somente_escala_filial}
                                        checked={somente_escala_filial}
                                        onPress={() => this.setState({ somente_escala_filial: !somente_escala_filial })}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />

                                    <Button
                                        title="FILTRAR"
                                        onPress={() => { this.onSearchPress(!this.state.modalFiltrosVisible) }}
                                        buttonStyle={{ marginTop: 15 }}
                                        backgroundColor={Colors.buttonPrimary}
                                        icon={{
                                            name: 'filter',
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
                    iconName="cached"
                    iconColor={Colors.textOnPrimary}
                    onPress={this.onRefreshPress}
                    backgroundColor={Colors.primary}
                    marginBottom={90}
                    marginRight={10}
                />

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