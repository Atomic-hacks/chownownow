import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartCustomization, CartItemType, CartStore } from "@/type";

const STORAGE_KEY = "cart_items_v1";

function areCustomizationsEqual(
  a: CartCustomization[] = [],
  b: CartCustomization[] = []
): boolean {
  if (a.length !== b.length) return false;

  const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
  const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

  return aSorted.every((item, idx) => item.id === bSorted[idx].id);
}

const CartContext = createContext<CartStore | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItemType[]>([]);
  const hasHydrated = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load cart from storage", e);
      } finally {
        hasHydrated.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      (async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
          console.warn("Failed to save cart to storage", e);
        }
      })();
    }, 250);
  }, [items]);

  const addItem = (item: Omit<CartItemType, "quantity">) => {
    const customizations = item.customizations ?? [];

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && areCustomizationsEqual(i.customizations ?? [], customizations)
      );

      if (existing) {
        return prev.map((i) =>
          i.id === item.id && areCustomizationsEqual(i.customizations ?? [], customizations)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1, customizations }];
    });
  };

  const removeItem = (id: string, customizations: CartCustomization[] = []) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && areCustomizationsEqual(i.customizations ?? [], customizations)))
    );
  };

  const increaseQty = (id: string, customizations: CartCustomization[] = []) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && areCustomizationsEqual(i.customizations ?? [], customizations)
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decreaseQty = (id: string, customizations: CartCustomization[] = []) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id && areCustomizationsEqual(i.customizations ?? [], customizations)
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    items.reduce((total, item) => {
      const base = item.price;
      const customPrice = item.customizations?.reduce((s: number, c: CartCustomization) => s + c.price, 0) ?? 0;
      return total + item.quantity * (base + customPrice);
    }, 0);

    const value: CartStore = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      increaseQty,
      decreaseQty,
      clearCart,
      getTotalItems,
      getTotalPrice,
    }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartStore = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartStore must be used within a CartProvider");
  return ctx;
};
