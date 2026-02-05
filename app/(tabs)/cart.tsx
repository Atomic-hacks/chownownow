import { formatNaira } from "@/lib/format";
import { useCartStore } from "@/store/cart.store";
import { PaymentInfoStripeProps } from "@/type";
import cn from "clsx";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartItem from "../components/CartItem";
import CustomButton from "../components/CustomButton";
import CustomHeader from "../components/CustomHeader";
import EmptyState from "../components/EmptyState";

const PaymentInfoStripe = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const Cart = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = totalItems > 0 ? 1500 : 0;
  const total = totalPrice + deliveryFee;

  return (
    <SafeAreaView>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
        ListEmptyComponent={() => (
          <View className="items-center">
            <EmptyState
              title="Your cart is empty"
              description="Add some products to get started."
            />
            <TouchableOpacity
              className="mt-2 bg-primary py-3 px-6 rounded"
              onPress={() => router.push("/search")}
            >
              <Text className="text-white text-center">Browse products</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() =>
          totalItems > 0 && (
            <View className="mt-6 border border-gray-200 p-5 rounded-2xl ">
              <Text className="h3-bold text-dark-100 mb-5">
                Payment Summary
              </Text>
              <PaymentInfoStripe
                label={`Items (${totalItems})`}
                value={formatNaira(totalPrice)}
              />
              <PaymentInfoStripe
                label={`Delivery Fee`}
                value={formatNaira(deliveryFee)}
              />
              <View className="border-t border-gray-300 mt-2" />
              <PaymentInfoStripe
                label={`Total`}
                value={formatNaira(total)}
                labelStyle="base-bold !text-dark-100"
                valueStyle="base-bold !text-dark-100 !text-right"
              />
              <CustomButton
                title="Proceed to Checkout"
                onPress={() => router.push("/checkout")}
              />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

export default Cart;
