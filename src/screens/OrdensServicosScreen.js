import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskDate, maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';
import { getFilial } from '../utils/LoginManager';
import FiliaisSelect from '../components/FiliaisSelect';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

const DATE_FORMAT = 'DD/MM/YYYY';

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress, onFinalizarPress, onAbrirPress }) => {
    return (
        <Card containerStyle={{ padding: 0, marginLeft: 5, marginRight: 5, marginBottom: 2, marginTop: 3, borderRadius: 2, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.man_os_situacao === 'A' ? 'red' : '#10734a' }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro.man_os_idf)}
                // onLongPress={() => onRegistroLongPress(registro.man_os_idf)}
                >

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Controle {': '}
                            </Text>
                            <Text>
                                {registro.man_osm_controle}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Filial {': '}
                            </Text>
                            <Text>
                                {registro.man_os_filial}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Emissão {': '}
                            </Text>
                            <Text>
                                {moment(registro.man_os_data_inicial).format('DD/MM/YYYY')}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Situação {': '}
                            </Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 15, color: registro.man_os_situacao === 'A' ? 'red' : '#10734a' }} >
                                {registro.man_os_situacao_descr}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Previsão {': '}
                            </Text>
                            <Text>
                                {registro.man_os_data_prevista ? moment(registro.man_os_data_prevista).format('DD/MM/YYYY') : ''}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Veículo {': '}
                            </Text>
                            <Text>
                                {registro.man_osm_veiculo}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginBottom: 5, marginTop: 0, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Encerr {': '}
                            </Text>
                            <Text>
                                {registro.man_os_data_fim ? moment(registro.man_os_data_fim).format('DD/MM/YYYY') : ''}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Valor {': '}
                            </Text>
                            <Text>
                                {parseFloat(registro.man_os_valor).toFixed(2)}
                            </Text>
                        </View>
                    </View>

                </TouchableOpacity>

                <View
                    style={{
                        flex: 1,
                        margin: 0,
                        marginTop: 5,
                        height: 35,
                        borderTopWidth: 1,
                        borderColor: Colors.dividerDark,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => onFinalizarPress(registro)}
                    // disabled={true}
                    >
                        <View style={{ width: 150, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='check'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                            <Text style={{ marginLeft: 5 }}>Finalizar O.S</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onAbrirPress(registro)}
                    // disabled={true}
                    >
                        <View style={{ width: 150, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='folder-open'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                            <Text style={{ marginLeft: 5 }}>Abrir O.S</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    )
}

export default class OrdensServicosScreen extends Component {

    termoBusca = '';
    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        empresa: '',
        dataIni: moment(moment().subtract(15, 'days')).format(DATE_FORMAT),
        dataFim: moment(new Date()).format(DATE_FORMAT),
        manu_os_filial: '',
        idf: '',

        filialSelect: null,

        temFiltro: false,
        modalFiltrosVisible: false,
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({
                refreshing: true,
                manu_os_filial: filial
            });

            if (filial) {
                axios.get('/listaFiliais', {
                    params: {
                        codFilial: filial
                    }
                }).then(response => {
                    const { data } = response;
                    // console.log('FiliaisSelect.componentDidMount: ', data);
                    this.setState({
                        filialSelect: {
                            adm_fil_codigo: filial,
                            adm_fil_descricao: data[0].adm_fil_descricao
                        },
                    },
                        this.getListaRegistros()
                    );
                });
            }
        })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onInputChangeFilial = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        // console.log('onInputChangeFilial: ', state);
        if (value) {
            this.setState({
                manu_os_filial: value.adm_fil_codigo
            });
        }
    }

    getListaRegistros = () => {
        const { manu_os_filial, dataIni, dataFim, idf, pagina, listaRegistros } = this.state;

        axios.get('/ordemServicos', {
            params: {
                tipoDig: 2,
                page: pagina,
                limite: 10,
                filial: manu_os_filial,
                idf,
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

    onRegistroPress = (man_os_idf) => {
        // console.log('onRegistroPress: ', man_os_idf);

        this.setState({ carregarRegistro: true });
        axios.get('/ordemServicos/show/' + man_os_idf)
            .then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('onRegistroPress: ', response.data);

                this.props.navigation.navigate('OrdemServicoScreen', {
                    registro: {
                        ...response.data,
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
        this.props.navigation.navigate('OrdemServicoScreen', {
            registro: {
                man_os_idf: 0,
                man_os_filial: this.state.filial,
            },
            onRefresh: this.onRefresh
        });
    }

    onRegistroLongPress = (man_os_idf) => {
        Alert.alert("Excluir registro", `Deseja excluir esta O.S?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(man_os_idf),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (man_os_idf) => {
        this.setState({ refreshing: true });
        axios.delete('/ordemServicos/delete/' + man_os_idf)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.man_os_idf === man_os_idf);
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

    onFinalizarPress = (registro) => {
        Alert.alert("Finalizar", `Deseja FINALIZAR esta O.S?`, [
            { text: "NÃO" },
            {
                text: "SIM",
                onPress: () => this.onSituacaoChange(registro.man_os_idf, 'F'),
                style: "destructive"
            }
        ])
    }

    onAbrirPress = (registro) => {
        Alert.alert("Finalizar", `Deseja ABRIR esta O.S?`, [
            { text: "NÃO" },
            {
                text: "SIM",
                onPress: () => this.onSituacaoChange(registro.man_os_idf, 'A'),
                style: "destructive"
            }
        ])
    }


    onSituacaoChange = (controle, sit) => {
        this.setState({ refreshing: true });

        axios.put('/ordemServicos/mudaSituacao', {
            controle,
            sit,
        }).then(response => {
            const listaRegistros = [...this.state.listaRegistros];
            const registro = listaRegistros.find(registro => registro.man_os_idf === controle);
            if (sit === 'A') {
                registro.man_os_situacao = sit;
                registro.man_os_situacao_descr = 'ABERTA';
                registro.man_os_data_fim = '';
            } else {
                registro.man_os_situacao = sit;
                registro.man_os_situacao_descr = sit === 'A' ? 'ABERTA' : 'FECHADA';
                registro.man_os_data_fim = moment(new Date()).format('YYYY-MM-DD');
            }
            this.setState({
                listaRegistros,
                refreshing: false,
            });
        }).catch(ex => {
            console.warn(ex, ex.response);
            this.setState({ refreshing: false });
        })
    }

    renderItem = ({ item }) => {
        return (
            <CardViewItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
                onRegistroLongPress={this.onRegistroLongPress}
                onFinalizarPress={this.onFinalizarPress}
                onAbrirPress={this.onAbrirPress}
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
            manu_os_filial, dataIni, dataFim, idf, filialSelect } = this.state;

        // console.log('OrdensServicosScreen: ', this.state)

        return (
            <View style={{ flex: 1, }}>
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
                    keyExtractor={registro => String(registro.man_os_idf)}
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

                                    <FiliaisSelect
                                        label="Filial"
                                        id="filialSelect"
                                        codFilial={manu_os_filial}
                                        onChange={this.onInputChangeFilial}
                                        value={filialSelect}
                                        enabled={true}
                                    />

                                    <TextInput
                                        label="Controle"
                                        id="idf"
                                        ref="idf"
                                        value={idf}
                                        maxLength={10}
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