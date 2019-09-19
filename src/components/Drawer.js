import React, { PureComponent } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { Text, Divider } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';

import Icon from './Icon';
import Colors from '../values/Colors';
import { removeToken, getUsuario, getFilial, getPermissoes } from '../utils/LoginManager';

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

    state = {};

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

    render() {
        const { navigation } = this.props;
        const { usuario, filial } = this.state;
        if (!usuario) return null;
        return (
            <View style={{ flex: 1 }}>

                <View
                    style={{
                        height: 100,
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
                        Filial: {filial}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            {/* <DrawerItem
                                text="Ficha de Viagem"
                                onPress={() => navigation.navigate('FichaViagemScreen')}
                            />

                            <DrawerItem
                                text="Medir Tanque"
                                onPress={() => navigation.navigate('MedicoesTanqueScreen')}
                            />

                            <DrawerItem
                                text="Pré-Digitar NFe"
                                onPress={() => navigation.navigate('PreDigitacaoNotasScreen')}
                            /> */}

                            {/* <DrawerItem
                                text="Escala dos Veículos"
                                onPress={() => navigation.navigate('')}
                            /> */}
                            {/* <DrawerItem
                                text="Chack-list Manutenção"
                                onPress={() => navigation.navigate('')}
                            /> */}
                            {/* <DrawerItem
                                text="Check-list Pneus"
                                onPress={() => navigation.navigate('')}
                            /> */}
                            {/* <DrawerItem 
                                    text="Pedido de Peças"
                                    onPress={() => navigation.navigate('')} 
                             /> */}

                            <Divider style={{ backgroundColor: Colors.dividerDark }} />

                            <DrawerItem
                                text="Trocar Filial"
                                onPress={() => navigation.navigate('TrocarFilialScreen')}
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
