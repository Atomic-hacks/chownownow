import { formatNaira } from "@/lib/format";
import { useProduct } from "@/lib/hooks/useProducts";
import { useCartStore } from "@/store/cart.store";
import { Product } from "@/type";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";

const ProductDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useProduct(id as string);

  const item = data as Product | undefined;
  const { addItem } = useCartStore();

  if (isLoading)
    return (
      <SafeAreaView className="bg-white h-full">
        <LoadingState />
      </SafeAreaView>
    );
  if (error)
    return (
      <SafeAreaView className="bg-white h-full">
        <ErrorState
          title="Failed to load product"
          message="Please check your connection and retry."
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );

  if (!item)
    return (
      <SafeAreaView>
        <Text className="p-5">Product not found</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerClassName="p-5 pb-28">
        <Image
          source={{ uri: item.image }}
          className="w-full h-64 rounded-xl mb-4"
          resizeMode="cover"
        />
        <Text className="h2-bold text-dark-100">{item.name}</Text>
        <Text className="paragraph-medium text-gray-200 mt-2">
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center mt-4">
          <Text className="h3-bold">{formatNaira(item.price)}</Text>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded"
            onPress={() => {
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image,
                customizations: [],
              });
              Alert.alert("Added", "Item added to cart");
            }}
          >
            <Text className="text-white">Add to cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetail;
