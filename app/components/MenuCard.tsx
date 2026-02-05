import { useCartStore } from "@/store/cart.store";
import { MenuItem, Product } from "@/type";
import { formatNaira } from "@/lib/format";
import { Image } from "expo-image";
import React from "react";
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45;

type MenuCardItem = MenuItem | Product;

const getMenuCardFields = (item: MenuCardItem) => {
  if ("image" in item) {
    return {
      id: item.id,
      imageUrl: item.image,
      name: item.name,
      price: item.price,
    };
  }
  return {
    id: item.$id,
    imageUrl: item.image_url,
    name: item.name,
    price: item.price,
  };
};

const MenuCard = ({
  item,
  onPress,
}: {
  item: MenuCardItem;
  onPress?: () => void;
}) => {
  const { id, imageUrl, name, price } = getMenuCardFields(item);
  const { addItem } = useCartStore();
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 m-2 items-center"
      activeOpacity={0.9}
      onPress={onPress}
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
          source={{ uri: imageUrl }}
          className="w-4/5 aspect-square rounded-xl"
          contentFit="contain"
          cachePolicy="memory-disk"
          style={{ width: "80%", aspectRatio: 1, borderRadius: 12 }}
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
        From {formatNaira(price)}
      </Text>

      {/* Add to Cart Button */}
      <TouchableOpacity
        className="bg-primary py-2 rounded-xl w-full"
        activeOpacity={0.8}
        onPress={() =>
          addItem({
            id,
            name,
            price,
            image_url: imageUrl,
            customizations: [],
          })
        }
      >
        <Text className="text-center text-white font-bold">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
