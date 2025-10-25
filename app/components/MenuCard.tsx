import { MenuItem } from "@/type";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45; 

const MenuCard = ({ item: { image_url, name, price } }: { item: MenuItem }) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 m-2 items-center"
      style={[
        { width: CARD_WIDTH },
        Platform.OS === "android"
          ? {
              elevation: 6,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
            }
          : {
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 5 },
            },
      ]}
    >
      {/* Image with slight offset */}
      <View className="-mt-5 w-full items-center">
        <Image
          source={{ uri: image_url }}
          className="w-4/5 aspect-square rounded-xl"
          resizeMode="contain"
        />
      </View>

      {/* Name */}
      <Text
        className="text-center text-lg font-bold text-dark-100 mt-3 mb-1"
        numberOfLines={1}
      >
        {name}
      </Text>

      {/* Price */}
      <Text className="text-center text-sm text-gray-400 mb-4">
        From ${price}
      </Text>

      {/* Add to Cart Button */}
      <TouchableOpacity
        className="bg-primary py-2 rounded-xl w-full"
        activeOpacity={0.8}
        onPress={() => ({})}
      >
        <Text className="text-center text-white font-bold">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
