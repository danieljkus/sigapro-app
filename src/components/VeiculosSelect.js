import React, { PureComponent } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import TextInput from '../components/TextInput';
import Colors from "../values/Colors";


class VeiculosSelect extends PureComponent {

    state = {
        carregando: false,
        codVeiculo: '',
        msgErro: '',
    };

    componentDidUpdate(propsAnterior, stateAnterior) {
        const { codVeiculo, onChange, id } = this.props;

        if (codVeiculo !== propsAnterior.codVeiculo) {
            this.setState({
                codVeiculo,
            })
            onChange(id, null);
            if (codVeiculo) {
                this.buscaRegistros(codVeiculo);
            }
        }
    }

    onChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);

        clearTimeout(this.buscaRegistrosId);
        this.buscaRegistrosId = setTimeout(() => {
            this.buscaRegistros(value);
        }, 1000);
    }

    buscaRegistros = (value) => {
        this.setState({ carregando: true });
        const { id, tipo, onChange, onErro } = this.props;

        let request;
        if (tipo === 'fichaSaida') {
            request = axios.get('/fichaViagem/buscaVeicSaida', {
                params: {
                    ativo: 'S',
                    veiculo: value
                }
            });
        } else if (tipo === 'fichaChegada') {
            request = axios.get('/fichaViagem/buscaVeicChegada', {
                params: {
                    ativo: 'S',
                    veiculo: value
                }
            });
        } else {
            request = axios.get('/listaVeiculos', {
                params: {
                    ativo: 'S',
                    veiculo: value
                }
            });
        }

        request.then(response => {
            const { data } = response;

            // console.log('VEICULO: ', data);
            
            if (data.msgErro === 'OK') {
                this.setState({
                    msgErro: '',
                })
                onChange(id, data)
                onErro('');
            } else {
                this.setState({
                    msgErro: data.msgErro,
                })
                onChange(id, null);
                onErro(data.msgErro);
            }

            this.setState({
                carregando: false,
            })
        }).catch(error => {
            console.warn(error.response);
            this.setState({
                carregando: false,
            });
        })

    }


    render() {
        const { label, value, enabled } = this.props;
        const { codVeiculo, msgErro, carregando } = this.state;

        let descricao;
        if (msgErro) {
            descricao = msgErro
        } else if (value) {
            descricao = value.adm_vei_placa + ' - ' + value.adm_veimarca_descricao_chassi;
        }

        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: "25%" }}>
                    <TextInput
                        label={label}
                        id="codVeiculo"
                        ref="codVeiculo"
                        value={codVeiculo}
                        maxLength={9}
                        keyboardType="numeric"
                        onChange={this.onChange}
                        enabled={enabled}
                    />
                </View>

                <View style={{ width: "75%" }}>
                    {carregando
                        ? (
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator style={{ margin: 10 }}  color={Colors.mediumGray}/>
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
            </View>
        );
    }
}

export default VeiculosSelect;
