const ReactNative = require('react-native');

const { Picker } = require('@react-native-picker/picker');

Object.defineProperty(ReactNative, 'Picker', {
  value: Picker,
  writable: false,
});

const { OS } = ReactNative.Platform;
if (OS === 'android') {
  const {
    RNDatePickerAndroid: DatePickerAndroid, 
    RNTimePickerAndroid: TimePickerAndroid,
} = ReactNative.NativeModules;
  Object.defineProperty(ReactNative, 'DatePickerAndroid', {
      value: DatePickerAndroid,
      writable: false,
  });
  Object.defineProperty(ReactNative, 'TimePickerAndroid', {
    value: TimePickerAndroid,
    writable: false,
  });
}
