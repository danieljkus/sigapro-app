// CREATED BY MAYK FELIX 08/02/2023
import {Pressable, View} from "react-native";
import {Header, Icon, Text} from "react-native-elements";
import React, {PureComponent} from 'react';
import Colors from "../values/Colors";
import NetInfo from "@react-native-community/netinfo";

export default class HeaderComponent extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            color: props?.color || '#1F829C',
            netStatus: false,
        }
    }


    componentDidMount(): void {
        NetInfo.addEventListener(state => {
            this.onNetEvento(state)
        });
    }

    onNetEvento = (info) => {
        this.setState({netStatus: !info?.isConnected});
    };

    render() {
        return (
            <View>
                <Header
                    innerContainerStyles={{
                        backgroundColor: 'transparent'
                    }}
                    outerContainerStyles={{
                        backgroundColor: '#1F829C',
                        width: '100%',
                        height: 55,
                    }}
                    // backgroundColor={'white'}
                    // placement="left"
                    leftComponent={(
                        <Pressable
                            onPress={() => this?.props?.pressLeftComponen()}
                            style={{
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'center',
                                // height: 20,
                            }}>
                            <Icon name={this?.props?.iconLeftComponen} color={this?.state?.color} size={32}/>
                        </Pressable>
                    )}
                    centerComponent={(
                        <View style={{
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            // height: 30,
                            // width: 200,
                        }}>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{
                                    fontSize: 24,
                                    fontWeight: '500',
                                    color: this?.state?.color
                                }}>{this?.props?.titleCenterComponent}
                                </Text>


                                {this?.state?.netStatus ?
                                    <Icon name={'cloud'}
                                          color={this?.state?.color} size={32}
                                          containerStyle={{left: 5}}
                                    />
                                    :
                                    null
                                }
                            </View>
                        </View>
                    )}
                    // rightComponent={{icon: 'home', color: '#fff'}}
                />


                {this?.state?.netStatus ?
                    <View style={{
                        backgroundColor: Colors.white,
                        display: 'flex'
                    }}>

                        <Text style={{textAlign: 'center', color: '#d50000', marginTop: 2, fontWeight: 'bold'}}>
                            {'Dispositivo sem conexão'}
                        </Text>
                    </View>
                    : null}
            </View>

        )
    }

}

HeaderComponent.defaultProps = {
    color: 'white',
    titleCenterComponent: '',
    iconLeftComponen: '',
    pressLeftComponen: undefined,
};
