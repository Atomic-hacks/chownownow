import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const ErrorState = ({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <View className="px-5 py-10 items-center justify-center">
      <Text className="base-bold text-danger">{title}</Text>
      <Text className="paragraph-medium text-gray-200 mt-2 text-center">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          className="mt-4 bg-primary py-2 px-6 rounded"
          onPress={onRetry}
        >
          <Text className="text-white text-center">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;
