import { formatNaira } from "@/lib/format";
import { Order } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";

const ORDERS_KEY = "orders_v1";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(ORDERS_KEY);
      const list = raw ? (JSON.parse(raw) as Order[]) : [];
      const sorted = list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(sorted);
    })();
  }, []);
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders],
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="h2-bold">Orders</Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary">{orders.length} total</Text>
          </View>
        </View>

        <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">
          <Text className="paragraph-medium text-gray-200">Total spent</Text>
          <Text className="h3-bold text-dark-100 mt-1">
            {formatNaira(totalSpent)}
          </Text>
        </View>
        <FlatList
          data={orders}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-4 border border-gray-100 rounded-2xl mb-3 bg-white"
              onPress={() =>
                router.push({
                  pathname: "/order-confirmation",
                  params: { id: item.id },
                })
              }
            >
              <View className="flex-row justify-between items-center">
                <Text className="base-bold">Order #{item.id}</Text>
                <View className="bg-success/10 px-2 py-1 rounded-full">
                  <Text className="text-success">Delivered</Text>
                </View>
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="paragraph-medium text-gray-200">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text className="paragraph-bold text-dark-100">
                  {formatNaira(item.total)}
                </Text>
              </View>
              <Text className="paragraph-medium text-gray-200 mt-2">
                {item.items.length} items
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="items-center">
              <EmptyState
                title="No orders yet"
                description="Place your first order to see it here."
              />
              <TouchableOpacity
                className="mt-2 bg-primary py-3 px-6 rounded"
                onPress={() => router.push("/search")}
              >
                <Text className="text-white text-center">Browse products</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Orders;
