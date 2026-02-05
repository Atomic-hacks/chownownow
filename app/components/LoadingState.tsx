import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

type LoadingStateProps = {
  title?: string;
  description?: string;
};

const LoadingState = ({
  title = "Loading",
  description = "Please wait...",
}: LoadingStateProps) => {
  return (
    <View className="flex-1 items-center justify-center py-10">
      <ActivityIndicator size="large" color="#FE8C00" />
      <Text className="base-bold text-dark-100 mt-4">{title}</Text>
      <Text className="paragraph-medium text-gray-200 mt-1">
        {description}
      </Text>
    </View>
  );
};

export default LoadingState;
