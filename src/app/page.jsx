"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Swiper from "./components/Swiper";
import ProductCard from "./components/ProductCard";
import useCartStore from "./components/store/useCartStore";
import { RiCloseLine } from "react-icons/ri"; // Import Remix Icon for close button
import Footer from "./components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [menOutfit, setMenOutfit] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [suits, setSuits] = useState([]);
  const [kaftan, setKaftan] = useState([]);
  const [caps, setCaps] = useState([]);
  const [pams, setPams] = useState([]);
  const [agbada, setAgbada] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [userMeasurement, setUserMeasurement] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);

  // ✅ Open Modal and Set Selected Product
  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedImage(product.images[0]); // Set default image
    setIsOpen(true);
  };

  // ✅ Close Modal
  const closeModal = () => {
    setIsOpen(false);
    setSelectedProduct(null);
    setSelectedSize(null); // Reset size selection
    setSelectedColor(null); // Reset color selection
    setQuantity(1); // Reset quantity
  };

  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/user`, {
          method: "GET",
          credentials: "include",
        });
  
        const data = await response.json();
        if (response.ok) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
      } catch (error) {
        console.error("❌ Auto-login failed:", error);
        setUser(null);
      } finally {
        loadCart(); // ✅ Always load Zustand cart on first load
      }
    };
  
    fetchUserAndCart();
  }, []);
  

  useEffect(() => {
    // ✅ Fetch "Men Outfit For The Week"
    fetch(`${API_URL}/api/products/products-by-tag/Men Outfit For The Week`)
      .then((res) => res.json())
      .then((data) => setMenOutfit(data));

    // ✅ Fetch "Newest Products"
    fetch(`${API_URL}/api/products/products-by-tag/Newest Products`)
      .then((res) => res.json())
      .then((data) => setNewestProducts(data));

    // ✅ Fetch "Suits - Tags"
    fetch(`${API_URL}/api/products/products-by-tag/Suits - Tags`)
      .then((res) => res.json())
      .then((data) => setSuits(data));

    // ✅ Fetch "Kaftan - Tags"
    fetch(`${API_URL}/api/products/products-by-tag/Kaftan - Tags`)
      .then((res) => res.json())
      .then((data) => setKaftan(data));

    // ✅ Fetch "Cap - Tags"
    fetch(`${API_URL}/api/products/products-by-tag/Cap - Tags`)
      .then((res) => res.json())
      .then((data) => setCaps(data));

    // ✅ Fetch "Pams - Tags"
    fetch(`${API_URL}/api/products/products-by-tag/Pams - Tags`)
      .then((res) => res.json())
      .then((data) => setPams(data));

    // ✅ Fetch "Agbada - Tags"
    fetch(`${API_URL}/api/products/products-by-tag/Agbada - Tags`)
      .then((res) => res.json())
      .then((data) => setAgbada(data));

    // ✅ Fetch "Shoes - Tags"
    fetch(`${API_URL}/api/products/products-by-tag/Shoes - Tags`)
      .then((res) => res.json())
      .then((data) => setShoes(data));
  }, []);

  const { loadCart, setCartItems, addToCart } = useCartStore();
  const setCart = useCartStore((state) => state.setCart);

  const handleColorSelect = (color) => {
    setSelectedColors((prevColors) => {
      const currentColors = prevColors[selectedProduct._id] || [];

      if (currentColors.includes(color)) {
        return {
          ...prevColors,
          [selectedProduct._id]: currentColors.filter((c) => c !== color),
        };
      }

      if (currentColors.length < quantity) {
        return {
          ...prevColors,
          [selectedProduct._id]: [...currentColors, color],
        };
      }
      return prevColors;
    });
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
      setSelectedColors((prevColors) => {
        const currentColors = prevColors[selectedProduct._id] || [];
        return {
          ...prevColors,
          [selectedProduct._id]: currentColors.slice(0, -1),
        };
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative w-full h-[80vh] overflow-hidden flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-6 pt-[5%]">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wide">
            Elevate Your Style with <span className="text-[#7ad5ed]">Lucid</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl">
            Discover premium fashion crafted for men who demand sophistication
            and quality.
          </p>
          <Link href="/shop" className="btn-slice mt-[5rem]">
            <div className="top">
              <span>
                Shop Now <i className="ri-shopping-bag-line text-[white]"></i>
              </span>
            </div>
            <div className="bottom">
              <span>
                Shop Now <i className="ri-shopping-bag-line text-[white]"></i>
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Newest Products Section */}
      <div className="mt-10">
        <h2 className="xl:text-3xl text-4xl font-bold text-black mb-5 flex justify-center text-center">
          Newest Products
        </h2>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          <div className="grid xl:mt-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-5 lg:gap-5 sm:grid-cols-2 md:grid-cols-2 pt-3">
            {newestProducts.length > 0 ? (
              newestProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  // openModal={openModal}
                  addToCart={addToCart}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  userMeasurement={userMeasurement}
                />
              ))
            ) : (
              <p className="text-gray-500">No products found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Men Outfit for the Week Section */}
      <div className="mt-10 bg-gray-100">
        <h2 className="text-2xl font-bold text-black mb-5 flex justify-center">
          <p className="text-center xl:text-3xl text-4xl pt-10">
            Men Outfit For The Week
          </p>
        </h2>
        <div
          style={{
            background: "linear-gradient(to bottom, black 0%, white 50%)",
          }}
        ></div>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          {menOutfit.length > 0 ? (
            <Swiper products={menOutfit} />
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </div>
      </div>

      {/* Suits Section */}
      <div className="mt-10">
        <h2 className="xl:text-3xl text-4xl font-bold text-black mb-5 flex justify-center text-center">
          Top Luxury Suits
        </h2>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          <div className="grid xl:mt-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-5 lg:gap-5 sm:grid-cols-2 md:grid-cols-2 pt-3">
            {suits.length > 0 ? (
              suits.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  // openModal={openModal}
                  addToCart={addToCart}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  userMeasurement={userMeasurement}
                />
              ))
            ) : (
              <p className="text-gray-500">No suits found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Kaftan Section */}
      <div className="mt-10">
        <h2 className="xl:text-3xl text-4xl font-bold text-black mb-5 flex justify-center text-center">
          Men Kaftans
        </h2>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          <div className="grid xl:mt-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-5 lg:gap-5 sm:grid-cols-2 md:grid-cols-2 pt-3">
            {kaftan.length > 0 ? (
              kaftan.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  // openModal={openModal}
                  addToCart={addToCart}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  userMeasurement={userMeasurement}
                />
              ))
            ) : (
              <p className="text-gray-500">No kaftans found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Caps Section */}
      <div className="mt-10">
        <h2 className="xl:text-3xl text-4xl font-bold text-black mb-5 flex justify-center text-center">
          Native Men Caps
        </h2>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          <div className="grid xl:mt-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-5 lg:gap-5 sm:grid-cols-2 md:grid-cols-2 pt-3">
            {caps.length > 0 ? (
              caps.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  // openModal={openModal}
                  addToCart={addToCart}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  userMeasurement={userMeasurement}
                />
              ))
            ) : (
              <p className="text-gray-500">No caps found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pams Section */}
      <div className="mt-10">
        <h2 className="xl:text-3xl text-4xl font-bold text-black mb-5 flex justify-center text-center">
          Luxury Foot Wears
        </h2>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          <div className="grid xl:mt-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-5 lg:gap-5 sm:grid-cols-2 md:grid-cols-2 pt-3">
            {pams.length > 0 ? (
              pams.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  // openModal={openModal}
                  addToCart={addToCart}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  userMeasurement={userMeasurement}
                />
              ))
            ) : (
              <p className="text-gray-500">No foot wears found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Agbada Section */}
      <div className="mt-10">
        <h2 className="xl:text-3xl text-4xl font-bold text-black mb-5 flex justify-center text-center">
          Agbada For Men
        </h2>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          <div className="grid xl:mt-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-5 lg:gap-5 sm:grid-cols-2 md:grid-cols-2 pt-3">
            {agbada.length > 0 ? (
              agbada.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  // openModal={openModal}
                  addToCart={addToCart}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  userMeasurement={userMeasurement}
                />
              ))
            ) : (
              <p className="text-gray-500">No agbada found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Shoes Section */}
      <div className="mt-10">
        <h2 className="xl:text-3xl text-4xl font-bold text-black mb-5 flex justify-center text-center">
          Stylish Shoes
        </h2>
        <div className="container xl:mx-auto md:mx-auto mx-0 px-1 xl:px-4 sm:px-6 py-12 overflow-hidden">
          <div className="grid xl:mt-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-5 lg:gap-5 sm:grid-cols-2 md:grid-cols-2 pt-3">
            {shoes.length > 0 ? (
              shoes.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  // openModal={openModal}
                  addToCart={addToCart}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  userMeasurement={userMeasurement}
                />
              ))
            ) : (
              <p className="text-gray-500">No shoes found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
  {isOpen && selectedProduct && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95dvh] relative flex flex-col lg:flex-row overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-50 bg-white/90 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>

        {/* Image Section */}
        <div className="flex-1 relative lg:max-w-[60%] xl:max-w-[55%] flex flex-col border-r border-gray-100">
          <div 
            className="modal-image-container relative flex-1 overflow-hidden bg-gray-50 hover:cursor-zoom-in flex items-center justify-center"
            onClick={() => setFullScreenImage(selectedImage)}
          >
            <img
              src={selectedImage}
              alt="Selected Product"
              className="w-full h-auto max-h-[70vh] object-contain p-4 md:p-6 transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {selectedProduct.images.map((img, index) => (
                <button
                  key={index}
                  className={`shrink-0 relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img 
                      ? 'border-black scale-105' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Section with Scroll */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-gray-50">
          <div className="space-y-6 pb-6">
            {/* Product Title & Price */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {selectedProduct.title}
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-gray-800">
                ₦{selectedProduct.price}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {selectedProduct.description}
            </p>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-3">
              {selectedProduct.armLength && (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs md:text-sm font-medium text-gray-500">Arm Length</p>
                  <p className="text-sm md:text-base font-medium">{selectedProduct.armLength}</p>
                </div>
              )}
              {selectedProduct.size && (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs md:text-sm font-medium text-gray-500">Size</p>
                  <p className="text-sm md:text-base font-medium">{selectedProduct.size}</p>
                </div>
              )}
              {selectedProduct.width && (
                <div className="col-span-2 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs md:text-sm font-medium text-gray-500">Width</p>
                  <p className="text-sm md:text-base font-medium">{selectedProduct.width}</p>
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="block text-sm md:text-base font-medium text-gray-700">
                Select Size
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent text-sm md:text-base"
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Select size (optional)</option>
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
                <option value="XL">Extra Large (XL)</option>
                <option value="custom">Custom Measurement</option>
              </select>
              
              {selectedSize === "custom" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter your measurements"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm md:text-base"
                    maxLength={50}
                    onChange={(e) => setUserMeasurement(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {50 - (userMeasurement?.length || 0)} characters remaining
                  </p>
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="block text-sm md:text-base font-medium text-gray-700">
                Available Colors
              </label>
              <div className="flex flex-wrap gap-3">
                {selectedProduct.colors?.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-transform ${
                      selectedColors[selectedProduct._id]?.includes(color)
                        ? 'ring-2 ring-black scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="block text-sm md:text-base font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit">
                  <button 
                    onClick={decreaseQuantity}
                    className="px-4 py-2.5 hover:bg-gray-100 transition-colors text-lg md:text-xl"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium text-base md:text-lg">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2.5 hover:bg-gray-100 transition-colors text-lg md:text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button - Sticky on Mobile */}
            <div className="sticky bottom-0 bg-gray-50 pt-4 -mb-6">
              <button 
                className="w-full bg-black hover:bg-gray-800 text-white py-3 md:py-4 rounded-lg transition-all font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                onClick={() => {
                  addToCart({
                    productId: selectedProduct._id,
                    title: selectedProduct.title,
                    price: selectedProduct.price,
                    size: selectedSize || "Default",
                    measurement: userMeasurement || "N/A",
                    quantity,
                    colors: selectedColors[selectedProduct._id] || [],
                    image: selectedProduct.images[0],
                  });
                  closeModal();
                }}
              >
                <i className="ri-shopping-cart-line"></i>
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Full-Screen Image Preview */}
<AnimatePresence>
  {fullScreenImage && (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={() => setFullScreenImage(null)}
        className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-gray-200 transition-colors p-2"
      >
        <i className="ri-close-line text-2xl md:text-3xl"></i>
      </button>
      
      <div className="w-full h-full p-4 flex items-center justify-center">
        <img
          src={fullScreenImage}
          alt="Full-Screen Product"
          className="max-w-full max-h-full object-contain animate-fadeIn"
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
<Footer/>

<div className="bg-green-500 text-4xl">
  HELLO
</div>
    </>
  );
}