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
                onPress={() => onRegistroPress(registro.man_serv_codigo)}
            >
                <View style={{ paddingHorizontal: 16, paddingVertical: 5, flexDirection: 'row' }}>
                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 13, flex: 1, marginTop: 5, }}>
                        #{registro.man_serv_codigo}
                    </Text>
                </View>

                <Divider />

                <View style={{ paddingLeft: 20, paddingVertical: 4 }}>
                    <Text style={{ color: Colors.textPrimaryDark, fontSize: 15 }}>
                        {registro.man_serv_descricao}
                    </Text>
                </View>
            </TouchableOpacity>
        </Card>
    )
}



class ServicosOSSelect extends PureComponent {

    state = {
        codServico: '',
        codServ: '',
        tipoServico: '',
        servicoSelect: [],
        servicoSelectCombo: [],
        listaRegistros: [],
        modalBuscaVisible: false,
        refreshing: false,
        carregarRegistro: false,
        carregando: false,
        carregarMais: false,
        pagina: 1,
    };

    componentDidUpdate(propsAnterior, stateAnterior) {
        const { codServico, onChange, id } = this.props;

        // console.log('componentDidUpdate.this.props: ', this.props);
        // console.log('componentDidUpdate.propsAnterior: ', propsAnterior);

        if (codServico !== propsAnterior.codServico) {
            this.setState({
                codServico,
            })
            onChange(id, null);
            if (codServico) {
                this.buscaRegistros(codServico);
            }
        }
    }

    componentDidMount() {
        // console.log('ServicosOSSelect.componentDidMount.this.props: ', this.props);
        if (this.props) {
            if (this.props.select) {
                this.getServicosSelect()
            } else {
                this.setState({
                    servicoSelect: {
                        man_serv_codigo: this.props.man_serv_codigo,
                        man_serv_descricao: this.props.man_serv_descricao
                    },
                });
            }
        }
    }

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        // console.log('ServicosOSSelect.onInputChange: ', state);
        clearTimeout(this.buscaRegistrosId);
        this.buscaRegistrosId = setTimeout(() => {
            this.buscaRegistros(value);
        }, 1000);
    }

    buscaRegistros = (value) => {
        this.setState({ carregando: true });
        const { id, onChange, tipoServico, grupo } = this.props;

        axios.get('/listaServico', {
            params: {
                codigo: value,
                tipoServico,
                grupo,
            }
        }).then(response => {
            const { data } = response;

            // console.log('ServicosOSSelect.buscaRegistros: ', data);

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

    getServicosSelect = () => {
        const { pagina } = this.state;
        this.setState({ carregando: true });

        // console.log('getServicosSelect');

        axios.get('/listaServicosBusca', {
            params: {
                page: pagina,
                limite: 10,
                tipoServico: this.props.tipoServico,
                select: this.props.select,
                grupo: this.props.grupo,
                veiculo: this.props.veiculo,
            }
        }).then(response => {

            const { data } = response;

            // console.log('getServicosSelect: ', data);

            const servicoSelectCombo = data.map(regList => {
                return {
                    key: regList.man_sos_servico,
                    label: regList.man_sos_servico + ' - ' + regList.man_serv_descricao
                }
            });

            this.setState({
                servicoSelectCombo,
                refreshing: false,
                carregando: false,
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




    // ---------------------------------------------------------------------------
    // MODAL PARA SELECIONAR SERVIÇO DA O.S
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
        const { buscaNome, tipoServico, pagina, listaRegistros } = this.state;
        this.setState({ carregando: true });

        axios.get('/listaServicosBusca', {
            params: {
                page: pagina,
                limite: 10,
                nome: buscaNome,
                veiculo: this.props.veiculo,
                tipoServico: this.props.tipoServico,
                grupo: this.props.grupo,
            }
        }).then(response => {
            // console.log('getServicosSelect: ', response.data);

            if (this.props.tipoServico === 'P') {
                
                const listaRegistros = response.data.map(regList => {
                    return {
                        man_serv_codigo: regList.man_sos_servico,
                        man_serv_descricao: regList.man_sos_servico + ' - ' + regList.man_serv_descricao
                    }
                });
                this.setState({
                    listaRegistros,
                    refreshing: false,
                    carregando: false,
                })

            } else {

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

            }
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

    onRegistroPress = (man_serv_codigo) => {
        this.setState({
            codServico: man_serv_codigo,
        });
        this.onAbrirBuscaModal(false);
        this.buscaRegistros(man_serv_codigo);
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
        const { label, enabled, value, select } = this.props;
        const { codServico, codServ, tipoServico, servicoSelect, servicoSelectCombo,
            carregando, loading, refreshing, listaRegistros } = this.state;

        // console.log('ServicosOSSelect.this.props', this.props)
        // console.log('ServicosOSSelect.this.state', this.state)

        const servico = codServico ? codServico : (value ? value.man_serv_codigo : '');
        const tipo = tipoServico ? tipoServico : '';
        const descricao = value ? value.man_serv_descricao : '';
        this.setState({ codServico: servico, tipoServico: tipo });

        return (
            <View>
                {!select ? (
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: "25%" }}>
                            <TextInput
                                label={label}
                                id="codServico"
                                ref="codServico"
                                value={codServico}
                                maxLength={6}
                                keyboardType="numeric"
                                onChange={this.onInputChange}
                                enabled={enabled}
                                height={50}
                            />
                        </View>

                        <View style={{ width: "7%", }}>
                            <Button
                                title=""
                                loading={loading}
                                onPress={() => { this.onAbrirBuscaModal(true) }}
                                buttonStyle={{ width: 30, height: 30, padding: 0, paddingTop: 40, marginLeft: -18 }}
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
                                    height={50}
                                    multiline={true}
                                />
                                )
                            }
                        </View>
                    </View>
                ) : (
                        <TextInput
                            type="select"
                            label="Serviço"
                            id="codServ"
                            ref="codServ"
                            value={codServ}
                            options={servicoSelectCombo}
                            onChange={this.onInputChange}
                            // height={50}
                            multiline={true}
                        />
                    )}





                {/* -------------------------------- */}
                {/* MODAL PARA BUSCA DA SERVICO      */}
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
                        }}>Buscar Serviço</Text>
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
                                    keyExtractor={registro => registro.man_serv_codigo}
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

export default ServicosOSSelect;
