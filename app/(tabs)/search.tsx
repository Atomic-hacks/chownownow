import { useCategories, useProducts } from "@/lib/hooks/useProducts";
import { normalizeParam } from "@/lib/utils";
import { Product } from "@/type";
import cn from "clsx";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartButton from "../components/CartButton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Filter from "../components/Filter";
import LoadingState from "../components/LoadingState";
import MenuCard from "../components/MenuCard";
import SearchBar from "../components/SearchBar";

const Search = () => {
  const { category, query } = useLocalSearchParams<{
    query: string;
    category: string;
  }>();
  const categoryParam = normalizeParam(category);
  const queryParam = normalizeParam(query);

  const productsQuery = useProducts({
    category: categoryParam as string | undefined,
    query: queryParam as string | undefined,
  });
  const categoriesQuery = useCategories();

  const data = productsQuery.data || [];
  const counts = data.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const categories = (categoriesQuery.data?.length
    ? categoriesQuery.data.map((c) => ({ id: c.id, name: c.name }))
    : Array.from(new Set(data.map((item) => item.category))).map((id) => ({
        id,
        name: id,
      }))
  )
    .map(({ id, name }) => ({
      $id: id,
      name,
      count: counts[id] || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .map(({ $id, name }) => ({ $id, name }));
  const loading = productsQuery.isLoading;
  const error = productsQuery.error;
  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={data as Product[]}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View
              className={cn(
                "flex-1 max-w-[48%]",
                !isFirstRightColItem ? "mt-10" : "mt-0",
              )}
            >
              <Text>
                <MenuCard
                  item={item}
                  onPress={() => router.push(`/product/${item.id}`)}
                />
              </Text>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">
                  Search
                </Text>
                <View className="flex-start flex-row gap-x-1 mt-0.5">
                  <Text>Find your favorite food</Text>
                </View>
              </View>
              <CartButton />
            </View>
            <SearchBar />
            <View>
              <Text className="base-bold text-dark-100 mb-2">Categories</Text>
              <Filter
                categories={categories}
                counts={counts}
                totalCount={data.length}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => {
          if (loading) return <LoadingState />;
          if (error)
            return (
              <ErrorState
                title="Failed to load items"
                message={
                  (error as Error)?.message ||
                  "Please check your connection and retry."
                }
                onRetry={() => productsQuery.refetch()}
              />
            );
          return (
            <EmptyState title="No results" description="Try another search." />
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Search;
