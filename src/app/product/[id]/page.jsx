"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useCartStore from "../../components/store/useCartStore";
import Navbar from "@/components/Navbar"
import { Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Product = () => {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [userMeasurement, setUserMeasurement] = useState("");
  const [selectedColors, setSelectedColors] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [availableStock, setAvailableStock] = useState(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [available, setAvailable] = useState(0);
  const { cartItems } = useCartStore();

  const cartItem = cartItems.find((item) => item.productId === id);
  const cartQuantity = cartItem?.quantity || 0;

  const fetchAvailableStock = async () => {
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    setIsLoadingStock(true);

    try {
      let url = `${API_URL}/api/products/stock/${id}`;
      if (user?._id) {
        url += `?userId=${user._id}&includeMine=true`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setAvailableStock(data.availableStock);

      const cartItem = cartItems.find((item) => item.productId === id);
      const cartQuantity = cartItem?.quantity || 0;
      setAvailable(data.availableStock - cartQuantity);
    } catch (err) {
      console.error("❌ Failed to fetch stock:", err);
    } finally {
      setIsLoadingStock(false);
    }
  };

  useEffect(() => {
    if (id) {
      const load = async () => {
        try {
          const res = await fetch(`${API_URL}/api/products/${id}`);
          const data = await res.json();
          setProduct(data);
          setSelectedImage(data.images[0]);
          await fetchAvailableStock();
        } catch (err) {
          console.error("❌ Failed to load product:", err);
          toast.error("Failed to load product details");
        }
      };
      load();
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAvailableStock();
  }, [cartItems, id]);

  useEffect(() => {
    if (availableStock !== null) {
      const cartItem = cartItems.find((item) => item.productId === id);
      const cartQuantity = cartItem?.quantity || 0;
      setAvailable(availableStock - cartQuantity);
    }
  }, [cartItems, availableStock, id]);

  const handleColorSelect = (color) => {
    const currentColors = selectedColors[product._id] || [];
    let updatedColors;

    if (currentColors.includes(color)) {
      updatedColors = currentColors.filter((c) => c !== color);
    } else {
      if (currentColors.length < quantity) {
        updatedColors = [...currentColors, color];
      } else {
        toast.error(`You can only select ${quantity} colors`);
        return;
      }
    }

    setSelectedColors({
      ...selectedColors,
      [product._id]: updatedColors,
    });
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);

      const currentColors = selectedColors[product._id] || [];
      setSelectedColors({
        ...selectedColors,
        [product._id]: currentColors.slice(0, newQuantity),
      });
    }
  };

  const increaseQuantity = () => {
    if (quantity < available) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`You can only select ${available} item${available !== 1 ? "s" : ""}`);
    }
  };

  const handleAddToCart = async () => {
    if (!product || isAddingToCart || available <= 0) return;

    setIsAddingToCart(true);

    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      toast.error("❌ Please login to add items to cart.");
      setIsAddingToCart(false);
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        _id: product._id,
        title: product.title,
        price: product.price,
        size: selectedSize || "Default",
        measurement: userMeasurement || "N/A",
        quantity,
        colors:
          selectedColors[product._id]?.length > 0
            ? selectedColors[product._id]
            : [product.colors?.[0] || "black"],
        image: product.images[0],
        alreadyReserved: true,
      });

      toast.success(`✅ "${product.title}" added to cart`);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      toast.error(`❌ ${err.message}`);
    } finally {
      setIsAddingToCart(false);
    }

    await fetchAvailableStock();
  };

  const formatPrice = (price) => {
    const num = Number(price);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (!product || !selectedImage) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="colored" />
      <div className="w-full bg-gray-50 min-h-screen xl:pt-[3%] pt-[10%]">
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:flex lg:gap-8 xl:gap-12 bg-white rounded-2xl shadow-lg p-8">
            <div className="lg:w-[45%]">
              <div className="flex flex-col gap-6">
                <div
                  className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg cursor-zoom-in"
                  onClick={() => setIsFullScreen(true)}
                >
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex gap-4 pb-4 overflow-x-auto">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                        selectedImage === img ? "border-black shadow-md" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-10 xl:w-[4rem]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:w-[55%] mt-8 lg:mt-0 lg:pl-8">
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{product.title}</h1>
                  <p className="mt-3 text-3xl font-medium text-gray-900">₦{formatPrice(product.price)}</p>
                  <p className="mt-5 text-gray-600 leading-relaxed text-lg">{product.description}</p>
                </div>

                <div className="border-t border-gray-200 pt-8 space-y-8">
                  {/* Size */}
                  <div className="space-y-4">
                    <label className="block text-lg font-medium text-gray-700">Select Size</label>
                    <select
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black text-lg"
                    >
                      <option value="">Select size (optional)</option>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="custom">Custom Measurement</option>
                    </select>
                    {selectedSize === "custom" && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter measurements (e.g., 42-32-38)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                          maxLength={50}
                          onChange={(e) => setUserMeasurement(e.target.value)}
                        />
                        <p className="mt-2 text-xs text-gray-500">Separate values with hyphens (e.g., 40-32-41)</p>
                      </div>
                    )}
                  </div>

                  {/* Colors */}
                  <div className="space-y-4">
                    <label className="block text-lg font-medium text-gray-700">Available Colors</label>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((color) => {
                        const isSelected = selectedColors[product._id]?.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            style={{ backgroundColor: color }}
                            className={`w-12 h-12 rounded-full border-2 border-white shadow-lg ${
                              isSelected ? "ring-4 ring-offset-2 ring-black scale-110" : "hover:ring-2 hover:ring-gray-300"
                            } transition-all`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500">
                      You can select up to <strong>{quantity}</strong> color{quantity > 1 && "s"}.
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-4">
                    <label className="block text-lg font-medium text-gray-700">Quantity</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={decreaseQuantity}
                        className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-xl"
                      >
                        −
                      </button>
                      <span className="w-16 text-center text-xl font-medium">{quantity}</span>
                      <button
                        onClick={increaseQuantity}
                        className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-xl"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {isLoadingStock
                        ? "Checking stock..."
                        : !sessionStorage.getItem("user")
                        ? ""
                        : available <= 0
                        ? "Out of Stock"
                        : `${available} item${available > 1 ? "s" : ""} available`}
                    </p>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || available <= 0}
                    className={`w-full text-white py-5 rounded-xl font-bold text-xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                      available <= 0 || isAddingToCart
                        ? "bg-gray-400 cursor-not-allowed opacity-60"
                        : "bg-gray-900 hover:bg-gray-800 hover:scale-[1.02] shadow-xl hover:shadow-2xl"
                    }`}
                  >
                    {available <= 0 ? (
                      "Out of Stock"
                    ) : isAddingToCart ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <i className="ri-shopping-cart-2-line"></i>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image */}
      {isFullScreen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setIsFullScreen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={selectedImage}
              alt={product.title}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
              onClick={() => setIsFullScreen(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Product;
