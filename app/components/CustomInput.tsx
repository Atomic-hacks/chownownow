import { CustomInputProps } from "@/type";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import cn from 'clsx'

const CustomInput = ({
  placeholder = "Enter Text",
  value,
  onChangeText,
  label,
  secureTextEntry = false,
  keyboardType = "default",
}: CustomInputProps) => {
  const [isFocused, setFocused] = useState(false);

  return (
    <View className="w-full">
      <Text className="label">{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor='#888'
        className={cn('input', isFocused ? 'border-primary' : 'border-gray-300')}
      />
    </View>
  );
};

export default CustomInput;
