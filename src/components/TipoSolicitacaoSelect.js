import React, { PureComponent } from 'react';
import {
    View, Text, ActivityIndicator, Modal, TouchableOpacity,
    ScrollView, FlatList
} from 'react-native';
import axios from 'axios';
import TextInput from './TextInput';
import Button from './Button';
import Colors from '../values/Colors';
import Icon from './Icon';
import { Card, Divider, SearchBar } from 'react-native-elements';


const Registro = ({ registro, onRegistroPress }) => {
    return (
        <Card containerStyle={{ padding: 0, margin: 0, marginVertical: 7, borderRadius: 0, backgroundColor: Colors.textDisabledLight, elevation: 0, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.compras_sugtip_codigo)}
            >
                <View style={{ paddingHorizontal: 16, paddingVertical: 5, flexDirection: 'row' }}>
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 13, flex: 1, marginTop: 5, }}>
                        #{registro.compras_sugtip_codigo}
                    </Text>
                </View>

                <Divider />

                <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                        {String(registro.compras_sugtip_descricao).trim()}
                    </Text>
                </View>
            </TouchableOpacity>
        </Card>
    )
}



class TipoSolicitacaoSelect extends PureComponent {

    state = {
        codTipoSol: '',
        carregando: false,

        listaRegistros: [],
        modalBuscaVisible: false,
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidUpdate(propsAnterior, stateAnterior) {
        const { codTipoSol, onChange, id } = this.props;

        // console.log('componentDidUpdate.this.props: ', this.props);
        // console.log('componentDidUpdate.propsAnterior: ', propsAnterior);

        if (codTipoSol !== propsAnterior.codTipoSol) {
            this.setState({
                codTipoSol,
            })
            onChange(id, null);
            if (codTipoSol) {
                this.buscaRegistros(codTipoSol);
            }
        }
    }

    componentDidMount() {
        // console.log('TipoSolicitacaoSelect.componentDidMount.this.props: ', this.props);
        if (this.props) {
            this.setState({
                compras_sugtip_codigo: this.props.compras_sugtip_codigo,
                tipoSolSelect: {
                    compras_sugtip_codigo: this.props.compras_sugtip_codigo,
                    compras_sugtip_descricao: String(this.props.compras_sugtip_descricao).trim()
                },
            });
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        // console.log('TipoSolicitacaoSelect.onInputChange: ', state);
        clearTimeout(this.buscaRegistrosId);
        this.buscaRegistrosId = setTimeout(() => {
            this.buscaRegistros(value);
        }, 1000);
    }

    buscaRegistros = (value) => {
        this.setState({ carregando: true });
        const { id, onChange } = this.props;

        axios.get('/listaTipoSol', {
            params: {
                codTipo: value
            }
        }).then(response => {
            const { data } = response;

            // console.log('TipoSolicitacaoSelect.buscaRegistros: ', data);

            if (data.length > 0) {
                onChange(id, data[0])
            } else {
                onChange(id, null)
            }

            this.setState({
                carregando: false,
            })
        }).catch(error => {
            console.warn(error);
            console.warn(error.response);
            this.setState({
                carregando: false,
            });
        })
    }




    // ---------------------------------------------------------------------------
    // MODAL PARA SELECIONAR TIPO DE SOLICITAÇÃO
    // ---------------------------------------------------------------------------

    onAbrirBuscaModal = (visible) => {
        this.setState({ modalBuscaVisible: visible });
        if (visible) {
            this.getListaRegistros();
        } else {
            this.setState({
                buscaNome: '',
                refreshing: false,
                carregarRegistro: false,
                carregando: false,
                carregarMais: false,
                pagina: 1,
            });
        }
    }

    getListaRegistros = () => {
        const { buscaNome, pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/listaTipoSolBusca', {
            params: {
                page: pagina,
                limite: 10,
                nome: buscaNome,
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
            console.warn(ex);
            console.warn(ex.response);
            this.setState({
                refreshing: false,
                carregando: false,
            });
        })
    }

    onBuscaNomeChange = (text) => {
        clearTimeout(this.buscaTimeout);
        this.termoBusca = text;
        this.setState({
            pagina: 1,
            buscaNome: text,
            refreshing: true,
        })
        this.buscaTimeout = setTimeout(() => {
            this.getListaRegistros();
        }, 1000);
    }

    onRefresh = () => {
        this.setState({
            pagina: 1,
            refreshing: true,
        }, this.getListaRegistros);
    }

    onRegistroPress = (compras_sugtip_codigo) => {
        this.setState({
            codTipoSol: compras_sugtip_codigo,
        });
        this.onAbrirBuscaModal(false);
        this.buscaRegistros(compras_sugtip_codigo);
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

    renderItem = ({ item, index }) => {
        return (
            <Registro
                registro={item}
                onRegistroPress={this.onRegistroPress}
            />
        )
    }



    render() {
        const { label, enabled, value } = this.props;
        const { codTipoSol, carregando, loading, refreshing, listaRegistros } = this.state;

        // console.log('TipoSolicitacaoSelect.this.props', this.props)
        // console.log('TipoSolicitacaoSelect.this.state', this.state)

        const tipo = codTipoSol ? codTipoSol : (value ? value.compras_sugtip_codigo : '');
        const descricao = value ? String(value.compras_sugtip_descricao).trim() : '';
        this.setState({ codTipoSol: tipo });

        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: "25%" }}>
                    <TextInput
                        label={label}
                        id="codTipoSol"
                        ref="codTipoSol"
                        value={codTipoSol}
                        maxLength={6}
                        keyboardType="numeric"
                        onChange={this.onInputChange}
                        enabled={enabled}
                    />
                </View>

                <View style={{ width: "7%", }}>
                    <Button
                        title=""
                        loading={loading}
                        onPress={() => { this.onAbrirBuscaModal(true) }}
                        buttonStyle={{ width: 30, height: 30, padding: 0, paddingTop: 20, marginLeft: -18 }}
                        backgroundColor={Colors.transparent}
                        icon={{
                            name: 'search',
                            type: 'font-awesome',
                            color: Colors.textPrimaryDark
                        }}
                    />
                </View>

                <View style={{ width: "75%", marginLeft: -23 }}>
                    {carregando
                        ? (
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator style={{ margin: 10 }} />
                                <Text> Buscando... </Text>
                            </View>
                        ) : (<TextInput
                            label=" "
                            value={descricao}
                            enabled={false}
                        />
                        )
                    }

                </View>





                {/* -------------------------------- */}
                {/* MODAL PARA BUSCA DA TIPO         */}
                {/* -------------------------------- */}
                <Modal
                    transparent={false}
                    visible={this.state.modalBuscaVisible}
                    onRequestClose={() => { console.log("Modal FECHOU.") }}
                    animationType={"slide"}
                >
                    <View style={{ backgroundColor: Colors.primary, flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => { this.onAbrirBuscaModal(!this.state.modalBuscaVisible) }}
                        >
                            <Icon family="MaterialIcons"
                                name="arrow-back"
                                color={Colors.textOnPrimary}
                                style={{ padding: 16 }} />
                        </TouchableOpacity>

                        <Text style={{
                            color: Colors.textPrimaryLight,
                            marginTop: 15,
                            marginBottom: 15,
                            marginLeft: 16,
                            textAlign: 'center',
                            fontSize: 20,
                            fontWeight: 'bold',
                        }}>Buscar Tipo de Solicitação</Text>
                    </View>

                    <SearchBar
                        placeholder="Busca por Descrição"
                        lightTheme={true}
                        onChangeText={this.onBuscaNomeChange}
                        inputStyle={{ backgroundColor: 'white' }}
                        containerStyle={{ backgroundColor: Colors.primaryLight }}
                        clearIcon={true}
                    />

                    <View style={{
                        flex: 1,
                        backgroundColor: Colors.background,
                    }} >

                        <ScrollView
                            style={{ flex: 1, }}
                            keyboardShouldPersistTaps="always"
                        >
                            <View style={{ marginTop: 4 }}>
                                <FlatList
                                    data={listaRegistros}
                                    renderItem={this.renderItem}
                                    contentContainerStyle={{ paddingBottom: 100 }}
                                    keyExtractor={registro => registro.compras_sugtip_codigo}
                                    onRefresh={this.onRefresh}
                                    refreshing={refreshing}
                                    onEndReached={this.carregarMaisRegistros}
                                    ListFooterComponent={this.renderListFooter}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </Modal>



            </View>
        );
    }
}

export default TipoSolicitacaoSelect;
