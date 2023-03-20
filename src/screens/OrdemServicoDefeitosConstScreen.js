import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    SafeAreaView
} from 'react-native';
import axios from 'axios';
import { Card, Divider, Icon } from 'react-native-elements';
import { ProgressDialog } from 'react-native-simple-dialogs';
import StatusBar from '../components/StatusBar';
import Colors from '../values/Colors';
import { getFilial } from '../utils/LoginManager';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import HeaderComponent from "../components/HeaderComponent";

const SwitchStyle = OS === 'ios' ? { transform: [{ scaleX: .7 }, { scaleY: .7 }] } : undefined;
const { OS } = Platform;


const CardViewItem = ({ registro, onRegistroPress, onRegistroLongPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <View style={{ borderLeftWidth: 5, borderLeftColor: registro.man_osd_situacao === 'A' ? 'red' : '#10734a' }}>
                <TouchableOpacity
                    onPress={() => onRegistroPress(registro)}
                    onLongPress={() => onRegistroLongPress(registro.man_osd_sequencia)}
                >
                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5, paddingTop: 5 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.primaryDark }} >
                            Situação {': '}
                        </Text>
                        <Text>
                            {registro.man_osd_situacao === 'A' ? 'ABERTO' : 'FINALIZADO'}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingLeft: 20, paddingBottom: 5 }}>
                        <Text>
                            {registro.man_osd_defeitos}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Card>
    )
}

export default class OrdemServicoDefeitosConstScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            man_os_idf: props.navigation.state.params.man_os_idf ? props.navigation.state.params.man_os_idf : 0,
            man_grupo_servico: props.navigation.state.params.man_grupo_servico ? props.navigation.state.params.man_grupo_servico : 0,
            man_os_situacao: props.navigation.state.params.man_os_situacao ? props.navigation.state.params.man_os_situacao : '',
            man_osd_defeitos: '',

            listaRegistros: [],
            refreshing: false,
            carregando: false,
            carregarMais: false,
            loading: false,
            pagina: 1,
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

        axios.get('/ordemServicos/listaDefeitosConst/' + this.state.man_os_idf, {
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

    onRegistroPress = (registro) => {
        // console.log('onRegistroPress: ', registro);

        const reg = {
            controle: this.state.man_os_idf,
            seq: registro.man_osd_sequencia,
            situacao: registro.man_osd_situacao === 'A' ? 'F' : 'A',
        };

        // console.log('onRegistroPress: ', reg);

        this.setState({ carregarRegistro: true });
        axios.put('/ordemServicos/mudaSituacaoDefeitosConst', reg)
            .then(response => {
                this.setState({ carregarRegistro: false });

                // console.log('onRegistroPress: ', response.data);

                this.setState({ carregarRegistro: false });
                this.getListaRegistros();

            }).catch(ex => {
                this.setState({ carregarRegistro: false });
                console.warn(ex);
                console.warn(ex.response);
            });
    }

    onRegistroLongPress = (man_osd_sequencia) => {
        Alert.alert("Excluir registro", `Deseja excluir este Serviço?`, [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: () => this.onExcluirRegistro(man_osd_sequencia),
                style: "destructive"
            }
        ])
    }

    onExcluirRegistro = (man_osd_sequencia) => {
        this.setState({ refreshing: true });
        axios.delete('/ordemServicos/deleteDefeitosConst/' + this.state.man_os_idf + '/' + man_osd_sequencia)
            .then(response => {
                const listaRegistros = [...this.state.listaRegistros];
                const index = listaRegistros.findIndex(registro => registro.man_osd_sequencia === man_osd_sequencia);
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

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
    }

    onFormSubmit = (event) => {
        if ((!this.state.man_osd_defeitos) || (this.state.man_osd_defeitos === '')) {
            Alert.alert("Atenção", `Informe um Defeito`, [{ text: "OK" }])
            return;
        }
        this.onSalvarRegistro();
    }

    onSalvarRegistro = () => {
        const { man_os_idf, man_grupo_servico, man_osd_defeitos } = this.state;

        const registro = {
            man_osf_ordem_servico: man_os_idf,
            man_osd_grupo: man_grupo_servico,
            man_osd_defeitos,
            man_osd_situacao: 'A',
        };

        // console.log('onSalvarRegistro: ', registro);
        // return;

        this.setState({ salvado: true });

        let axiosMethod;
        // if (man_os_idf) {
        // axiosMethod = axios.put('/ordemServicos/updateCorretivas/' + this.state.man_os_idf + '/' + String(servico_select.man_serv_codigo), registro);
        // } else {
        axiosMethod = axios.post('/ordemServicos/storeDefeitosConst', registro);
        // }
        axiosMethod.then(response => {
            this.setState({
                man_osd_defeitos: '',
                codServico: '',
                salvado: false,
                refreshing: true
            });
            this.getListaRegistros();
        }).catch(ex => {
            this.setState({ salvado: false });
            console.warn(ex);
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



    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // ------------------------------------------------------------


    render() {
        const { listaRegistros, man_osd_defeitos, refreshing, carregarRegistro, loading, salvado } = this.state;

        // console.log('OrdemServicoDefeitosConstScreen: ', this.state);

        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Defeitos Constatados'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, marginTop: 20 }}
                    >
                        <TextInput
                            label="Descrição do Defeito"
                            id="man_osd_defeitos"
                            ref="man_osd_defeitos"
                            value={man_osd_defeitos}
                            maxLength={1000}
                            onChange={this.onInputChange}
                            multiline={true}
                            height={50}
                        />

                        {this.state.man_os_situacao === 'A' ? (
                            <Button
                                title="SALVAR DEFEITO"
                                loading={salvado}
                                onPress={this.onFormSubmit}
                                buttonStyle={{ height: 45 }}
                                backgroundColor={Colors.buttonPrimary}
                                textStyle={{
                                    fontWeight: 'bold',
                                    fontSize: 15
                                }}
                                icon={{
                                    name: 'check',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />
                        ) : null}

                    </View>

                    <FlatList
                        data={listaRegistros}
                        renderItem={this.renderItem}
                        contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
                        keyExtractor={registro => String(registro.man_osd_sequencia)}
                        onRefresh={this.onRefresh}
                        refreshing={refreshing}
                        onEndReached={this.carregarMaisRegistros}
                        ListFooterComponent={this.renderListFooter}
                    />

                </ScrollView>

                <ProgressDialog
                    visible={carregarRegistro}
                    title="SIGA PRO"
                    message="Aguarde..."
                />

            </SafeAreaView >
        )
    }
}
