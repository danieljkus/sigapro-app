import React, { Component } from 'react';
import {View, Text, Platform, TouchableOpacity, SafeAreaView} from 'react-native';
import { Icon, Card } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import axios from 'axios';
import Colors from '../values/Colors';
import Button from '../components/Button';
import TextInput from '../components/TextInput';

import moment from 'moment';
import 'moment/locale/pt-br';
import HeaderComponent from "../components/HeaderComponent";
moment.locale('pt-BR');

const { OS } = Platform;
const DATE_FORMAT = 'DD/MM/YYYY';

const RegistroItem = ({ registro, onRegistroPress, onSulcagemPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: Colors.primary }}>
                <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Pneu{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.pneus_mov_pneu}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Posição{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.pneus_mov_posicao}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Eixo{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                            {registro.pneus_mov_eixo}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Marca{': '}
                    </Text>
                    <Text>
                        {registro.pneus_mar_descricao}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Modelo{': '}
                    </Text>
                    <Text>
                        {registro.pneus_mod_descricao}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                        Dimenssão{': '}
                    </Text>
                    <Text>
                        {registro.pneus_dim_descricao}
                    </Text>
                </View>

                <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                            Data{': '}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 3 }} >
                            {moment(registro.pneus_mov_data).format("DD/MM/YYYY")}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Vida{': '}
                        </Text>
                        <Text style={{ fontSize: 12, marginTop: 2 }}>
                            {registro.pneus_vd_vida === "0" ? 'NOVO' : registro.pneus_vd_vida + 'º VIDA'}
                        </Text>
                    </View>
                    <View style={{ flex: 3, flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Km Vida{': '}
                        </Text>
                        <Text>
                            {registro.pneus_vd_km_vida}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        margin: 0,
                        marginTop: 5,
                        height: 40,
                        borderTopWidth: 1,
                        borderColor: Colors.dividerDark,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => onSulcagemPress(registro.pneus_mov_pneu, registro.pneus_vd_vida, registro.pneus_mov_posicao)}
                    >
                        <View style={{ width: 100, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='bars'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={17}
                            />
                            <Text style={{ color: Colors.primaryLight, fontSize: 13, marginLeft: 5 }} >
                                Sulcagem
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onRegistroPress(registro.pneus_mov_idf)}
                    >
                        <View style={{ width: 100, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                            <Icon
                                name='retweet'
                                type='font-awesome'
                                color={Colors.primaryLight}
                                size={18}
                            />
                            <Text style={{ color: Colors.primaryLight, fontSize: 13, marginLeft: 5 }} >
                                Trocar Pneu
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View >
        </Card >
    )
}


export default class PneusLocalizarScreen extends Component {

    state = {
        listaRegistros: [],
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,

        buscaPneu: '',
        registro: {},
    };

    componentDidMount() {

    }

    buscaRegistros = () => {
        this.setState({ carregarRegistro: true });
        const { buscaPneu } = this.state;

        axios.get('/pneus/showPneu/' + buscaPneu)
            .then(response => {

                this.setState({
                    registro: response.data,
                    carregarRegistro: false,
                })
            }).catch(ex => {
                console.warn(ex);
                console.warn(ex.response);
                this.setState({ carregarRegistro: false });
            })
    }

    onChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        // clearTimeout(this.buscaRegistrosId);
        // this.buscaRegistrosId = setTimeout(() => {
        //     this.buscaRegistros(value);
        // }, 1000);
    }

    renderLocalizacao = (registro) => {
        if (registro.pneus_mov_posicao === 'EST') {
            return (
                <Text>{'FILIAL: ' + registro.pneus_mov_filial + ' - ' + registro.adm_fil_descricao}</Text>
            )
        } else if (registro.pneus_mov_posicao === 'REC') {
            return (
                <Text>{'REC: ' + registro.adm_pes_nome}</Text>
            )
        } else if (registro.pneus_mov_posicao === 'SUC') {
            return (
                <Text>SUCATEADO</Text>
            )
        } else {
            return (
                <Text>{'VEÍCULO: ' + registro.pneus_mov_veiculo + ' / POS: ' + registro.pneus_mov_posicao}</Text>
            )
        }
    }


    render() {
        const { buscaPneu, registro, carregarRegistro } = this.state;

        // console.log('PneusLocalizarScreen.this.state: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Localizar Pneu'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

                <View style={{ margin: 10, marginBottom: -10, padding: 0 }}>
                    <TextInput
                        label="Buscar Pneu"
                        id="buscaPneu"
                        ref="buscaPneu"
                        value={buscaPneu}
                        maxLength={10}
                        // keyboardType="decimal-pad"
                        // keyboardType="numeric"
                        onChange={this.onChange}
                    />
                    <Button
                        title="Buscar Pneu"
                        loading={carregarRegistro}
                        onPress={this.buscaRegistros}
                        color={Colors.textOnPrimary}
                        buttonStyle={{ marginBottom: 30, marginTop: 10 }}
                        icon={{
                            name: 'search',
                            type: 'font-awesome',
                            color: Colors.textOnPrimary
                        }}
                    />
                    {registro.pneus_mov_filial ? (
                        <View style={{ marginBottom: 30 }}>
                            <Text style={{
                                color: Colors.textSecondaryDark,
                                fontWeight: 'bold',
                                fontSize: 20,
                                marginBottom: 15,
                                marginTop: 20,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Dados do Pneu
                            </Text>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Marca {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                    {registro.pneus_mar_descricao}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Dimenssão {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                    {registro.pneus_dim_descricao}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Modelo {': '}
                                </Text>
                                <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }}>
                                    {registro.pneus_mod_descricao}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Data{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {moment(registro.pneus_mov_data).format("DD/MM/YYYY")}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Sulcagem{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {registro.sulco1 + ',' + registro.sulco2 + ',' + registro.sulco3 + ',' + registro.sulco4}
                                    </Text>
                                </View>
                            </View>


                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Vida{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {registro.vida === '0' ? 'NOVO' : registro.vida + 'º VIDA'}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Km{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {registro.pneus_mov_km_ini}
                                    </Text>
                                </View>
                            </View>


                            <View style={{ marginHorizontal: 10, marginVertical: 5, paddingTop: 10, borderTopWidth: 2, borderTopColor: Colors.dividerDark }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Localização
                                </Text>
                                {this.renderLocalizacao(registro)}
                            </View>

                        </View>
                    ) : null}
                </View>


                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </SafeAreaView >

        )
    }
}
