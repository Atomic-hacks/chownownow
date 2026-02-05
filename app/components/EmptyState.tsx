import React from "react";
import { Image, Text, View } from "react-native";
import { images } from "@/constants";

type EmptyStateProps = {
  title?: string;
  description?: string;
};

const EmptyState = ({
  title = "Nothing here yet",
  description = "Try adjusting your filters or search.",
}: EmptyStateProps) => {
  return (
    <View className="px-5 py-10 items-center justify-center">
      <Image
        source={images.emptyState}
        className="w-32 h-32"
        resizeMode="contain"
      />
      <Text className="base-bold text-dark-100 mt-4">{title}</Text>
      <Text className="paragraph-medium text-gray-200 mt-2 text-center">
        {description}
      </Text>
    </View>
  );
};

export default EmptyState;
