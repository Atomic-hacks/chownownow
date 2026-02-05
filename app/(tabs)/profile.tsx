import { images } from "@/constants";
import { formatNaira } from "@/lib/format";
import useAuthStore from "@/store/auth.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const profile = () => {
  const { user, setIsAuthenticated, setUser } = useAuthStore();
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const displayName = user?.name || "Guest Shopper";
  const displayEmail = user?.email || "guest@example.com";
  const displayAvatar =
    typeof user?.avatar === "string" ? { uri: user.avatar } : images.avatar;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("orders_v1");
        const list = raw ? JSON.parse(raw) : [];
        setOrderCount(list.length);
        const sum = list.reduce(
          (acc: number, o: any) => acc + (o.total || 0),
          0,
        );
        setTotalSpent(sum);
      } catch {
        setOrderCount(0);
        setTotalSpent(0);
      }
    })();
  }, []);

  return (
    <View className="bg-white h-full">
      <View className="p-5">
        <Text className="h2-bold mb-6">Profile</Text>

        <View className="items-center mb-6">
          <Image
            source={displayAvatar}
            className="w-24 h-24 rounded-full"
            resizeMode="cover"
          />
          <Text className="h3-bold text-dark-100 mt-3">{displayName}</Text>
          <Text className="paragraph-medium text-gray-200 mt-1">
            {displayEmail}
          </Text>
        </View>

        <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <Text className="base-bold text-dark-100">Your stats</Text>
          <View className="flex-row justify-between mt-3">
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="paragraph-medium text-gray-200">Orders</Text>
              <Text className="h3-bold text-dark-100">{orderCount}</Text>
            </View>
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="paragraph-medium text-gray-200">
                Total spent
              </Text>
              <Text className="h3-bold text-dark-100">
                {formatNaira(totalSpent)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-gray-100 rounded-2xl p-4">
          <Text className="base-bold text-dark-100">Account</Text>
          <View className="mt-3">
            <Text className="paragraph-medium text-gray-200">Shipping</Text>
            <Text className="base-bold text-dark-100">Set during checkout</Text>
          </View>
          <View className="mt-3">
            <Text className="paragraph-medium text-gray-200">Payment</Text>
            <Text className="base-bold text-dark-100">Mock payment</Text>
          </View>
        </View>

        <TouchableOpacity
          className="mt-6 bg-primary py-3 rounded"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center">Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default profile;
