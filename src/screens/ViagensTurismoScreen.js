import React, {Component} from 'react';
import {
    View, Text, FlatList, Modal,
    Platform, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView, SafeAreaView
} from 'react-native';
import {Icon, Card, Divider, CheckBox} from 'react-native-elements';
import {ProgressDialog} from 'react-native-simple-dialogs';
import axios from 'axios';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import {maskDate} from '../utils/Maskers';
import {getFilial} from '../utils/LoginManager';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";

moment.locale('pt-BR');

const {OS} = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({registro, onRegistroPress}) => {
    return (
        <Card containerStyle={{
            padding: 0,
            margin: 0,
            marginVertical: 7,
            borderRadius: 0,
            backgroundColor: Colors.textDisabledLight,
            elevation: 0,
        }}>
            <View style={{borderLeftWidth: 5, borderLeftColor: Colors.primary, padding: 10}}>

                <View style={{fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Controle{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {registro.tur_orc_controle}
                        </Text>
                    </View>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Contrato{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 15}}>
                            {registro.tur_orc_contrato}
                        </Text>
                    </View>
                </View>

                <View style={{fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Situação{': '}
                        </Text>
                        <Text style={{fontSize: 15}}>
                            {renderSituacao(registro.tur_orc_situacao)}
                        </Text>
                    </View>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Qtde Passag{': '}
                        </Text>
                        <Text style={{fontSize: 15}}>
                            {registro.tur_orc_num_passageiros}
                        </Text>
                    </View>
                </View>


                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                        Saída{': '}
                    </Text>
                    <Text style={{fontSize: 15}}>
                        {moment(registro.tur_orc_data_hora_ida).format("DD/MM/YYYY  HH:mm")}
                    </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                        Retorno{': '}
                    </Text>
                    <Text style={{fontSize: 15}}>
                        {moment(registro.tur_orc_data_hora_volta).format("DD/MM/YYYY  HH:mm")}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Origem{': '}
                    </Text>
                    <Text style={{fontWeight: 'bold',}}>
                        {registro.tur_orc_origem}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Destino{': '}
                    </Text>
                    <Text style={{fontWeight: 'bold',}}>
                        {registro.tur_orc_destino}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Roteiro{': '}
                    </Text>
                    <Text>
                        {registro.tur_orc_roteiro}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Cliente{': '}
                    </Text>
                    <Text>
                        {registro.adm_pes_nome}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Contratante{': '}
                    </Text>
                    <Text>
                        {registro.tur_orc_contratante}
                    </Text>
                </View>

                {registro.veiculo ? (
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Carro{': '}
                        </Text>
                        <Text>
                            {registro.veiculo}
                        </Text>
                    </View>
                ) : null}

                <View style={{fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Filial Sair{': '}
                        </Text>
                        <Text style={{fontSize: 12, marginTop: 2}}>
                            {registro.tur_orc_filial_carrosaiu}
                        </Text>
                    </View>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Hora Saída{': '}
                        </Text>
                        <Text>
                            {registro.tur_orc_hora_saida_garagem}
                        </Text>
                    </View>
                </View>

                <View style={{fontSize: 13, flexDirection: 'row'}}>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15}}>
                            Kit{': '}
                        </Text>
                        <Text style={{fontWeight: 'bold', fontSize: 12, marginTop: 3}}>
                            {registro.tur_orc_kit}
                        </Text>
                    </View>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Refrig{': '}
                        </Text>
                        <Text style={{fontSize: 12, marginTop: 2}}>
                            {registro.tur_orc_refrigerante}
                        </Text>
                    </View>
                    <View style={{flex: 3, flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                            Translado{': '}
                        </Text>
                        <Text>
                            {registro.tur_orc_translado}
                        </Text>
                    </View>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Despesas do Motorista{': '}
                    </Text>
                    <Text>
                        {registro.tur_orc_desp_motoristas}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        Modelo do Veículo{': '}
                    </Text>
                    <Text>
                        {registro.tur_orc_modelo_veiculo}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        OBS{': '}
                    </Text>
                    <Text>
                        {registro.tur_orc_obs}
                    </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: Colors.primaryDark}}>
                        OBS Orçamento{': '}
                    </Text>
                    <Text>
                        {registro.tur_orc_obs_orcamento}
                    </Text>
                </View>

            </View>
        </Card>
    )
}

const renderSituacao = (tur_orc_situacao) => {
    if (tur_orc_situacao === 'A') {
        return 'ORÇADO';
    } else if (tur_orc_situacao === 'K') {
        return 'CONFIRMADO';
    } else if (tur_orc_situacao === 'I') {
        return 'IMPRESSO';
    } else if (tur_orc_situacao === 'F') {
        return 'CONCLUIDO';
    } else if (tur_orc_situacao === 'G') {
        return 'GERADO';
    } else if (tur_orc_situacao === 'E') {
        return 'CTE-OS';
    } else if (tur_orc_situacao === 'C') {
        return 'CANCELADO';
    } else {
        return '';
    }
};

export default class ViagensTurismoScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidMount() {
        getFilial().then(filial => {
            this.setState({refreshing: true});
            this.getListaRegistros();
        })
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }


    getListaRegistros = () => {
        const {pagina, listaRegistros} = this.state;

        axios.get('/turismo/listaContratos', {
            params: {
                page: pagina,
                limite: 10,
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
            console.warn(ex);
            console.warn(ex.response);
            this.setState({
                refreshing: false,
                carregando: false,
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

    renderItem = ({item, index}) => {
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


    render() {
        const {listaRegistros, refreshing, carregarRegistro,} = this.state;

        // console.log('adm_vei_idf: ', this.state.adm_vei_idf);

        return (
            <SafeAreaView style={{backgroundColor: '#1F829C', flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Viagens Turismo'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <View style={{flex: 1, backgroundColor: Colors.background}}>


                    <FlatList
                        data={listaRegistros}
                        renderItem={this.renderItem}
                        contentContainerStyle={{paddingBottom: 100}}
                        keyExtractor={registro => String(registro.tur_orc_controle)}
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


                </View>
            </SafeAreaView>

        )
    }
}