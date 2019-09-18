import React, { PureComponent } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import TextInput from '../components/TextInput';


class ServicosSelect extends PureComponent {
    state = {
        pas_serv_codigo: this.props.pas_serv_codigo,
        pas_serv_descricao: '',
        pas_serv_horario: '.',
        carregando: false
    };

    onInputChange = (id, value) => {
        const state = {};
        state[id] = value;
        this.setState(state);
        this.buscaRegistros(value);
    }

    buscaRegistros = (value) => {
        // this.setState({ pas_serv_descricao: '', pas_serv_horario: '' });
        if (value !== '') {
            this.setState({ carregando: true });
            axios.get('/listaServicos', {
                params: {
                    idf: value
                }
            }).then(response => {
                const { data } = response;

                this.setState({
                    carregando: false,
                    pas_serv_descricao: data.pas_serv_descricao,
                    pas_serv_horario: data.pas_serv_horario ? data.pas_serv_horario : ' ',
                })

            }).catch(error => {
                console.warn(error.response);
                this.setState({
                    carregando: false,
                });
            })
        }
    }


    render() {
        const { label } = this.props;
        const { pas_serv_codigo, pas_serv_descricao, pas_serv_horario, carregando } = this.state;

        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: "25%" }}>
                    <TextInput
                        label={label}
                        id="pas_serv_codigo"
                        ref="pas_serv_codigo"
                        value={pas_serv_codigo}
                        maxLength={6}
                        keyboardType="numeric"
                        onChange={this.onInputChange}
                    />
                </View>

                <View style={{ width: "75%" }}>
                    {carregando
                        ? (
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator style={{ margin: 10 }} />
                                <Text> Buscando... </Text>
                            </View>
                        ) : ( <TextInput
                                label={pas_serv_horario}
                                id="pas_serv_descricao"
                                ref="pas_serv_descricao"
                                value={pas_serv_descricao}
                                enabled={false}
                            />
                        )
                    }

                </View>
            </View>
        );
    }
}

export default ServicosSelect;