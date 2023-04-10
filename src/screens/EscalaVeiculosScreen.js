import React, { Component } from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView, SafeAreaView, DatePickerIOS
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
import HeaderComponent from "../components/HeaderComponent";

moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onRegistroPress, man_ev_veiculo }) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 7,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            elevation: 0,
        }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.veic1 ? Colors.primary : "#d32f2f" }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro)}
                >
                    {man_ev_veiculo === '' ? null : (
                        <View style={{
                            paddingLeft: 10,
                            marginBottom: 5,
                            marginTop: 5,
                            fontSize: 13,
                            flexDirection: 'row'
                        }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                {moment(registro.pas_via_data_viagem).format("DD/MM/YYYY")}
                            </Text>
                        </View>
                    )}

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Horário {': '}
                            </Text>
                            <Text>
                                {registro.pas_via_servico_extra ? registro.pas_ext_horario_extra : (registro.hora_fim ? registro.hora_ini : registro.hora_ini + ' / ' + registro.hora_fim)}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Serviço {': '}
                            </Text>
                            <Text>
                                {registro.pas_via_servico_extra ? registro.pas_via_servico_extra : registro.pas_via_servico}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Veículo {': '}
                            </Text>
                            <Text>
                                {registro.veic1 ? registro.veic1 : registro.veic2}
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                        <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                            {registro.pas_via_servico_extra ? (registro.desc_sec_ini_extra + ' a ' + registro.desc_sec_fim_extra) : (registro.desc_sec_ini + ' a ' + registro.desc_sec_fim)}
                        </Text>
                    </View>

                    {registro.motorista ? (
                        <View>
                            <Divider />
                            <View style={{ paddingLeft: 10, paddingVertical: 4, marginRight: 50, flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                    Motorista {': '}
                                </Text>
                                <Text>
                                    {registro.motorista}
                                </Text>
                            </View>
                        </View>
                    ) : null}


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
        man_ev_veiculo: '',
        man_ev_servico: '',
        man_ev_od: '',
        somente_escala_filial: true,
        temFiltro: false,
        modalFiltrosVisible: false,
    };

    componentDidMount() {
        this.setState({ refreshing: true });
        this.getListaRegistros();
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
        const {
            man_ev_data_ini, man_ev_servico, man_ev_veiculo, man_ev_od,
            somente_escala_filial, pagina, listaRegistros
        } = this.state;

        const temFiltro = man_ev_servico !== '' || man_ev_veiculo !== '' || man_ev_od !== '';

        // this.setState({ refreshing: true });

        axios.get('/escalaVeiculos', {
            params: {
                page: pagina,
                limite: 10,
                data: moment(man_ev_data_ini, DATE_FORMAT).format("YYYY-MM-DD"),
                veiculo: man_ev_veiculo,
                servico: man_ev_servico,
                cidade: man_ev_od,
                somente_escala_filial: somente_escala_filial ? 1 : 0,
            }
        }).then(response => {

            this.setState({
                listaRegistros: response.data,
                refreshing: false,
                carregando: false,
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

    onRegistroPress = (registro) => {
        this.props.navigation.navigate('EscalaVeiculoScreen', {
            registro: {
                registro: registro,
            },
            onRefresh: this.onRefresh
        });
    }

    carregarMaisRegistros = () => {
        // const { carregarMais, refreshing, carregando, pagina } = this.state;
        // if (carregarMais && !refreshing && !carregando) {
        //     this.setState({
        //         carregando: true,
        //         pagina: pagina + 1,
        //     }, this.getListaRegistros);
        // }
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
                man_ev_veiculo={this.state.man_ev_veiculo}
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

    onClearSearchPress = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
            temFiltro: false,
            man_ev_veiculo: '',
            man_ev_servico: '',
            somente_escala_filial: true,
        }, this.getListaRegistros);
    }

    onAntPress = () => {
        const { man_ev_data_ini } = this.state;
        const data = moment(man_ev_data_ini, DATE_FORMAT).format("YYYY-MM-DD");
        const dataNova = moment(data).subtract(1, 'days').format(DATE_FORMAT);
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
        this.setState({
            pagina: 1,
            refreshing: true,
            man_ev_data_ini: dataNova,
        }, this.getListaRegistros);
    }


    render() {
        const {
            listaRegistros, refreshing, carregarRegistro, temFiltro, somente_escala_filial,
            man_ev_data_ini, man_ev_veiculo, man_ev_servico
        } = this.state;

        return (
            <SafeAreaView style={{ backgroundColor: '#1F829C', flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Escala dos Veículos'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

                <View style={{ flex: 1, backgroundColor: Colors.background }}>

                    {this.state.man_ev_veiculo !== '' ? null : (
                        <View style={{ marginBottom: 3 }}>
                            <ScrollView
                                style={{ height: 45, width: "100%", borderWidth: 1, borderColor: Colors.dividerDark }}>
                                <View style={{ flex: 1, flexDirection: 'row', marginBottom: 2 }}>
                                    <View style={{ flex: 2, padding: 0 }}>
                                        <Button
                                            title=""
                                            onPress={() => {
                                                this.onAntPress()
                                            }}
                                            backgroundColor={Colors.primaryLight}
                                            icon={{
                                                name: 'backward',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    </View>

                                    <View style={{
                                        flex: 5,
                                        padding: 0,
                                        paddingHorizontal: 20,
                                        borderWidth: 1,
                                        borderColor: Colors.dividerDark,
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            position: 'absolute',
                                            marginLeft: 20,
                                            fontSize: 12,
                                        }}>
                                            {moment(moment(man_ev_data_ini, DATE_FORMAT).format("YYYY-MM-DD")).format("dddd")}
                                        </Text>
                                        <TextInput
                                            dateText={man_ev_data_ini || null}
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
                                            style={{
                                                alignContent: 'center',
                                                alignItems: "center",
                                                justifyContent: 'center',
                                                height: 25,
                                                right: 5,
                                            }}
                                        />
                                    </View>

                                    <View style={{ flex: 2, padding: 0 }}>
                                        <Button
                                            title=""
                                            onPress={() => {
                                                this.onProxPress()
                                            }}
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
                    )}

                    <FlatList
                        data={listaRegistros}
                        renderItem={this.renderItem}
                        contentContainerStyle={{ paddingBottom: 150 }}
                        keyExtractor={registro => String(registro.pas_via_empresa) + '_' + String(registro.pas_via_servico) + '_' + (registro.pas_via_servico_extra ? String(registro.pas_via_servico_extra) : String(registro.pas_via_servico)) + '_' + String(registro.veic1) + '_' + String(registro.veic2)}
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
                                        }}>Filtrar Escala</Text>
                                    </View>

                                    <View style={{ marginTop: 4, paddingVertical: 10 }}>

                                        <TextInput
                                            label="Veículo"
                                            id="man_ev_veiculo"
                                            ref="man_ev_veiculo"
                                            value={man_ev_veiculo}
                                            maxLength={9}
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

                                        <CheckBox
                                            title='Somente escala da sua filial'
                                            key={somente_escala_filial}
                                            checked={somente_escala_filial}
                                            onPress={() => this.setState({ somente_escala_filial: !somente_escala_filial })}
                                            containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
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


                    <FloatActionButton
                        iconFamily="MaterialIcons"
                        iconName="cached"
                        iconColor={Colors.textOnPrimary}
                        onPress={this.onRefresh}
                        backgroundColor={Colors.primary}
                        marginBottom={90}
                        marginRight={10}
                    />

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


                </View>

            </SafeAreaView>


        )
    }
}
