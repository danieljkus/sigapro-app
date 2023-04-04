// CREATED BY MAYK FELIX 17/03/2023
import React, { useEffect, useState } from 'react'
import { View, Pressable, Text, Modal, DatePickerIOS } from 'react-native'
import DatePicker from 'react-native-date-picker';
import Colors from '../values/Colors';
import Button from "./Button";
import moment from 'moment';
import { formatDateBasic } from "../utils/Maskers";
import CalendarPicker from 'react-native-calendar-picker';
import Icon from "./Icon";

const DatePickerComponent = (props) => {
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [selectedDayRange, setSelectedDayRange] = useState({
        from: null,
        to: null
    });
    return (
        <View style={{}}>

            <Pressable onPress={() => setOpen(true)} style={{ justifyContent: 'center' }} style={props?.style}>
                <Text style={{
                    fontSize: 18,
                }}>
                    {props?.mode === 'date' && ((props && props?.dateText) || moment(date).format("DD/MM/YYYY"))}
                    {props?.mode === 'datetime' && moment(date).format("DD/MM/YYYY")}
                    {props?.mode === 'time' && moment(date).format("HH:mm")}
                </Text>
            </Pressable>


            <Modal
                visible={open}
                onDismiss={() => setOpen(false)}
                onRequestClose={() => setOpen(false)}
                animationType={"slide"}
                transparent={true}
            >
                <Pressable
                    onPress={() => Platform.OS === 'android' && (props && props?.mode === 'date') ? null : setOpen(false)}
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: 'rgba(0,0,0,0.5)',

                    }}>
                    <View style={{
                        paddingVertical: 15,
                        paddingHorizontal: 15,
                        backgroundColor: Colors.background,
                        borderRadius: 5,
                        width: "97%"
                    }}>


                        {Platform.OS === 'ios' ?
                            <DatePicker
                                androidVariant={Platform.OS === 'ios' ? 'iosClone' : 'nativeAndroid'}
                                type={'default'}
                                date={date}
                                maximumDate={props?.maxDate}
                                minimumDate={props?.minDate}
                                mode={props?.mode}
                                showIcon={true}
                                is24Hour={true}
                                onDateChange={(newDate) => {
                                    setDate(newDate);
                                    if (props?.mode === 'date') {
                                        props?.onChange(formatDateBasic(newDate));
                                    }
                                    if (props?.mode === 'time') {
                                        props?.onChange(new Date(newDate));
                                    }
                                    if (props?.mode === 'datetime') {
                                        props?.onChange(new Date(newDate));
                                    }
                                }}
                            /> :
                            Platform.OS === 'android' && (props && props?.mode === 'date') ?
                                <View style={{}}>
                                    <CalendarPicker
                                        textStyle={{
                                            fontFamily: 'Cochin',
                                            color: '#000000',
                                        }}
                                        todayTextStyle={{
                                            fontFamily: 'Cochin',
                                            color: '#000000',
                                        }}
                                        selectedDayColor={Colors.primary}
                                        selectedDayTextColor={'white'}
                                        maxDate={props?.maxDate}
                                        miniDate={props?.minDate}
                                        selectMonthTitle={'Selecionar mês em '}
                                        selectYearTitle={'Selecionar ano'}
                                        nextTitle={<Icon family="MaterialIcons" name="arrow-forward"
                                            color={Colors.black}
                                            style={{ padding: 16 }} />} // Próximo
                                        previousTitle={<Icon family="MaterialIcons" name="arrow-back"
                                            color={Colors.black}
                                            style={{ padding: 16 }} />} // Anterior
                                        months={[
                                            'Janeiro',
                                            'Fevereiro',
                                            'Março',
                                            'Abril',
                                            'Maio',
                                            'Junho',
                                            'Julho',
                                            'Agosto',
                                            'Setembro',
                                            'Outubro',
                                            'Novembro',
                                            'Dezembro'
                                        ]}
                                        weekdays={["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]}
                                        onDateChange={(newDate) => {
                                            setDate(newDate);
                                            if (props?.mode === 'date') {
                                                props?.onChange(formatDateBasic(newDate));
                                            }
                                            if (props?.mode === 'time') {
                                                props?.onChange(new Date(newDate));
                                            }
                                            if (props?.mode === 'datetime') {
                                                props?.onChange(new Date(newDate));
                                            }
                                        }}
                                    />
                                </View>
                                :
                                <DatePicker
                                    androidVariant={Platform.OS === 'ios' ? 'iosClone' : 'nativeAndroid'}
                                    type={'default'}
                                    date={date}
                                    maximumDate={props?.maxDate}
                                    minimumDate={props?.minDate}
                                    mode={props?.mode}
                                    showIcon={true}
                                    is24Hour={true}
                                    onDateChange={(newDate) => {
                                        setDate(newDate);
                                        if (props?.mode === 'date') {
                                            props?.onChange(formatDateBasic(newDate));
                                        }
                                        if (props?.mode === 'time') {
                                            props?.onChange(new Date(newDate));
                                        }
                                        if (props?.mode === 'datetime') {
                                            props?.onChange(new Date(newDate));
                                        }
                                    }}
                                />
                        }


                        <View style={{ marginTop: 4, paddingVertical: 10, backgroundColor: Colors.transparent }}>
                            <Button
                                title="FECHAR"
                                onPress={() => setOpen(false)}
                                buttonStyle={{ marginTop: 10 }}
                                icon={{
                                    name: 'close',
                                    type: 'font-awesome',
                                    color: Colors.white
                                }}
                            />
                        </View>
                    </View>
                </Pressable>
            </Modal>

        </View>
    )
};

export default DatePickerComponent
