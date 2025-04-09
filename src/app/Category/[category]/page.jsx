"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { RiEyeLine, RiShoppingCartLine, RiLoader5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/utils/formatPrice";
import useCartStore from "@/components/store/useCartStore";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CategoryPage() {
  const pathname = usePathname();
  const category = decodeURIComponent(pathname.split("/").pop());

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products/products-by-category/${category}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("❌ Failed to load products:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen pt-[80px] flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 min-h-screen pt-[80px] flex flex-col items-center justify-center">
        <h2 className="text-2xl text-red-600 mb-4">Error loading products</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full bg-gray-50 min-h-screen pt-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center capitalize">
            {category} Collections
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ Inline ProductCard with user-based stock visibility
function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [availableStock, setAvailableStock] = useState(product.quantity);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [userId, setUserId] = useState(null);

  const { addToCart } = useCartStore();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user._id);
    }
  }, []);

  const fetchStock = async () => {
    if (!userId) return;
    setIsLoadingStock(true);

    try {
      const res = await fetch(
        `${API_URL}/api/products/stock/${product._id}?userId=${userId}&includeMine=true`
      );
      const data = await res.json();
      setAvailableStock(data.availableStock);
    } catch (err) {
      console.error("❌ Stock fetch error:", err);
    } finally {
      setIsLoadingStock(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [product._id, userId]);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    if (isAdding || availableStock <= 0) return;

    setIsAdding(true);

    try {
      await addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.images?.[0] || "/placeholder.jpg",
        size: product.size || "Default",
        colors: product.colors || ["Default"],
        alreadyReserved: true,
      });

      toast.success(`${product.title} added to cart`);
      await fetchStock(); // Refresh stock
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

      <div className="p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-1 truncate hover:text-gray-800">
          {product.title}
        </h3>
        <p className="text-gray-500 text-sm mb-2">{product.category}</p>
        <p className="text-lg font-bold mb-3">₦{formatPrice(product.price)}</p>

        {/* ✅ Only show stock info if user is logged in */}
        {userId && (
          <p
            className={`text-sm mb-2 ${
              availableStock <= 0 ? "text-red-500 font-semibold" : "text-gray-500"
            }`}
          >
            {isLoadingStock ? (
              <span className="inline-flex items-center gap-1">
                <RiLoader5Line className="animate-spin text-sm" />
                Checking stock...
              </span>
            ) : availableStock <= 0 ? (
              "Out of Stock"
            ) : (
              `Available: ${availableStock}`
            )}
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={isAdding || isLoadingStock || availableStock <= 0}
          className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
            isAdding || availableStock <= 0 || isLoadingStock
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isAdding ? (
            <>
              <RiLoader5Line className="animate-spin" />
              Adding...
            </>
          ) : isLoadingStock ? (
            <>
              <RiLoader5Line className="animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RiShoppingCartLine />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
