import React, { Component } from 'react';
import { View, Text, Alert, FlatList, Platform, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider } from 'react-native-elements';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import HeaderComponent from "../components/HeaderComponent";

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.estoq_nfpd_sit_nfe === 'PEN' ? "#d32f2f" : registro.estoq_nfpd_sit_nfe === 'BAI' ? "#DAA520" : Colors.primary }}>
                <TouchableOpacity
                    onLongPress={() => onRegistroLongPress(registro.estoq_nfpd_chave)}
                >
                    <View style={{ paddingLeft: 10, marginTop: 5, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                NFe {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_num_nfe}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Data {': '}
                            </Text>
                            <Text>
                                {moment(registro.estoq_nfpd_data).format('DD/MM/YYYY')}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 1.8, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Filial {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_filial}
                            </Text>
                        </View>
                        <View style={{ flex: 1.2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }}>
                                Sit {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_sit_nfe}
                            </Text>
                        </View>
                        <View style={{ flex: 3, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Valor {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_valor_nfe}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Emit {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_cnpj_emit}
                            </Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Dest {': '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_cnpj_dest}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Razão Social: {' '}
                            </Text>
                            <Text>
                                {registro.estoq_nfpd_razao_social}
                            </Text>
                        </Text>
                    </View>

                    {registro.estoq_nfpd_nome ? (
                        <View style={{ paddingLeft: 10, marginTop: 3, fontSize: 13, flexDirection: 'row' }}>
                            <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                    Nome: {' '}
                                </Text>
                                <Text>
                                    {registro.estoq_nfpd_nome}
                                </Text>
                            </Text>
                        </View>
                    ) : null}

                    <Divider />

                    <View style={{ paddingLeft: 10, marginTop: 2, fontSize: 13 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                                Chave: {' '}
                            </Text>
                        </Text>
                    </View>
                    <View style={{ paddingLeft: 10, marginBottom: 5 }}>
                        <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                            <Text style={{ fontSize: 13 }}>
                                {registro.estoq_nfpd_chave}
                            </Text>
                        </Text>
                    </View>


                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class PreDigitacaoNotasScreen extends Component {

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
        const { pagina, listaRegistros } = this.state;
        this.setState({ refreshing: true, });

        axios.get('/preDigitacaoNotas', {
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

    onAddPress = () => {
        this.props.navigation.navigate('PreDigitacaoNotaScreen', {
            estoq_nfpd_chave: '',
            onRefresh: this.onRefresh
        });
    }



    onRegistroLongPress = (estoq_nfpd_chave) => {
        Alert.alert("Excluir registro", `Deseja excluir esta Chave?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(estoq_nfpd_chave),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (estoq_nfpd_chave) => {
        this.setState({ refreshing: true });

        axios.delete('/preDigitacaoNotas/delete/' + estoq_nfpd_chave)
            .then(response => {

                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.estoq_nfpd_chave === estoq_nfpd_chave);
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
                onRegistroLongPress={this.onRegistroLongPress}
            />
        )
    }

    render() {
        const { listaRegistros, refreshing, carregando } = this.state;
        return (
            <SafeAreaView style={{ backgroundColor: Colors.background, flex: 1 }}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'NFEs Pré-Digitadas'}
                    pressLeftComponen={() => this?.props?.navigation?.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.estoq_nfpd_chave)}
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
