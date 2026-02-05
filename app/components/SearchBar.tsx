import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import { useDebouncedCallback } from "use-debounce";

export default function SearchBar() {
  const params = useLocalSearchParams<{ query: string }>();
  const initialQuery = typeof params.query === "string" ? params.query : "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery !== query) setQuery(initialQuery);
  }, [initialQuery]);

  const debouncedSearch = useDebouncedCallback((text: string) => {
    router.setParams({ query: text || undefined });
  }, 500);

  const handleSearch = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  return (
    <View className="searchbar">
      <TextInput
        className="flex-1 p-5"
        placeholder="Search for pizzas and colos"
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#A0A0A0"
        returnKeyType="search"
      />
      <TouchableOpacity
        className="pr-5 "
        onPress={() => router.setParams({ query: query || undefined })}
      >
        <Image
          source={images.search}
          className="size-6"
          resizeMode="contain"
          tintColor="5D5F6D"
        />
      </TouchableOpacity>
    </View>
  );
}
