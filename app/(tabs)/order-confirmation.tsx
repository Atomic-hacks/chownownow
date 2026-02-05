import { formatNaira } from "@/lib/format";
import { Order } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

const ORDERS_KEY = "orders_v1";

const OrderConfirmation = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ORDERS_KEY);
        const list = raw ? (JSON.parse(raw) as Order[]) : [];
        const found = list.find((o) => o.id === id);
        setOrder(found || list[0] || null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading)
    return (
      <SafeAreaView className="bg-white h-full">
        <LoadingState />
      </SafeAreaView>
    );

  if (!order)
    return (
      <SafeAreaView className="bg-white h-full">
        <EmptyState
          title="No order found"
          description="Your order details could not be loaded."
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="bg-white h-full">
      <View className="p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="h2-bold">Order Confirmed</Text>
          <View className="bg-success/10 px-3 py-1 rounded-full">
            <Text className="text-success">Paid</Text>
          </View>
        </View>
        <Text className="paragraph-medium mb-4">Order #{order.id}</Text>

        <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <Text className="base-bold text-dark-100">Delivery details</Text>
          <Text className="paragraph-medium mt-2">{order.customer.name}</Text>
          <Text className="paragraph-medium text-gray-200">
            {order.customer.address}, {order.customer.city}
          </Text>
          {!!order.customer.phone && (
            <Text className="paragraph-medium text-gray-200 mt-1">
              {order.customer.phone}
            </Text>
          )}
          {!!order.customer.email && (
            <Text className="paragraph-medium text-gray-200 mt-1">
              {order.customer.email}
            </Text>
          )}
          <View className="flex-row gap-x-2 mt-3">
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary">ETA 30-40 min</Text>
            </View>
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary">Contactless</Text>
            </View>
          </View>
        </View>

        <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <Text className="base-bold mb-2">Items</Text>
          {order.items.map((item) => (
            <View
              key={`${item.id}-${item.name}`}
              className="flex-row justify-between py-1"
            >
              <Text className="paragraph-medium">
                {item.name} x{item.quantity}
              </Text>
              <Text className="paragraph-medium">
                {formatNaira(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View className="border-t border-gray-200 mt-3 pt-3 flex-row justify-between">
            <Text className="base-bold text-dark-100">Total</Text>
            <Text className="base-bold text-dark-100">
              {formatNaira(order.total)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary py-3 rounded mt-2"
          onPress={() => router.push("/")}
        >
          <Text className="text-white text-center">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderConfirmation;
