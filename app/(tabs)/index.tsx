import { images, offers } from "@/constants";
import { formatNaira } from "@/lib/format";
import { normalizeParam } from "@/lib/utils";
import { useCategories, useProducts } from "@/lib/hooks/useProducts";
import { CategoryItem, Product } from "@/type";
import cn from "clsx";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartButton from "../components/CartButton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Filter from "../components/Filter";
import LoadingState from "../components/LoadingState";
import MenuCard from "../components/MenuCard";
import SearchBar from "../components/SearchBar";

export default function Index() {
  const { category, query } = useLocalSearchParams<{
    query: string;
    category: string;
  }>();
  const categoryParam = normalizeParam(category);
  const queryParam = normalizeParam(query);
  const [sort, setSort] = useState<"price-asc" | "price-desc" | undefined>();

  const productsQuery = useProducts({
    category: categoryParam as string | undefined,
    query: queryParam as string | undefined,
    sort,
  });
  const categoriesQuery = useCategories();

  const data = productsQuery.data || [];
  const counts = useMemo(() => {
    return data.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const categories = useMemo(() => {
    const apiCategories = categoriesQuery.data || [];
    const categoryIds = apiCategories.length
      ? apiCategories.map((c) => ({ id: c.id, name: c.name }))
      : Array.from(new Set(data.map((item) => item.category))).map((id) => ({
          id,
          name: id,
        }));

    return categoryIds
      .map(({ id, name }) => ({
        $id: id,
        name,
        count: counts[id] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .map(({ $id, name }) => ({ $id, name }));
  }, [data, counts, categoriesQuery.data]);

  const featured = useMemo(() => data.slice(0, 6), [data]);
  const preview = useMemo(() => data.slice(0, 8), [data]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={preview as Product[]}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View
              className={cn(
                "flex-1 max-w-[48%]",
                !isFirstRightColItem ? "mt-10" : "mt-0",
              )}
            >
              <MenuCard
                item={item}
                onPress={() => router.push(`/product/${item.id}`)}
              />
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 gap-6">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold text-primary uppercase">
                  Deliver to
                </Text>
                <View className="flex-row items-center gap-x-1 mt-0.5">
                  <Image
                    source={images.location}
                    className="size-4"
                    resizeMode="contain"
                  />
                  <Text className="paragraph-bold text-dark-100">
                    Your City
                  </Text>
                </View>
              </View>
              <CartButton />
            </View>

            <View className="rounded-3xl bg-primary px-5 py-6">
              <Text className="text-white text-2xl font-bold">
                Shop smarter, eat better
              </Text>
              <Text className="text-white/90 mt-2">
                Curated favorites and quick delivery, right when you need it.
              </Text>
              <View className="flex-row items-center gap-x-3 mt-4">
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white">
                    Free delivery over {formatNaira(25000)}
                  </Text>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white">30-40 min</Text>
                </View>
              </View>
            </View>

            <View>
              <Text className="h3-bold text-dark-100 mb-3">Offers</Text>
              <FlatList
                data={offers}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                contentContainerClassName="gap-4"
                renderItem={({ item }) => (
                  <Pressable
                    className="w-64 h-32 rounded-2xl overflow-hidden flex-row"
                    style={{ backgroundColor: item.color }}
                    android_ripple={{ color: "#ffffff22" }}
                  >
                    <View className="flex-1 p-4">
                      <Text className="text-white font-bold text-lg">
                        {item.title}
                      </Text>
                      <Text className="text-white/80 mt-1">Limited time</Text>
                    </View>
                    <View className="w-24 h-full items-center justify-center">
                      <Image
                        source={item.image}
                        className="w-20 h-20"
                        resizeMode="contain"
                      />
                    </View>
                  </Pressable>
                )}
              />
            </View>

            <View>
              <Text className="h3-bold text-dark-100 mb-3">Featured</Text>
              <FlatList
                data={featured}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerClassName="gap-4"
                renderItem={({ item }) => (
                  <View className="w-40">
                    <MenuCard
                      item={item}
                      onPress={() => router.push(`/product/${item.id}`)}
                    />
                  </View>
                )}
              />
            </View>

            {categoriesQuery.data?.length ? (
              <View>
                <View className="flex-between flex-row mb-3">
                  <Text className="h3-bold text-dark-100">Categories</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/search")}
                    className="px-3 py-1 rounded-full border border-gray-200"
                  >
                    <Text className="paragraph-medium text-gray-200">
                      See all
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={categoriesQuery.data as CategoryItem[]}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  contentContainerClassName="gap-3"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="bg-white border border-gray-100 rounded-2xl px-4 py-3"
                      onPress={() => router.setParams({ category: item.id })}
                    >
                      <Text className="base-bold text-dark-100">
                        {item.name}
                      </Text>
                      <Text className="paragraph-medium text-gray-200 mt-1">
                        {item.type} • from {formatNaira(item.price)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : null}

            <View>
              <View className="flex-between flex-row mb-3">
                <Text className="h3-bold text-dark-100">Popular Picks</Text>
                <TouchableOpacity
                  onPress={() => router.push("/search")}
                  className="px-3 py-1 rounded-full border border-gray-200"
                >
                  <Text className="paragraph-medium text-gray-200">
                    See more
                  </Text>
                </TouchableOpacity>
              </View>
              <SearchBar />
              <View className="mt-4">
                <Filter
                  categories={categories}
                  counts={counts}
                  totalCount={data.length}
                />
              </View>
              <View className="flex-row items-center gap-x-3 mt-4">
                <Text className="base-bold text-dark-100">Sort by price</Text>
                <TouchableOpacity
                  className={cn(
                    "px-3 py-1 rounded-full border",
                    sort === "price-asc"
                      ? "bg-primary border-primary"
                      : "border-gray-200",
                  )}
                  onPress={() =>
                    setSort(sort === "price-asc" ? undefined : "price-asc")
                  }
                >
                  <Text
                    className={cn(
                      "paragraph-medium",
                      sort === "price-asc" ? "text-white" : "text-gray-200",
                    )}
                  >
                    Low to High
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={cn(
                    "px-3 py-1 rounded-full border",
                    sort === "price-desc"
                      ? "bg-primary border-primary"
                      : "border-gray-200",
                  )}
                  onPress={() =>
                    setSort(sort === "price-desc" ? undefined : "price-desc")
                  }
                >
                  <Text
                    className={cn(
                      "paragraph-medium",
                      sort === "price-desc" ? "text-white" : "text-gray-200",
                    )}
                  >
                    High to Low
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => {
          if (productsQuery.isLoading) return <LoadingState />;
          if (productsQuery.error)
            return (
              <ErrorState
                title="Failed to load products"
                message={
                  (productsQuery.error as Error)?.message ||
                  "Please check your connection and retry."
                }
                onRetry={() => productsQuery.refetch()}
              />
            );
          return (
            <EmptyState
              title="No products found"
              description="Try a different search or category."
            />
          );
        }}
      />
    </SafeAreaView>
  );
}
