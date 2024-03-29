import React, { Component } from 'react';
import {View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, SafeAreaView} from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider } from 'react-native-elements';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';
import HeaderComponent from "../components/HeaderComponent";

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.estoq_tam_idf)}
            >
                <View
                    style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row' }}
                >
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }} >
                            Data: {' '}
                        </Text>
                        <Text>
                            {moment(registro.estoq_tam_data).format('DD/MM/YYYY [às] HH:mm')}
                        </Text>
                    </Text>
                </View>

                <Divider />

                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        // flexDirection: 'row'
                    }}
                >
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }} >
                        <Text style={{ fontWeight: 'bold' }} >
                            Qtde Medida: {' '}
                        </Text>
                        <Text>
                            {parseFloat(registro.estoq_tam_qtde_medida).toFixed(2)} Lt
                        </Text>
                    </Text>
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }} >
                            Qtde Sistema: {' '}
                        </Text>
                        <Text>
                            {parseFloat(registro.estoq_tam_qtde_sistema).toFixed(2)} Lt
                        </Text>
                    </Text>
                </View>

            </TouchableOpacity>

        </Card>
    )
}

export default class MedicoesTanqueArlaScreen extends Component {

    termoBusca = '';
    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidMount() {
        this.setState({ refreshing: false });
        this.getListaRegistros();
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    getListaRegistros = () => {
        const { buscaCTE, buscaRomaneio, pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/medicaoTanqueArla', {
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

    onRegistroPress = (estoq_tam_idf) => {
        // this.props.navigation.navigate('MedicaoTanqueArlaScreen', {
        //     estoq_tam_idf,
        //     onRefresh: this.onRefresh
        // });
    }

    onAddPress = () => {
        this.props.navigation.navigate('MedicaoTanqueArlaScreen', {
            estoq_tam_idf: 0,
            onRefresh: this.onRefresh
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

    renderItem = ({ item }) => {
        return (
            <CardViewItem
                registro={item}
                onRegistroPress={this.onRegistroPress}
            />
        )
    }

    render() {
        const { listaRegistros, refreshing, carregando } = this.state;
        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Medições do Tanque Arla'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.estoq_tam_idf)}
                    onRefresh={this.onRefresh}
                    refreshing={refreshing}
                    onEndReached={this.carregarMaisRegistros}
                    ListFooterComponent={this.renderListFooter}
                />

                <FloatActionButton
                    iconFamily="MaterialIcons"
                    iconName="add"
                    iconColor={Colors.textOnAccent}
                    onPress={this.onAddPress}
                    backgroundColor={Colors.primary}
                />
            </SafeAreaView>
        )
    }
}
