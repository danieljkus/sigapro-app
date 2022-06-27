import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import StatusBar from '../components/StatusBar';
import Colors from '../values/Colors';
import { maskDate } from '../utils/Maskers';
import { getFilial } from '../utils/LoginManager';
// import Alert from '../components/Alert';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import FloatActionButton from '../components/FloatActionButton';

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;
const DATE_FORMAT = 'DD/MM/YYYY';

const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.man_sp_data_execucao ? '#10734a' : 'red' }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.man_sp_idf, registro.man_sp_data_execucao ? false : true, registro)}
                // onLongPress={() => onRegistroLongPress(registro.man_os_idf)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Inclusão {': '}
                            </Text>
                            <Text>
                                {registro.man_sp_data_inclusao ? moment(registro.man_sp_data_inclusao).format('DD/MM/YYYY') : ''}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Execução {': '}
                            </Text>
                            <Text>
                                {registro.man_sp_data_execucao ? moment(registro.man_sp_data_execucao).format('DD/MM/YYYY') : ''}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Serviço {': '}
                            </Text>
                            <Text>
                                {registro.man_sp_servico}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Prioridade {': '}
                            </Text>
                            <Text>
                                {registro.man_spc_prioridade}
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ flexDirection: 'row', paddingLeft: 10, paddingVertical: 5 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Serviço {': '}
                        </Text>
                        <Text>
                            {registro.man_spc_descricao}
                        </Text>
                    </View>


                    {registro.man_sp_obs ? (
                        <View style={{ flexDirection: 'row', paddingLeft: 10, paddingBottom: 5, marginRight: 50 }}>
                            <Text>
                                {registro.man_sp_obs}
                            </Text>
                        </View>
                    ) : null}

                    {registro.man_sp_data_execucao ? (
                        <View>
                            <Divider />
                            <View style={{ flexDirection: 'row', paddingLeft: 10, paddingVertical: 5, marginRight: 50 }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Execução {': '}
                                </Text>
                                <Text>
                                    {registro.man_sp_obs_execucao}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class OrdemServicoServPendenteScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            man_os_idf: props.navigation.state.params.man_os_idf ? props.navigation.state.params.man_os_idf : 0,
            man_grupo_servico: props.navigation.state.params.man_grupo_servico ? props.navigation.state.params.man_grupo_servico : 0,
            man_osm_veiculo: props.navigation.state.params.man_osm_veiculo ? props.navigation.state.params.man_osm_veiculo : '',
            man_os_situacao: props.navigation.state.params.man_os_situacao ? props.navigation.state.params.man_os_situacao : '',

            man_sp_idf: 0,
            man_sp_data_execucao: moment(new Date()).format(DATE_FORMAT),
            man_sp_servico: '',
            man_sp_obs: '',
            man_sp_obs_execucao: '',

            listaRegistros: [],
            refreshing: false,
            carregando: false,
            carregarMais: false,
            loading: false,
            pagina: 1,

            modalBaixaVisible: false,
        }
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({
                filial,
                refreshing: false
            });
        })
        this.getListaRegistros();
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    getListaRegistros = () => {
        const { pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/ordemServicos/listaServPendentes/' + this.state.man_os_idf, {
            params: {
                grupo: this.state.man_grupo_servico,
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
                console.warn('Erro Busca:', ex);
                this.setState({
                    refreshing: false,
                    carregando: false,
                });
            })
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

    onAddPress = () => {
        // console.log('onAddPress');
        this.setState({
            man_sp_idf: 0,
            man_sp_obs: '',
            man_sp_obs_execucao: '',
            modalBaixaVisible: true,
        });
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onRegistroPress = (man_sp_idf, visible, registro) => {
        if (visible) {
            this.setState({
                man_sp_idf: man_sp_idf,
                man_sp_data_execucao: moment(new Date()).format(DATE_FORMAT),
                modalBaixaVisible: visible,
                man_sp_obs: registro.man_sp_obs,
            });
            this.setState({
                pagina: 1,
                refreshing: true,
            }, this.getListaRegistros);
        }
    }

    onClosePress = (visible) => {
        this.setState({ modalBaixaVisible: visible });
    }

    onSalvarRegistro = () => {
        const { man_grupo_servico, man_osm_veiculo, man_os_idf, man_sp_idf, man_sp_data_execucao,
            man_sp_obs, man_sp_obs_execucao, man_sp_servico } = this.state;

        const registro = {
            man_sp_idf,
            man_sp_os: man_os_idf,
            man_sp_veiculo: man_osm_veiculo,
            man_sp_grupo_servico: man_grupo_servico,
            man_sp_obs,
            man_sp_servico,
            man_sp_data_execucao: moment(man_sp_data_execucao, DATE_FORMAT).format("YYYY-MM-DD HH:mm"),
            man_sp_obs_execucao,
        };

        // console.log('onSalvarRegistro: ', registro);
        // return;

        this.setState({ salvado: true });
        axios.post('/ordemServicos/storeServPendentes', registro)
            .then(response => {
                this.setState({
                    man_sp_idf: 0,
                    modalBaixaVisible: false,
                    salvado: false
                });
                this.getListaRegistros();
            }).catch(ex => {
                this.setState({ salvado: false });
                console.warn(ex);
            })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }


    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // ------------------------------------------------------------


    render() {
        const { listaRegistros, refreshing, carregarRegistro, man_sp_idf, man_sp_data_execucao, man_sp_obs, man_sp_obs_execucao,
            modalBaixaVisible, loading, salvado } = this.state;

        // console.log('OrdemServicoServPendenteScreen: ', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    <FlatList
                        data={listaRegistros}
                        renderItem={this.renderItem}
                        contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
                        keyExtractor={registro => String(registro.man_sp_idf)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />

                </ScrollView>


                {/* ----------------------------- */}
                {/* MODAL PARA BAIXA              */}
                {/* ----------------------------- */}
                <Modal
                    visible={this.state.modalBaixaVisible}
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
                                    }}>Serviço Pendente</Text>
                                </View>

                                <View style={{ marginTop: 4, paddingVertical: 10 }}>

                                    <TextInput
                                        label="Descrição do Serviço"
                                        id="man_sp_obs"
                                        ref="man_sp_obs"
                                        value={man_sp_obs}
                                        maxLength={150}
                                        onChange={this.onInputChange}
                                        multiline={true}
                                        height={50}
                                        enabled={!man_sp_idf}
                                    />

                                    {man_sp_idf ? (
                                        <ScrollView style={{ height: 50, width: "100%", marginBottom: 10 }}>
                                            <TextInput
                                                type="date"
                                                label="Data Execução"
                                                id="man_sp_data_execucao"
                                                ref="man_sp_data_execucao"
                                                value={man_sp_data_execucao}
                                                masker={maskDate}
                                                dateFormat={DATE_FORMAT}
                                                onChange={this.onInputChange}
                                                validator={data => moment(data, "DD/MM/YYYY", true).isValid()}
                                                fontSize={12}
                                            />
                                        </ScrollView>
                                    ) : null}

                                    {man_sp_idf ? (
                                        <TextInput
                                            label="Descrição da Execução"
                                            id="man_sp_obs_execucao"
                                            ref="man_sp_obs_execucao"
                                            value={man_sp_obs_execucao}
                                            maxLength={150}
                                            onChange={this.onInputChange}
                                            multiline={true}
                                            height={50}
                                        />
                                    ) : null}


                                    {this.state.man_os_situacao === 'A' ? (
                                        <Button
                                            title="GRAVAR"
                                            onPress={() => { this.onSalvarRegistro() }}
                                            buttonStyle={{ marginTop: 15, height: 35 }}
                                            backgroundColor={Colors.buttonPrimary}
                                            icon={{
                                                name: 'filter',
                                                type: 'font-awesome',
                                                color: Colors.textOnPrimary
                                            }}
                                        />
                                    ) : null}
                                    <Button
                                        title="FECHAR"
                                        onPress={() => { this.onClosePress(!this.state.modalBaixaVisible) }}
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
                    iconName="add"
                    iconColor={Colors.textOnAccent}
                    onPress={this.onAddPress}
                    backgroundColor={Colors.primary}
                    marginRight={10}
                />

                <ProgressDialog
                    visible={salvado}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </View >
        )
    }
}