import React, { Component } from 'react';
import { View, Text, FlatList, Platform, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
const { OS } = Platform;

import axios from 'axios';
import { Card, Divider, SearchBar, CheckBox, Icon } from 'react-native-elements';
import Colors from '../values/Colors';
import Alert from '../components/Alert';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { getUsuario } from '../utils/LoginManager';


const CardViewItem = ({ registro, onWhatsAppPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 5, borderRadius: 2, }}>

            <View style={{ paddingHorizontal: 8, paddingVertical: 5 }}>
                <Text style={{ color: Colors.textSecondaryDark, fontSize: 13, flex: 1, marginTop: 5, }}>
                    #{registro.fin_lanc_filial}
                </Text>
                <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                    {registro.adm_fil_descricao}
                </Text>
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
                    onPress={() => onWhatsAppPress(registro)}
                >
                    <View style={{ width: 100, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
                        <Icon
                            name='whatsapp'
                            type='font-awesome'
                            color={Colors.primaryLight}
                            size={17}
                        />
                        <Text style={{ color: Colors.primaryLight, fontSize: 13, marginLeft: 5 }} >
                            WhatsApp
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class BoletinsDiferencaScreen extends Component {

    termoBusca = '';
    state = {
        listaRegistros: [],
        refreshing: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidMount() {
        getUsuario().then(usuario => {
            this.setState({ usuario });
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
        const { buscaDescricao, buscaSituacao, pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/boletimDeiferenca', {
            params: {
                page: pagina,
                limite: 10,
                doc: buscaDescricao,
                sit: buscaSituacao,
            }
        }).then(response => {
            // console.log('getListaRegistros: ', response.data);

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
                onWhatsAppPress={this.onWhatsAppPress}
            />
        )
    }



    onWhatsAppPress = (registro) => {

        this.setState({ carregarRegistro: true });

        axios.get('/boletimDeiferenca/montarBoletim/' + registro.fin_lanc_filial).
            then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('onWhatsAppEnviar: ', response.data);

                Linking.openURL(
                    'https://api.whatsapp.com/send?' +
                    // 'phone=' + telefone +
                    '&text=' + response.data.body);

            }).catch(ex => {
                Alert.showAlert('Não foi possível localizar o Boletin de Diferença.');
                this.setState({ carregarRegistro: false });
                console.warn(ex);
            });


        // Linking.openURL(
        //     'https://api.whatsapp.com/send?' +
        //     // 'phone=' + telefone +
        //     '&text=' + '>> Expresso Nordeste\n>> Autorização de Despesas\n>> Código: ' + registro.fin_ad_documento + '\n>> ' + registro.fin_ad_descricao_aut
        // );
    }




    render() {
        const { listaRegistros, refreshing, carregarRegistro, buscaSituacao } = this.state;

        // console.log('AutorizacaoDespesasScreen: ', this.state);

        return (
            <View style={{ flex: 1, }}>

                <FlatList
                    data={listaRegistros}
                    renderItem={this.renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyExtractor={registro => String(registro.fin_lanc_filial)}
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
        )
    }
}