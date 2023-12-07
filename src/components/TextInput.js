import React, { PureComponent } from 'react';
import { View, TextInput as TI, Picker, Platform, ActionSheetIOS } from 'react-native';
import { Text } from 'react-native-elements';
import Colors from '../values/Colors';
import { TouchableOpacity } from "react-native-gesture-handler";
import { formatDate } from "../utils/Maskers";
import DatePickerComponent from "./DatePiker";

class TextInput extends PureComponent {

    state = {
        valid: null,
        selected: null,
        showPicker: false,
    };

    onChange = (text) => {
        const { validator, masker, id, onChange } = this.props;
        if (masker) {
            text = masker(text);
        }
        if (validator) {
            this.setState({ valid: !!validator(text) });
        }
        onChange(id, text);
    };

    onChangeDate = (event, date) => {
        let selectedDate = formatDate(date);
        const { validator, masker, id, onChange } = this.props;
        if (masker) {
            selectedDate = masker(selectedDate);
        }
        if (validator) {
            this.setState({ valid: !!validator(selectedDate) });
        }
        onChange(id, selectedDate);
    };

    isValid = () => {
        if (!this.props.required)
            return true;

        const { validator, value } = this.props;
        let valid = false;
        if (validator) {
            valid = !!validator(value);
        } else {
            valid = !!value;
        }
        this.setState({ valid });

        return valid;
    }

    render() {
        const {
            label, id, errorMessage, type, dateFormat, dateText, value, data,
            required, onChange, editable, secureTextEntry, keyboardType, autoCapitalize,
            style, itemStyle, itemTextStyle, multiline, numberOfLines, onBlur, enabled,
            options = [], iniciarVazio, placeholder, minDate, maxDate, fontSize,
            maxLength, height, borderWidth, pickerItemsFefault, ...others
        } = this.props;
        const { valid } = this.state;

        const borderColor = valid === false ? 'red' : Colors.accent;

        let CustomInput;

        if ((type === 'date') || (type === 'time') || (type === 'datetime')) {
            CustomInput = (
                <View style={{
                    borderBottomWidth: borderWidth === 0 ? 0 : 1,
                    borderLeftWidth: borderWidth === 0 ? 0 : 1,
                    margin: 0,
                    padding: 0,
                    borderColor: Colors.dividerDark,
                }}>
                    {label ? (
                        <Text
                            style={{
                                color: Colors.textSecondaryDark,
                                fontSize: 12,
                                marginLeft: 3,
                                marginBottom: 0,
                            }}>
                            {label}
                        </Text>
                    ) : null}

                    <View style={{
                        paddingBottom: 2,
                        paddingLeft: 16,
                        height: 22,
                    }}>
                        <DatePickerComponent
                            dateText={dateText || null}
                            ref="TextInput"
                            mode={type}
                            value={value}
                            onChange={this.onChange}
                            format={dateFormat}
                            minDate={minDate}
                            maxDate={maxDate}
                            confirmBtnText="Confirmar"
                            cancelBtnText="Cancelar"
                            showIcon={true}
                            is24Hour={true}
                            style={{
                                width: '100%',
                                ...style
                            }}
                        />
                    </View>
                </View>
            )

        } else if (type === "select") {
            const pickerItems = [];
            if (iniciarVazio) {
                pickerItems.push(<Picker.Item key={0} label="Todos" value={0} />);
            }
            options.forEach((i, index) => (
                pickerItems.push(<Picker.Item key={index + 1} label={i.label} value={i.key} />)
            ))
            CustomInput = (
                <View style={{
                    borderBottomWidth: borderWidth === 0 ? 0 : 1,
                    borderLeftWidth: borderWidth === 0 ? 0 : 1,
                    borderColor: Colors.dividerDark,
                }}>
                    {label ? (
                        <Text
                            style={{
                                color: Colors.textSecondaryDark,
                                fontSize: 12,
                                marginLeft: 3,
                            }}
                        >
                            {label}
                        </Text>
                    ) : null}

                    <View style={{
                        paddingBottom: 2,
                        paddingLeft: 10,
                    }}>


                        {Platform.OS === 'android' ?

                            <Picker
                                note
                                mode="dialog"
                                selectedValue={value}
                                onValueChange={this.onChange}
                                enabled={enabled}
                                style={{
                                    width: '100%',
                                    color: Colors.textPrimaryDark,
                                    height: height ? height : 25,
                                    minHeight: 25,
                                    ...style
                                }}

                                textStyle={{}}
                                itemStyle={{
                                    height: 50,
                                    bottom: 20,
                                    ...itemStyle,
                                }}

                                itemTextStyle={{
                                    ...itemTextStyle
                                }}

                            >
                                {pickerItems}
                            </Picker>

                            :

                            <TouchableOpacity

                                editable={enabled}
                                onPress={() => {
                                    let optionsItems = ['Cancelar'];
                                    optionsItems = optionsItems.concat(
                                        pickerItems?.map(({ props }) => {
                                            if (props?.label) {
                                                return props?.label;
                                            }
                                        }),
                                    );
                                    ActionSheetIOS.showActionSheetWithOptions(
                                        {
                                            options: optionsItems,
                                            //destructiveButtonIndex: 2,
                                            title: 'Selecione',
                                            cancelButtonIndex: 0,
                                            // message: 'Please choose an option from the list below'
                                        },
                                        (buttonIndex) => {
                                            if (buttonIndex !== 0) {
                                                this.onChange(`${buttonIndex}`)
                                                this.setState({ selected: optionsItems[buttonIndex] })
                                            }

                                        },
                                    );
                                }}>
                                <View
                                    numberOfLines={1}
                                    style={{
                                        height: height ? height : 25,
                                        justifyContent: 'center',
                                    }}>
                                    <Text style={{ textAlign: 'left', fontSize }}>
                                        {this?.state?.selected || pickerItems[pickerItemsFefault || 0]?.props?.label || 'Selecione'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                        }


                    </View>
                </View>
            )

        } else {
            const strValue = typeof value === 'number' ? String(value) : value;
            CustomInput = (
                <View style={{
                    borderBottomWidth: borderWidth === 0 ? 0 : 1,
                    borderLeftWidth: borderWidth === 0 ? 0 : 1,
                    margin: 0,
                    padding: 0,
                    borderColor: Colors.dividerDark,
                }}>
                    {label ? (
                        <Text
                            style={{
                                color: Colors.textSecondaryDark,
                                fontSize: 12,
                                marginLeft: 3,
                            }}>
                            {label}
                        </Text>
                    ) : null}

                    <TI ref="TextInput"
                        secureTextEntry={secureTextEntry}
                        underlineColorAndroid={Colors.transparent}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.textHintDark}
                        value={strValue}
                        onChangeText={this.onChange}
                        autoCapitalize={autoCapitalize}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        onBlur={onBlur}
                        editable={enabled}
                        maxLength={maxLength}
                        returnKeyType={(((keyboardType === 'numeric') || (keyboardType === 'decimal-pad')) && Platform.OS === 'ios') ? 'done' : 'default'}
                        style={{
                            width: '100%',
                            height: height ? height : 27,
                            paddingLeft: 10,
                            paddingBottom: 2,
                            paddingTop: 0,
                            fontSize: fontSize,
                            color: Colors.textPrimaryDark,
                            borderColor: borderColor,
                            borderWidth: 0,
                            borderRadius: 2,
                            ...style
                        }} />
                </View>
            )
        }

        return (
            <View style={{ width: '100%' }}>

                {CustomInput}

                <Text style={{ color: 'red' }}>{valid === false ? errorMessage : ''}</Text>
            </View>
        )
    }
}

export default TextInput;
