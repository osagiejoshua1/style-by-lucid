"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RiEyeLine, RiShoppingCartLine, RiLoader5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";
import useCartStore from "../components/store/useCartStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [availableStock, setAvailableStock] = useState(product.quantity);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [userId, setUserId] = useState(null);

  const pathname = usePathname();
  const { addToCart, cartItems } = useCartStore();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user._id);
    }
  }, []);

  const fetchStock = async () => {
    if (!userId) return product.quantity;

    setIsLoadingStock(true);
    try {
      const res = await fetch(
        `${API_URL}/api/products/stock/${product._id}?userId=${userId}&includeMine=true`
      );
      const data = await res.json();

      // ✅ Update the product.quantity in local card if needed
      product.quantity = data.totalStock; // <-- this line ensures sync

      return data.availableStock;
    } catch (err) {
      console.error("Stock fetch failed:", err);
      return product.quantity;
    } finally {
      setIsLoadingStock(false);
    }
  };
  useEffect(() => {
    let isMounted = true;

    const updateStock = async () => {
      const stock = await fetchStock();
      if (isMounted) setAvailableStock(stock);
    };

    updateStock();
    return () => {
      isMounted = false;
    };
  }, [product._id, pathname, userId]);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please log in to add items to cart.");
      return;
    }
  
    if (isAdding || availableStock <= 0) return;
  
    setIsAdding(true);
  
    try {
      const defaultColor =
        product.colors?.[0] || "black"; // ✅ Use first color if available, else default to black
  
      const cartItem = {
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.images[0],
        size: product.size || "Default",
        colors: [defaultColor], // ✅ Always send a selected color
        alreadyReserved: true,
      };
  
      await addToCart(cartItem);
  
      const updatedStock = await fetchStock();
      setAvailableStock(updatedStock);
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      layout
    >
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden rounded-t-xl">
        <Link href={`/product/${product._id}`} passHref>
          <motion.img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        <Link href={`/product/${product._id}`} passHref>
          <motion.button
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <RiEyeLine className="text-xl" />
          </motion.button>
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product._id}`} passHref>
          <h3 className="font-semibold text-lg mb-1 truncate cursor-pointer hover:text-gray-800">
            {product.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-2">{product.category}</p>
        <p className="text-xl font-bold">{formatPrice(product.price)}</p>

        {/* Stock Status */}
        {userId && (
          <motion.p
            className={`text-sm mb-2 ${
              availableStock <= 0
                ? "text-red-500 font-semibold italic"
                : "text-gray-500"
            }`}
            key={`stock-${availableStock}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isLoadingStock ? (
              <span className="inline-flex items-center gap-1">
                <RiLoader5Line className="animate-spin text-sm" />
                Checking stock...
              </span>
            ) : availableStock <= 0 ? (
              "Out of Stock"
            ) : (
              `Available: ${availableStock} item${
                availableStock > 1 ? "s" : ""
              }`
            )}
          </motion.p>
        )}

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isAdding || availableStock <= 0 || isLoadingStock}
          className={`mt-3 w-full py-2 rounded-lg transition-colors text-sm font-medium 
            flex items-center justify-center gap-2 ${
              isAdding || availableStock <= 0 || isLoadingStock
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          whileTap={!isAdding && availableStock > 0 ? { scale: 0.98 } : {}}
        >
          {availableStock <= 0 ? (
            "Out of Stock"
          ) : isAdding ? (
            <>
              <RiLoader5Line className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <RiShoppingCartLine />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
