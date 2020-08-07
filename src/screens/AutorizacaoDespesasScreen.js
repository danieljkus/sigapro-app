import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
const { OS } = Platform;

import moment from 'moment';
import axios from 'axios';
import { Card, Divider, SearchBar } from 'react-native-elements';
import FloatActionButton from '../components/FloatActionButton';
import Colors from '../values/Colors';
import { maskValorMoeda, vlrStringParaFloat } from '../utils/Maskers';
import Alert from '../components/Alert';

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;


const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 10, borderRadius: 2, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.fin_ad_documento)}
                onLongPress={() => onRegistroLongPress(registro.fin_ad_documento)}
            >


                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        flexDirection: 'row'
                    }}
                >
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }} >
                            Doc: {' '}
                        </Text>
                        <Text>
                            {registro.fin_ad_documento}
                        </Text>
                    </Text>

                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }} >
                        <Text style={{ fontWeight: 'bold' }} >
                            Data: {' '}
                        </Text>
                        <Text>
                            {moment(registro.fin_ad_data_autorizacao).format('DD/MM/YYYY')}
                        </Text>
                    </Text>
                </View>

                <Divider />

                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        flexDirection: 'row'
                    }}
                >
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }} >
                            Situação: {' '}
                        </Text>
                        <Text>
                            {registro.fin_ad_situacao}
                        </Text>
                    </Text>

                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 15 }} >
                        <Text style={{ fontWeight: 'bold' }} >
                            Valor: {' '}
                        </Text>
                        <Text>
                            {parseFloat(registro.fin_ad_valor).toFixed(2)}
                        </Text>
                    </Text>
                </View>

                <Divider />

                <View
                    style={{ paddingHorizontal: 16, paddingTop: 8, flexDirection: 'row' }}
                >
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }} >
                            Descrição: {' '}
                        </Text>
                        <Text>
                            {registro.fin_ad_descricao_aut}
                        </Text>
                    </Text>
                </View>

                <View
                    style={{ paddingHorizontal: 16, paddingTop: 5, flexDirection: 'row' }}
                >
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }} >
                            Criado por: {' '}
                        </Text>
                        <Text>
                            {registro.fin_ad_nome_criacao}
                        </Text>
                    </Text>
                </View>

                <View
                    style={{ paddingHorizontal: 16, paddingTop: 5, paddingBottom: 8, flexDirection: 'row' }}
                >
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 16, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }} >
                            Autorizado por: {' '}
                        </Text>
                        <Text>
                            {registro.fin_ad_autorizado_por}
                        </Text>
                    </Text>
                </View>

            </TouchableOpacity>

        </Card>
    )
}

export default class AutorizacaoDespesasScreen extends Component {

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
        const { buscaNome, pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/autorzacaoDespesas', {
            params: {
                page: pagina,
                limite: 10,
                doc: buscaNome,
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
        this.props.navigation.navigate('AutorizacaoDespesaScreen', {
            registro: {
                fin_ad_documento: '',
                fin_ad_seq: '',
                fin_ad_data_autorizacao: '',
                fin_ad_descricao_aut: '',
                fin_ad_nome_criacao: '',
                fin_ad_valor: '',
                fin_ad_tipo: 'E',
                fin_ad_max_mes_utilizacao: '',
                fin_ad_max_ano_utilizacao: '',
                fin_ad_conta_fin: '',
                fin_ad_emp_conta_fin: '',
                fin_ad_filial: '',
                fin_ad_situacao: 'P',
                fin_ad_autorizado_por: ''
            },
            onRefresh: this.onRefresh
        });
    }

    onRegistroPress = (fin_ad_documento) => {
        this.setState({ carregarRegistro: true });
        axios.get('/autorzacaoDespesas/show/' + fin_ad_documento)
            .then(response => {
                this.setState({ carregarRegistro: false });
                const { data } = response;
                this.props.navigation.navigate('AutorizacaoDespesaScreen', {
                    registro: data,
                    onRefresh: this.onRefresh
                });
            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
            });
    }

    onExcluirRegistro = (fin_ad_documento) => {
        this.setState({ carregarRegistro: true });
        axios.delete('/autorzacaoDespesas/delete/' + fin_ad_documento)
            .then(response => {
                // this.setState({ carregando: true });
                this.onRefresh;
            }).catch(ex => {
                console.warn(ex);
                this.setState({ carregarRegistro: false });
            })
    }

    onRegistroLongPress = (fin_ad_documento) => {
        if (!this.state.parSinc) {
            Alert.showConfirm("Deseja excluir este registro?",
                { text: "Cancelar" },
                {
                    text: "Excluir",
                    onPress: () => this.onExcluirRegistro(fin_ad_documento),
                    style: "destructive"
                }
            )
        }
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

    onBuscaNome = (text) => {
        clearTimeout(this.buscaTimeout);
        this.setState({
            pagina: 1,
            refreshing: true,
            buscaNome: text,
        })
        this.buscaTimeout = setTimeout(() => {
            this.getListaRegistros();
        }, 1000);
    }




    render() {
        const { listaRegistros, refreshing, carregando } = this.state;

        console.log('AutorizacaoDespesasScreen: ', this.state);

        return (
            <View style={{ flex: 1, }}>

                <SearchBar
                    placeholder="Buscar Documento"
                    lightTheme={true}
                    onChangeText={this.onBuscaNome}
                    inputStyle={{ backgroundColor: 'white' }}
                    containerStyle={{ backgroundColor: Colors.primaryLight }}
                />


                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.fin_ad_documento)}
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
            </View>
        )
    }
}