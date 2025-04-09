import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      productStocks: {},
      isLoading: false,
      error: null,

      loadCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const storedUser = sessionStorage.getItem("user");
          if (!storedUser) return;

          const userId = JSON.parse(storedUser)._id;

          const [cartRes, stockRes] = await Promise.all([
            fetch(`${API_URL}/api/cart?userId=${userId}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }),
            fetch(`${API_URL}/api/products/stock/batch?userId=${userId}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }),
          ]);

          if (!cartRes.ok) throw new Error("Failed to load cart");
          if (!stockRes.ok) throw new Error("Failed to fetch stock");

          const cartData = await cartRes.json();
          const stockData = await stockRes.json();

          set({
            cartItems: cartData.cart?.items || [],
            productStocks: stockData.stocks || {},
          });
        } catch (error) {
          console.error("❌ Failed to load cart:", error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshAllStocks: async () => {
        try {
          const storedUser = sessionStorage.getItem("user");
          if (!storedUser) return;

          const userId = JSON.parse(storedUser)._id;
          const response = await fetch(
            `${API_URL}/api/products/stock/batch?userId=${userId}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );

          if (!response.ok) throw new Error("Failed to refresh stocks");

          const data = await response.json();
          set((state) => ({
            productStocks: {
              ...state.productStocks,
              ...data.stocks,
            },
          }));
        } catch (error) {
          console.error("❌ Stock refresh error:", error);
        }
      },

      updateProductStock: (productId, availableStock) => {
        set((state) => ({
          productStocks: {
            ...state.productStocks,
            [productId]: availableStock,
          },
        }));
      },

      fetchAccessoryStock: async (accessoryId) => {
        try {
          const storedUser = sessionStorage.getItem("user");
          if (!storedUser) return null;

          const userId = JSON.parse(storedUser)._id;
          const response = await fetch(
            `${API_URL}/api/accessories/stock/${accessoryId}?userId=${userId}&includeMine=true`
          );

          if (!response.ok) throw new Error("Failed to fetch accessory stock");

          const data = await response.json();
          get().updateProductStock(accessoryId, data.availableStock);
          return data.availableStock;
        } catch (error) {
          console.error("❌ Accessory stock fetch error:", error);
          toast.error("Failed to check accessory stock");
          return null;
        }
      },

      fetchProductStock: async (productId) => {
        try {
          const storedUser = sessionStorage.getItem("user");
          if (!storedUser) return null;

          const userId = JSON.parse(storedUser)._id;
          const response = await fetch(
            `${API_URL}/api/products/stock/${productId}?userId=${userId}&includeMine=true`
          );

          if (!response.ok) throw new Error("Failed to fetch stock");

          const data = await response.json();
          get().updateProductStock(productId, data.availableStock);
          return data.availableStock;
        } catch (error) {
          console.error("❌ Stock fetch error:", error);
          toast.error("Failed to check product availability");
          return null;
        }
      },

      fetchAllCartStocks: async () => {
        const state = get();
        const cartItems = state.cartItems;

        await Promise.all(
          cartItems.map(async (item) => {
            const current = state.productStocks[item.productId];
            if (typeof current !== "number") {
              await get().fetchProductStock(item.productId);
            }
          })
        );
      },

      getAvailableStock: (productId) => {
        const state = get();
        const baseStock = state.productStocks[productId];
        return typeof baseStock === "number" ? baseStock : undefined;
      },

      addToCart: async (product) => {
        console.log("🛒 addToCart called with:", product);

        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
          toast.error("Please log in to add items to cart");
          return;
        }

        const userId = JSON.parse(storedUser)._id;

        try {
          if (!product.alreadyReserved) {
            const reserveRes = await fetch(`${API_URL}/api/cart/reserve-stock`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                userId,
                productId: product.productId,
                quantity: product.quantity,
              }),
            });

            const reserveData = await reserveRes.json();
            if (!reserveRes.ok || !reserveData.success) {
              throw new Error(reserveData.error || "Failed to reserve stock");
            }
          }

          set((state) => {
            const currentStock = state.productStocks[product.productId] || 0;
            return {
              cartItems: [...state.cartItems, product],
              productStocks: {
                ...state.productStocks,
                [product.productId]: Math.max(0, currentStock - product.quantity),
              },
            };
          });

          const response = await fetch(`${API_URL}/api/cart/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(product),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Cart save failed");
          }

          const result = await response.json();

          set({
            cartItems: result.cart.items,
            productStocks: {
              ...get().productStocks,
              [product.productId]: result.availableStock,
            },
          });

          toast.success(`${product.title} added to cart`);
          return result;
        } catch (error) {
          console.error("❌ Add to cart error:", error);
          toast.error(error.message || "Failed to add to cart");

          set((state) => {
            const currentStock = state.productStocks[product.productId] || 0;
            return {
              cartItems: state.cartItems.filter(
                (item) =>
                  item.productId !== product.productId ||
                  item.size !== product.size ||
                  item.color !== product.color
              ),
              productStocks: {
                ...state.productStocks,
                [product.productId]: currentStock + product.quantity,
              },
            };
          });

          throw error;
        }
      },

      removeFromCart: async (cartItemId) => {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
          toast.error("Please log in to modify your cart");
          return;
        }

        try {
          const response = await fetch(`${API_URL}/api/cart/remove/${cartItemId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to remove item");
          }

          const result = await response.json();

          set((state) => ({
            cartItems: state.cartItems.filter((item) => item._id !== cartItemId),
            productStocks: {
              ...state.productStocks,
              ...result.updatedStocks,
            },
          }));

          toast.success("Item removed from cart");
          return result;
        } catch (error) {
          console.error("❌ Remove from cart error:", error);
          toast.error(error.message || "Failed to remove item");
          throw error;
        }
      },

      clearCart: async () => {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) {
          toast.error("Please log in to modify your cart");
          return;
        }

        try {
          const response = await fetch(`${API_URL}/api/cart/clear`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (!response.ok) throw new Error("Failed to clear cart");

          const result = await response.json();

          set({
            cartItems: [],
            productStocks: result.updatedStocks || {},
          });

          toast.success("Cart cleared successfully");
          return result;
        } catch (error) {
          console.error("❌ Clear cart error:", error);
          toast.error(error.message || "Failed to clear cart");
          throw error;
        }
      },

      getTotal: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().cartItems.reduce(
          (count, item) => count + item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cartItems: state.cartItems,
        productStocks: state.productStocks,
      }),
    }
  )
);

export default useCartStore;

// ✅ HYDRATION HOOK (put AFTER the export line)
useCartStore.persist = {
  onFinishHydration(callback) {
    const unsub = useCartStore.subscribe(
      (state) => state.cartItems,
      () => {
        callback();
        unsub();
      },
      {
        fireImmediately: true,
      }
    );
    return unsub;
  },
};
