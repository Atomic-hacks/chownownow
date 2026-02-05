import restApi from "@/lib/restApi";
import { Product } from "@/type";
import { useQuery } from "@tanstack/react-query";

export type ProductSort = "price-asc" | "price-desc";

type UseProductsParams = {
  query?: string;
  category?: string;
  sort?: ProductSort;
};

const filterAndSort = (
  products: Product[],
  { query, category, sort }: UseProductsParams,
) => {
  let filtered = products;

  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  if (sort === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  }
  if (sort === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return filtered;
};

export const useProducts = (params: UseProductsParams = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const products = await restApi.getProducts();
      return filterAndSort(products, params);
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => restApi.getProductById(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const raw = await restApi.getCategoriesRest();
      return (raw || []).map((c: any) => ({
        id: c.id || c.$id,
        name: c.name ?? "Uncategorized",
        price: typeof c.price === "number" ? c.price : 0,
        type: c.type ?? "General",
      }));
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};
