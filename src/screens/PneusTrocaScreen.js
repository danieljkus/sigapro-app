import React, { Component } from 'react';
import { View, ScrollView, RefreshControl, Text, FlatList } from 'react-native';
import { Card, Divider, CheckBox } from 'react-native-elements';

import axios from 'axios';
import StatusBar from '../components/StatusBar';
import { checkFormIsValid } from '../utils/Validator';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Colors from '../values/Colors';
import { ProgressDialog } from 'react-native-simple-dialogs';
import Alert from '../components/Alert';
import { getTemPermissao } from '../utils/LoginManager';
import FiliaisSelect from '../components/FiliaisSelect';
import moment from 'moment';


export default class PneusTrocaScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            salvando: false,

            filialChecked: true,
            recapadoraChecked: false,
            sucataChecked: false,

            filialSelect: null,
            motivoMovSelect: [],
            tipoSucSelect: [],

            ...props.navigation.state.params.registro,
        }
    }

    componentDidMount() {
        this.buscaMotivoMov();
        this.buscaTipoSuc();
    }

    buscaMotivoMov = () => {
        this.setState({ motivoMovSelect: [], pneus_cp_marca: '' });
        axios.get('/pneus/listaTipoMovimentacao', {
        }).then(response => {
            const { data } = response;
            const motivoMovSelect = data.map(regList => {
                return {
                    key: regList.pneus_tm_codigo,
                    label: regList.pneus_tm_descricao
                }
            });
            motivoMovSelect.unshift({ key: 0, label: "Selecione um Motivo" });
            this.setState({
                motivoMovSelect,
                registro: {
                    ...this.state.registro,
                    pneus_mov_tipo_mov: '',
                }
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                motivoMovSelect: [{ label: "Motivo não encontrda", key: 0 }],
            });
        })

    }

    buscaTipoSuc = () => {
        this.setState({ tipoSucSelect: [], pneus_cp_marca: '' });
        axios.get('/pneus/listaTipoSucateamento', {
        }).then(response => {
            const { data } = response;
            const tipoSucSelect = data.map(regList => {
                return {
                    key: regList.pneus_ts_codigo,
                    label: regList.pneus_ts_descricao
                }
            });
            tipoSucSelect.unshift({ key: 0, label: "Selecione um Tipo" });
            this.setState({
                tipoSucSelect,
            })
        }).catch(error => {
            console.error(error.response);
            this.setState({
                tipoSucSelect: [{ label: "Tipo não encontrda", key: 0 }],
            });
        })

    }

    onInputChange = (id, value) => {
        const { registro } = this.state;
        registro[id] = value;
        this.setState({ registro });
    }

    onInputChangeFilial = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        if (value) {
            const { registro } = this.state;
            registro.pneus_mov_filial = value.adm_fil_codigo;
            this.setState({
                registro
            });
        }
    }


    onFormSubmit = (event) => {
        if (this.state.registro.man_ev_veiculo_trocar !== '') {
            this.onSalvarRegistro();
        } else {
            Alert.showAlert('Preencha todos os campos obrigatórios');
        }
    }

    onSalvarRegistro = () => {
        this.setState({ salvando: true });
        axios.put('/escalaVeiculos/trocaCarro/' + this.state.registro.man_ev_idf, {
            man_ev_veiculo: this.state.man_ev_veiculo_trocar
        })
            .then(response => {
                console.log('onSalvarRegistro: ', response.data);
                if (response.data === 'OK') {
                    this.props.navigation.goBack(null);
                    if (this.props.navigation.state.params.onRefresh) {
                        this.props.navigation.state.params.onRefresh();
                    }
                } else {
                    this.setState({ salvando: false });
                    Alert.showAlert(response.data);
                }
            }).catch(ex => {
                this.setState({ salvando: false });
                console.warn(ex);
                console.warn(ex.response);
                Alert.showAlert(ex);
            })
    }

    mudaDestino = (destino) => {
        this.setState({
            filialChecked: destino === 'F' ? true : false,
            recapadoraChecked: destino === 'R' ? true : false,
            sucataChecked: destino === 'S' ? true : false,
        });
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
        const { filialChecked, recapadoraChecked, sucataChecked,
            filialSelect, motivoMovSelect, tipoSucSelect, registro, loading } = this.state;
        const { pneus_mov_idf, pneus_mov_pneu, vida, sulco1, sulco2, sulco3, sulco4, pneus_dim_descricao,
            pneus_mov_filial, pneus_mov_tipo_mov, pneus_mov_tipo_sucata, tipoTela } = this.state.registro;

        console.log('PneusTrocaScreen.this.state', this.state);

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <StatusBar />

                <ScrollView
                    style={{ flex: 1, }}
                    keyboardShouldPersistTaps="always"
                >

                    <View
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16 }}
                    >

                        <View style={{ marginBottom: 10 }}>
                            <Text style={{
                                color: Colors.primaryLight,
                                fontWeight: 'bold',
                                fontSize: 20,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Dados do Pneu
                            </Text>

                            <View style={{ paddingLeft: 10, marginBottom: 3, marginTop: 7, fontSize: 13, flexDirection: 'row' }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Pneu{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {pneus_mov_pneu}
                                    </Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Vida{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {String(vida) === '0' ? 'Novo' : vida + 'ª'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ paddingLeft: 10, marginBottom: 3, fontSize: 13, flexDirection: 'row' }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Sulcagem{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {sulco1 + ',' + sulco2 + ',' + sulco3 + ',' + sulco4}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ paddingLeft: 10, marginBottom: 3, fontSize: 13, flexDirection: 'row' }}>
                                <View style={{ flex: 2, flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Dimensão{': '}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {pneus_dim_descricao}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ paddingLeft: 10, marginBottom: 3, fontSize: 13, flexDirection: 'row' }}>
                                <View style={{ flex: 2 }}>
                                    <Text style={{ fontWeight: 'bold', color: Colors.primaryDark, fontSize: 15 }} >
                                        Localização
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 15 }} >
                                        {this.renderLocalizacao(registro)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {getTemPermissao('PNEUSTROCASCREEN') ? (
                        <View style={{ flex: 1, paddingHorizontal: 16 }}>
                            <Text style={{
                                color: Colors.primaryLight,
                                fontWeight: 'bold',
                                fontSize: 20,
                                borderBottomWidth: 2,
                                borderColor: Colors.dividerDark,
                            }}>
                                Destino do Pneu
                            </Text>

                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10 }}>
                                <View style={{ width: "30%", margin: 0, padding: 0 }}>
                                    <CheckBox
                                        center
                                        title='Filial'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={filialChecked}
                                        checkedColor={Colors.primaryLight}
                                        // uncheckedColor='green'
                                        onPress={() => this.setState({
                                            filialChecked: true,
                                            recapadoraChecked: false,
                                            sucataChecked: false,
                                        })}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View>

                                {/* <View style={{ width: "40%", margin: 0, padding: 0 }}>
                                    <CheckBox
                                        center
                                        title='Recapadora'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={recapadoraChecked}
                                        checkedColor={Colors.primaryLight}
                                        onPress={() => this.setState({
                                            filialChecked: false,
                                            recapadoraChecked: true,
                                            sucataChecked: false,
                                        })}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View> */}

                                <View style={{ width: "30%", margin: 0, padding: 0 }}>
                                    <CheckBox
                                        center
                                        title='Sucata'
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        checked={sucataChecked}
                                        checkedColor={Colors.primaryLight}
                                        onPress={() => this.setState({
                                            filialChecked: false,
                                            recapadoraChecked: false,
                                            sucataChecked: true,
                                        })}
                                        containerStyle={{ padding: 0, margin: 0, backgroundColor: 'transparent' }}
                                    />
                                </View>
                            </View>

                            {filialChecked ? (
                                <View>
                                    <FiliaisSelect
                                        label="Filial"
                                        id="filialSelect"
                                        codFilial={pneus_mov_filial}
                                        onChange={this.onInputChangeFilial}
                                        value={filialSelect}
                                    />

                                    <TextInput
                                        type="select"
                                        label="Motivo Saída"
                                        id="pneus_mov_tipo_mov"
                                        ref="pneus_mov_tipo_mov"
                                        value={pneus_mov_tipo_mov}
                                        selectedValue=""
                                        options={motivoMovSelect}
                                        onChange={this.onInputChange}
                                    />

                                </View>
                            ) : null}

                            {/* {recapadoraChecked ? (
                                <View>
                                    <TextInput
                                        label="Recapadora"
                                        id="pneus_mov_idf"
                                        ref="pneus_mov_idf"
                                        value={pneus_mov_idf}
                                        maxLength={4}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        label="NF Saída"
                                        id="pneus_mov_idf"
                                        ref="pneus_mov_idf"
                                        value={pneus_mov_idf}
                                        maxLength={4}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        label="Motivo Saída"
                                        id="pneus_mov_idf"
                                        ref="pneus_mov_idf"
                                        value={pneus_mov_idf}
                                        maxLength={4}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />
                                </View>
                            ) : null} */}

                            {sucataChecked ? (
                                <View>
                                    <TextInput
                                        type="select"
                                        label="Tipo Sucata"
                                        id="pneus_mov_tipo_sucata"
                                        ref="pneus_mov_tipo_sucata"
                                        value={pneus_mov_tipo_sucata}
                                        selectedValue=""
                                        options={tipoSucSelect}
                                        onChange={this.onInputChange}
                                    />
                                </View>
                            ) : null}


                            {tipoTela === 'VEIC' ? (
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        color: Colors.primaryLight,
                                        fontWeight: 'bold',
                                        fontSize: 20,
                                        marginBottom: 10,
                                        marginTop: 10,
                                        borderBottomWidth: 2,
                                        borderColor: Colors.dividerDark,
                                    }}>
                                        Dados do Pneu à ser Colocado
                                    </Text>

                                    <TextInput
                                        label="Pneu Colocado"
                                        id="pneus_mov_idf"
                                        ref="pneus_mov_idf"
                                        value={pneus_mov_idf}
                                        maxLength={4}
                                        onChange={this.onInputChange}
                                        keyboardType="numeric"
                                    />

                                </View>
                            ) : null}



                            <Button
                                title="Gravar"
                                loading={this.state.salvando}
                                onPress={this.onFormSubmit}
                                color={Colors.textOnPrimary}
                                buttonStyle={{ marginBottom: 30, marginTop: 10 }}
                                icon={{
                                    name: 'check',
                                    type: 'font-awesome',
                                    color: Colors.textOnPrimary
                                }}
                            />

                        </View>
                    ) : null}


                    <Text style={{ color: Colors.textSecondaryDark, fontSize: 6, marginTop: 30 }}>
                        {pneus_mov_idf}
                    </Text>

                    <ProgressDialog
                        visible={this.state.salvando}
                        title="SIGA PRO"
                        message="Gravando. Aguarde..."
                    />
                </ScrollView>
            </View>
        )
    }
}