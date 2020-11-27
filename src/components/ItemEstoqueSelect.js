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
        <Card containerStyle={{ padding: 0, margin: 7, borderRadius: 2, }}>
            <TouchableOpacity
                onPress={() => onRegistroPress(registro.estoq_ie_codigo)}
            >
                <View style={{ paddingHorizontal: 16, paddingVertical: 5, flexDirection: 'row' }}>
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 13, flex: 1, marginTop: 5, }}>
                        #{registro.estoq_ie_codigo}
                    </Text>
                </View>

                <Divider />

                <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                        {String(registro.estoq_ie_descricao).trim()}
                    </Text>
                </View>
            </TouchableOpacity>
        </Card>
    )
}



class ItemEstoqueSelect extends PureComponent {

    state = {
        codItem: '',
        enabled: true,
        // buscaEstoque: 1,
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
        const { codItem, onChange, id } = this.props;

        // console.log('componentDidUpdate.this.props: ', this.props);
        // console.log('componentDidUpdate.propsAnterior: ', propsAnterior);

        if (codItem !== propsAnterior.codItem) {
            this.setState({
                codItem,
            })
            onChange(id, null);
            if (codItem) {
                this.buscaRegistros(codItem);
            }
        }
    }

    componentDidMount() {
        // console.log('ItemEstoqueSelect.componentDidMount.this.props: ', this.props);
        if (this.props) {
            this.setState({
                item_select: {
                    estoq_ie_codigo: this.props.estoq_ie_codigo,
                    estoq_ie_descricao: String(this.props.estoq_ie_descricao).trim()
                },
            });
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        // console.log('ItemEstoqueSelect.onInputChange: ', state);

        clearTimeout(this.buscaRegistrosId);
        this.buscaRegistrosId = setTimeout(() => {
            this.buscaRegistros(value);
        }, 1000);
    }

    buscaRegistros = (value) => {
        this.setState({ carregando: true });
        const { id, onChange, buscaEstoque } = this.props;

        console.log('ItemEstoqueSelect.buscaRegistros: ', buscaEstoque);

        axios.get('/listaItens', {
            params: {
                codItem: value,
                buscaEstoque: buscaEstoque,
            }
        }).then(response => {
            const { data } = response;

            console.log('ItemEstoqueSelect.buscaRegistros: ', data);

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
    // MODAL PARA SELECIONAR ITEM
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

        axios.get('/listaItensBusca', {
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

    onRegistroPress = (estoq_ie_codigo) => {
        this.setState({
            codItem: estoq_ie_codigo,
        });
        this.onAbrirBuscaModal(false);
        this.buscaRegistros(estoq_ie_codigo);
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
        const { codItem, carregando, loading, refreshing, listaRegistros } = this.state;

        // console.log('ItemEstoqueSelect.this.props', this.props)
        // console.log('ItemEstoqueSelect.this.state', this.state)

        const codConta = codItem ? codItem : (value ? value.estoq_ie_codigo : '');
        const descricao = value ? String(value.estoq_ie_descricao).trim() : '';
        // const buscaEst = buscaEstoque ? buscaEstoque : 1;
        this.setState({ codItem: codConta });

        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: "25%" }}>
                    <TextInput
                        label={label}
                        id="codItem"
                        ref="codItem"
                        value={codItem}
                        maxLength={6}
                        keyboardType="numeric"
                        onChange={this.onInputChange}
                        enabled={enabled}
                        height={50}
                    />
                </View>

                <View style={{ width: "7%", }}>
                    {enabled ? (
                        <Button
                            title=""
                            loading={loading}
                            onPress={() => { this.onAbrirBuscaModal(true) }}
                            buttonStyle={{ width: 30, height: 30, padding: 0, paddingTop: 10, marginLeft: -18 }}
                            backgroundColor={Colors.transparent}
                            icon={{
                                name: 'search',
                                type: 'font-awesome',
                                color: Colors.textPrimaryDark
                            }}
                        />
                    ) : null}
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
                            height={50}
                            multiline={true}
                        />
                        )
                    }

                </View>





                {/* -------------------------------- */}
                {/* MODAL PARA BUSCA DA codConta       */}
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
                        }}>Buscar Item Estoque</Text>
                    </View>

                    <SearchBar
                        placeholder="Busca por Descrição"
                        lightTheme={true}
                        onChangeText={this.onBuscaNomeChange}
                    />

                    <View style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        backgroundColor: '#ffffff',
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
                                    keyExtractor={registro => registro.estoq_ie_codigo}
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

export default ItemEstoqueSelect;
