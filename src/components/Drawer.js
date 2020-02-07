import React, { PureComponent } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { Text, Divider } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';

import Icon from './Icon';
import Colors from '../values/Colors';
import { removeToken, getUsuario, getFilial, getPermissoes, getEmpresa } from '../utils/LoginManager';

const DrawerItem = ({ text, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text
                style={{
                    fontSize: 16,
                    padding: 10,
                    color: Colors.textPrimaryLight,
                }}
            >
                {text}
            </Text>
        </TouchableOpacity>
    )
}

class Drawer extends PureComponent {

    state = {
        permissoes: []
    };

    componentWillMount() {
        this.refreshUsuario();
    }

    componentWillReceiveProps() {
        this.refreshUsuario();
    }

    refreshUsuario = () => {
        getUsuario().then(usuario => {
            this.setState({ usuario });
        })
        getPermissoes().then(permissoes => {
            this.setState({ permissoes });
        })
        getEmpresa().then(empresa => {
            this.setState({ empresa });
        })
        getFilial().then(filial => {
            this.setState({ filial });
        })
    }

    onSair = async () => {
        await removeToken();
        this.replaceScreen("LoginScreen");
    }

    replaceScreen = (routeName) => {
        const { navigation } = this.props;
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: routeName })
            ]
        })
        navigation.dispatch(resetAction);
    }

    temPermissao = (permissao) => {
        if ((this.state.permissoes) && (this.state.permissoes.length > 0)) {
            const iIndItem = this.state.permissoes.findIndex(registro => registro.adm_fsp_nome === permissao);
            return iIndItem >= 0 ? true : false;
        }
        return false;
    }

    render() {
        const { navigation } = this.props;
        const { usuario, filial, empresa } = this.state;
        if (!usuario) return null;

        return (
            <View style={{ flex: 1 }}>

                <View
                    style={{
                        height: 120,
                        padding: 16,
                        backgroundColor: Colors.primaryLight,
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start',
                    }}>
                    <Icon
                        family="MaterialIcons"
                        name="person"
                        size={40}
                        color={Colors.textSecondaryLight}
                    />
                    <Text
                        style={{
                            fontSize: 14,
                            color: Colors.textSecondaryLight
                        }}
                    >
                        Usuário: {usuario.adm_pes_nome}
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: Colors.textSecondaryLight
                        }}
                    >
                        Filial: {filial}    {empresa ? 'Empresa: ' + String(empresa) : ''}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            {this.temPermissao('ESCALAVEICULOSSCREEN') ? (
                                <DrawerItem
                                    text="Escala dos Veículos"
                                    onPress={() => navigation.navigate('EscalaVeiculosScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {this.temPermissao('VEICULOSSCREEN') ? (
                                <DrawerItem
                                    text="Veículos"
                                    onPress={() => navigation.navigate('VeiculosScreen')}
                                />
                            ) : null}

                            {this.temPermissao('PNEUSVEICULOSSCREEN') ? (
                                <DrawerItem
                                    text="Pneus nos Veículos"
                                    onPress={() => navigation.navigate('PneusVeiculosScreen')}
                                />
                            ) : null}

                            {this.temPermissao('PNEUSVEICULOSSCREEN') ? (
                                <DrawerItem
                                    text="Pneus em Estoque"
                                    onPress={() => navigation.navigate('PneusEstoqueScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {empresa && this.temPermissao('FICHAVIAGEMSCREEN') ? (
                                <DrawerItem
                                    text="Ficha de Viagem"
                                    onPress={() => navigation.navigate('FichaViagemScreen')}
                                />
                            ) : null}

                            {empresa && this.temPermissao('MEDICOESTANQUESDIESELCREEN') ? (
                                <DrawerItem
                                    text="Medir Tanque Diesel"
                                    onPress={() => navigation.navigate('MedicoesTanqueDieselScreen')}
                                />
                            ) : null}

                            {empresa && this.temPermissao('MEDICOESTANQUEARLASCREEN') ? (
                                <DrawerItem
                                    text="Medir Tanque Arla"
                                    onPress={() => navigation.navigate('MedicoesTanqueArlaScreen')}
                                />
                            ) : null}

                            {empresa && this.temPermissao('PREDIGITACAONOTASSCREEN') ? (
                                <DrawerItem
                                    text="Pré-Digitar NFe"
                                    onPress={() => navigation.navigate('PreDigitacaoNotasScreen')}
                                />
                            ) : null}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            {this.temPermissao('TROCARFILIALSCREEN') ? (
                                <DrawerItem
                                    text="Trocar Filial"
                                    onPress={() => navigation.navigate('TrocarFilialScreen')}
                                />
                            ) : null}

                            <DrawerItem
                                text="Trocar Senha"
                                onPress={() => navigation.navigate('TrocarSenhaScreen')}
                            />

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            <DrawerItem text="Sair" onPress={this.onSair} />
                        </View>
                    </ScrollView>
                </View>

            </View>
        )
    }
}

export default Drawer;
