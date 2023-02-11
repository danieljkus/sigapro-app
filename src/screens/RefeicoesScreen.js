import React, {Component} from 'react';
import {
    View,
    Text,
    FlatList,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
    SafeAreaView
} from 'react-native';

const {OS} = Platform;

import moment from 'moment';
import axios from 'axios';
import {Card, Divider} from 'react-native-elements';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import TextInput from '../components/TextInput';
import {maskDate} from '../utils/Maskers';
import Button from '../components/Button';
import HeaderComponent from "../components/HeaderComponent";

const SwitchStyle = OS === 'ios' ? {transform: [{scaleX: .7}, {scaleY: .7}]} : undefined;
const DATE_FORMAT = 'DD/MM/YYYY';

const CardViewItem = ({registro, onRegistroPress}) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 7,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            elevation: 0,
        }}>
            <View style={{
                borderLeftWidth: 5,
                borderLeftColor:
                    registro.rhref_situacao === 'PEN' ? 'red'
                        : registro.rhref_situacao === 'AUT' ? '#fdd835'
                        : '#10734a'
            }}>

                <View
                    style={{paddingHorizontal: 16, paddingTop: 8, flexDirection: 'row'}}
                >
                    <Text style={{color: Colors.textSecondaryDark, fontSize: 16, flex: 2}}>
                        <Text style={{fontWeight: 'bold'}}>
                            Data: {' '}
                        </Text>
                        <Text>
                            {moment(registro.rhref_data).format('DD/MM/YYYY [às] HH:mm')}
                        </Text>
                    </Text>
                    <Text style={{color: Colors.textSecondaryDark, fontSize: 16, flex: 1}}>
                        <Text style={{fontWeight: 'bold'}}>
                            {registro.rhref_situacao}
                        </Text>
                    </Text>
                </View>

                <View style={{paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row'}}>
                    <Text style={{flex: 2, color: Colors.textSecondaryDark, fontSize: 15}}>
                        <Text style={{fontWeight: 'bold'}}>
                            Refeição: {' '}
                        </Text>
                        <Text>
                            {registro.rhref_tipo_refeicao}
                        </Text>
                    </Text>
                    <Text style={{flex: 1, color: Colors.textSecondaryDark, fontSize: 15, flex: 1}}>
                        <Text style={{fontWeight: 'bold'}}>
                            Valor: {' '}
                        </Text>
                        <Text>
                            R$ {parseFloat(registro.rhref_valor).toFixed(2)}
                        </Text>
                    </Text>
                </View>

                <Divider/>

                <View style={{paddingHorizontal: 16, paddingVertical: 8}}>
                    <Text style={{fontWeight: 'bold'}}>
                        Restaurante
                    </Text>
                    <Text>
                        {registro.nome_rest}
                    </Text>
                    <Text>
                        {registro.ceps_loc_descricao} - {registro.ceps_loc_uf}
                    </Text>
                </View>

                <Divider/>

                {registro.rhref_obs ? (
                    <View style={{paddingHorizontal: 16, paddingVertical: 8}}>
                        <Text>
                            {registro.rhref_obs}
                        </Text>
                    </View>
                ) : null}
            </View>
        </Card>
    )
}

export default class RefeicoesScreen extends Component {

    termoBusca = '';
    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        modalFiltrosVisible: false,

        dataIni: moment(moment().subtract(15, 'days')).format(DATE_FORMAT),
        dataFim: moment(new Date()).format(DATE_FORMAT),

        vlrCaf: 0,
        vlrAlm: 0,
        vlrJan: 0,
        vlrMar: 0,
    };

    componentDidMount() {
        this.setState({refreshing: false});
        this.getListaRegistros();
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    getListaRegistros = () => {
        const {dataIni, dataFim, pagina, listaRegistros} = this.state;
        this.setState({carregando: true});


        // console.log('getListaRegistros: ', dataIni)
        // console.log('getListaRegistros: ', dataIni)

        axios.get('/refeicoes', {
            params: {
                page: pagina,
                limite: 10,

                usuario: 'OK',
                versaoApp: '1.14',
                dtIni: moment(dataIni, DATE_FORMAT).format("YYYY-MM-DD"),
                dtFim: moment(dataFim, DATE_FORMAT).format("YYYY-MM-DD"),
            }
        }).then(response => {

            // console.log('getListaRegistros: ', response.data)


            const novosRegistros = pagina === 1
                ? response.data.consulta.data
                : listaRegistros.concat(response.data.consulta.data);
            const total = response.data.consulta.total;
            this.setState({
                listaRegistros: novosRegistros,

                vlrCaf: parseFloat(response.data.vlrCaf),
                vlrAlm: parseFloat(response.data.vlrAlm),
                vlrJan: parseFloat(response.data.vlrJan),
                vlrMar: parseFloat(response.data.vlrMar),

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


    onAddPress = () => {
        this.props.navigation.navigate('RefeicaoScreen', {
            onRefresh: this.onRefresh
        });
    }


    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
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
            />
        )
    }

    render() {
        const {listaRegistros, dataIni, dataFim, refreshing, carregando} = this.state;
        return (
            <SafeAreaView style={{backgroundColor: '#1F829C', flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Refeições'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <View style={{flex: 1, backgroundColor: '#1F829C'}}>
                    <FlatList
                        style={{
                            backgroundColor: 'white'
                        }}
                        data={listaRegistros}
                        renderItem={this.renderItem}
                        contentContainerStyle={{paddingBottom: 150}}
                        keyExtractor={registro => String(registro.rhref_idf)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />


                    <View style={{backgroundColor: '#1F829C', flexDirection: 'row', padding: 7}}>
                        <View style={{flex: 1}}>
                            <Text
                                style={{color: Colors.textOnPrimary}}>CAF: {parseFloat(this.state.vlrCaf).toFixed(2)}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text
                                style={{color: Colors.textOnPrimary}}>ALM: {parseFloat(this.state.vlrAlm).toFixed(2)}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text
                                style={{color: Colors.textOnPrimary}}>JAN: {parseFloat(this.state.vlrJan).toFixed(2)}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text
                                style={{color: Colors.textOnPrimary}}>MAR: {parseFloat(this.state.vlrMar).toFixed(2)}</Text>
                        </View>
                    </View>
                    <View style={{backgroundColor: "#1F829C", flexDirection: 'row', padding: 7}}>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <Text style={{
                                color: Colors.textOnPrimary,
                                fontSize: 18
                            }}>TOTAL: {parseFloat(this.state.vlrCaf + this.state.vlrAlm + this.state.vlrJan + this.state.vlrMar).toFixed(2)}</Text>
                        </View>
                    </View>


                    {/* ----------------------------- */}
                    {/* MODAL PARA FILTROS            */}
                    {/* ----------------------------- */}
                    <Modal
                        visible={this.state.modalFiltrosVisible}
                        onRequestClose={() => {
                            console.log("Modal FILTROS FECHOU.")
                        }}
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


                                        <Button
                                            title="FILTRAR"
                                            onPress={() => {
                                                this.onSearchPress(!this.state.modalFiltrosVisible)
                                            }}
                                            buttonStyle={{marginTop: 10}}
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
                                            buttonStyle={{marginTop: 10}}
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
                        marginBottom={140}
                        marginRight={10}
                    />

                    <FloatActionButton
                        iconFamily="MaterialIcons"
                        iconName="add"
                        iconColor={Colors.textOnAccent}
                        onPress={this.onAddPress}
                        backgroundColor={Colors.primary}
                        marginBottom={80}
                        marginRight={10}
                    />

                </View>
            </SafeAreaView>
        )
    }
}