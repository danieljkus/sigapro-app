import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, StatusBar, SafeAreaView} from 'react-native';
import {TabView, SceneMap} from 'react-native-tab-view';
import Colors from '../values/Colors';

import FichaViagemSaidaScreen from './FichaViagemSaidaScreen';
import FichaViagemChegadaScreen from './FichaViagemChegadaScreen';
import HeaderComponent from "../components/HeaderComponent";

const LazyPlaceholder = ({route}) => (
    <View
        style={styles.scene}
    >
        <Text>Carregando {route.title}…</Text>
    </View>
);

export default class FichaViagemScreen extends Component {
    state = {
        index: 0,
        routes: [
            {key: 'saida', title: 'Saída'},
            {key: 'chegada', title: 'Chegada'},
        ],
    };

    _handleIndexChange = index => this.setState({index});
    _renderLazyPlaceholder = ({route}) => <LazyPlaceholder route={route}/>;

    render() {
        return (
            <SafeAreaView style={{backgroundColor: Colors.background, flex: 1}}>
                <HeaderComponent
                    color={'white'}
                    titleCenterComponent={'Ficha de Viagem'}
                    pressLeftComponen={() => this.props.navigation.goBack()}
                    iconLeftComponen={'chevron-left'}
                />

                <TabView
                    style={styles}
                    lazy
                    navigationState={this.state}
                    renderScene={SceneMap({
                        saida: FichaViagemSaidaScreen,
                        chegada: FichaViagemChegadaScreen,
                    })}
                    renderLazyPlaceholder={this._renderLazyPlaceholder}
                    onIndexChange={this._handleIndexChange}
                    initialLayout={{width: Dimensions.get('window').width}}
                />
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    scene: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundColor,
    },
});
