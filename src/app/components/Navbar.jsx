"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiShoppingCart,
  FiMenu,
  FiX,
  FiUser,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cart from "../components/Cart";
import useCartStore from "../components/store/useCartStore";
import { AnimatePresence, motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const router = useRouter();
  const { clearCart } = useCartStore();

  const categories = [
    { name: "Caps", link: "/Category/Caps" },
    { name: "Palms", link: "/Category/Pams" },
    { name: "Shoes", link: "/Category/Shoes" },
    { name: "Kaftan", link: "/Category/Kaftan" },
    { name: "Suit", link: "/Category/Suits" },
    { name: "Agbada", link: "/Category/Agbada" },
    { name: "Two piece", link: "/Category/Two-Piece" },
    // { name: "accessories", link: "/Category/Accessories" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
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
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Logged out successfully!");

        // 🧹 Clear session and Zustand cart
        sessionStorage.removeItem("user");
        clearCart(); // clears in-memory Zustand state

        // 🧹 Extra: remove from localStorage (this fixes the cart coming back after logout)
        localStorage.removeItem("cart-storage"); // 👈 this is the key used in Zustand persist

        setUser(null);

        setTimeout(() => router.push("/login"), 1000);
      } else {
        toast.error(data.error || "❌ Failed to logout.");
      }
    } catch (error) {
      toast.error("❌ Something went wrong. Try again.");
    }
  };

  const cartItems = useCartStore((state) => state.cartItems);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 fixed w-full z-50 py-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <motion.img
                src="/IMG_D87B3092EE01-1_LE_upscale_balanced_x4.jpg"
                alt="Style By Lucid Logo"
                className="h-12 md:h-16 w-auto transform group-hover:scale-105 transition-transform duration-300"
                whileHover={{ scale: 1.05 }}
              />
            </Link>

            {/* Mobile Menu */}
            <div className="flex items-center gap-4 lg:hidden">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-700 hover:text-primary p-2 rounded-full transition-colors"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8 flex-grow justify-end">
              {/* Search Bar */}
              {/* <div className="relative flex-grow max-w-xl">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-6 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50 pr-12 transition-all duration-300"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-br from-primary to-primary-dark p-2 rounded-full hover:opacity-90 transition-opacity">
                  <FiSearch className="text-white w-5 h-5" />
                </button>
              </div> */}

              {/* Navigation Links */}
              <div className="flex gap-6 items-center">
                <div className="relative group">
                  <button className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                    Categories
                    <FiChevronDown className="mt-0.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute hidden group-hover:block top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.link}
                        href={category.link}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <span className="w-2 h-2 bg-primary rounded-full mr-2" />
                        {category.name}
                      </Link>
                    ))}
                  </motion.div>
                </div>

                <>
                  <Link
                    href="/shop"
                    className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Shop
                  </Link>
                  <Link
                    href="/Category/Accessories"
                    className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Accessories
                  </Link>
                  <Link
                    href="/size-guide"
                    className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Size Guide
                  </Link>
                  <Link
                    href="/about"
                    className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Contact
                  </Link>
                </>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {user ? (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-medium">
                        {user.fullName.charAt(0)}
                      </div>
                    ) : (
                      <FiUser className="w-6 h-6 text-gray-700" />
                    )}
                  </button>

                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50"
                    >
                      {/* {user && (
  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-lg">
      {user.fullName.charAt(0)}
    </div>
    <div className="text-gray-700 font-medium text-sm">
      Hi, {user.fullName.split(" ")[0]}
    </div>
  </div>
)} */}

                      {user ? (
                        <>
                          <div className="px-4 py-2 text-sm font-medium text-gray-700">
                            Hi, {user.fullName.split(" ")[0]}!
                          </div>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                          >
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                          >
                            Log Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                          >
                            Login
                          </Link>
                          <Link
                            href="/signup"
                            className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiShoppingCart className="w-6 h-6 text-gray-700" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween" }}
              className="w-80 max-w-full h-full bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="mb-8 text-gray-600 hover:text-primary transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>

                <div className="space-y-4">
                  {/* <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <FiSearch className="absolute right-3 top-3 text-gray-500" />
                  </div> */}

                  <button
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className="w-full flex items-center justify-between py-3 text-gray-700 hover:text-primary transition-colors"
                  >
                    Categories
                    <FiChevronDown
                      className={`transform ${
                        categoryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {categoryOpen && (
                    <div className="pl-4 space-y-2">
                      {categories.map((category) => (
                        <Link
                          key={category.link}
                          href={category.link}
                          className="block py-2 text-gray-600 hover:text-primary transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link
                    href="/Category/Accessories"
                    className="block py-3 text-gray-700 hover:text-primary transition-colors"
                  >
                    Accessories
                  </Link>
                  {["Shop", , "About", "Contact"].map((item) => (
                    <Link
                      key={item}
                      href={`/${item.toLowerCase()}`}
                      className="block py-3 text-gray-700 hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-gray-100">
                    {user ? (
                      <>
                        {/* <Link
                          href="/profile"
                          className="block py-3 text-gray-700 hover:text-primary transition-colors"
                        >
                          Profile
                        </Link> */}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left py-3 text-gray-700 hover:text-red-600 transition-colors"
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block py-3 text-gray-700 hover:text-primary transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          href="/signup"
                          className="block py-3 text-gray-700 hover:text-primary transition-colors"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && <Cart closeCart={() => setCartOpen(false)} />}
      </AnimatePresence>

      <ToastContainer position="bottom-right" />
    </>
  );
}
