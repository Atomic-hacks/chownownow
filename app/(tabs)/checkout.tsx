import { formatNaira } from "@/lib/format";
import { useCartStore } from "@/store/cart.store";
import { Order } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";

const ORDERS_KEY = "orders_v1";

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCartEmpty = items.length === 0;

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!phone.trim() && !email.trim())
      return "Please provide a phone number or email";
    if (email && !/^\S+@\S+\.\S+$/.test(email))
      return "Please enter a valid email";
    if (!address.trim()) return "Address is required";
    if (!city.trim()) return "City is required";
    return null;
  };

  const handlePlaceOrder = async () => {
    const err = validate();
    if (err) return Alert.alert("Validation", err);

    try {
      setIsSubmitting(true);
      const order: Order = {
        id: `${Date.now()}`,
        items,
        total,
        createdAt: new Date().toISOString(),
        customer: {
          name,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address,
          city,
        },
      };

      const raw = await AsyncStorage.getItem(ORDERS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        ORDERS_KEY,
        JSON.stringify([order, ...existing]),
      );

      clearCart();
      router.push({
        pathname: "/order-confirmation",
        params: { id: order.id },
      });
    } catch (e) {
      Alert.alert("Error", "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartEmpty) {
    return (
      <SafeAreaView className="bg-white h-full">
        <EmptyState
          title="Your cart is empty"
          description="Add items before checkout."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <View className="p-5">
        <Text className="h2-bold mb-4">Checkout</Text>

        <Text className="base-bold">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="input"
          placeholder="Full name"
        />

        <Text className="base-bold mt-3">Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          className="input"
          placeholder="Phone number"
          keyboardType="phone-pad"
        />

        <Text className="base-bold mt-3">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          className="input"
          placeholder="Email address"
          keyboardType="email-address"
        />

        <Text className="base-bold mt-3">Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          className="input"
          placeholder="Street address"
        />

        <Text className="base-bold mt-3">City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          className="input"
          placeholder="City"
        />

        <View className="mt-5">
          <Text className="paragraph-bold">Total: {formatNaira(total)}</Text>
        </View>

        <TouchableOpacity
          className="bg-primary py-3 rounded mt-6"
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center">
            {isSubmitting ? "Processing..." : "Pay (mock)"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;
