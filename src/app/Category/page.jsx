"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CategoryProducts() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [colors, setColors] = useState([]);

  // Fetch all categories & product counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const resProducts = await fetch(`${API_URL}/api/products/category-counts`);
        const productData = await resProducts.json();

        if (resProducts.ok) {
          const allCategories = [...new Set(productData.map((item) => item.category))];
          setCategories(allCategories);

          const counts = productData.reduce(
            (acc, item) => ({ ...acc, [item.category]: item.count }),
            {}
          );
          setCategoryCounts(counts);
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        toast.error("❌ Failed to fetch categories. Please try again.");
      }
    };

    fetchCategories();
  }, []);

  // Fetch products by category
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/products/products-by-category/${selectedCategory}`
        );
        const data = await response.json();
        if (response.ok) {
          setProducts(data);
        } else {
          toast.error(data.error || "❌ Failed to fetch products.");
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        toast.error("❌ An error occurred. Please try again.");
      }
    };

    if (selectedCategory !== "All") {
      fetchProductsByCategory();
    } else {
      // Fetch all products if "All" is selected
      const fetchAllProducts = async () => {
        try {
          const response = await fetch(`${API_URL}/api/products/all-products`);
          const data = await response.json();
          if (response.ok) {
            // Filter: Only show products that have a category (exclude tagged-only products)
            const filtered = data.filter(
              (product) => product.category && product.tags.length === 0
            );
            setProducts(filtered);
          } else {
            toast.error(data.error || "❌ Failed to fetch products.");
          }
        } catch (error) {
          console.error("❌ Error fetching all products:", error);
          toast.error("❌ An error occurred. Please try again.");
        }
      };

      fetchAllProducts();
    }
  }, [selectedCategory]);

  // Handle product deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/products/delete-product/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("✅ Product deleted successfully!");
        setProducts((prev) => prev.filter((product) => product._id !== id));
      } else {
        toast.error(data.error || "❌ Failed to delete product.");
      }
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      toast.error("❌ An error occurred. Try again.");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  // Handle edit submission (Prevent category over-limit)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if category limit is exceeded
    if (
      selectedProduct.category &&
      categoryCounts[selectedProduct.category] >= 25
    ) {
      toast.error(
        `❌ ${selectedProduct.category} has reached the 25-product limit.`
      );
      setLoading(false);
      return;
    }

    try {
      // Upload images to AWS S3 and get URLs
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          if (image instanceof File) {
            const formData = new FormData();
            formData.append("file", image);

            const uploadResponse = await fetch(`${API_URL}/api/upload`, {
              method: "POST",
              body: formData,
            });

            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok)
              throw new Error(uploadData.error || "Upload failed");

            return uploadData.imageUrl;
          }
          return image; // Use existing URL
        })
      );

      const response = await fetch(
        `${API_URL}/api/products/update-product/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedProduct,
            images: uploadedImages,
            colors,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Product updated successfully!");

        // Optional: fetch updated stock
        const updatedQuantity = selectedProduct.quantity;

        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === selectedProduct._id
              ? {
                  ...product,
                  ...selectedProduct,
                  quantity: Number(updatedQuantity),
                  images: uploadedImages,
                  colors,
                }
              : product
          )
        );

        setModalOpen(false);
      } else {
        toast.error(data.error || "❌ Failed to update product.");
      }
    } catch (error) {
      console.error("❌ Error updating product:", error);
      toast.error("❌ An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setImages(product.images || []);
    setColors(product.colors || []);
    setModalOpen(true);
  };

  // Handle image upload
  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file; // Replace the existing image or add a new one
      setImages(newImages);

      setSelectedProduct((prev) => ({
        ...prev,
        images: newImages.map((img) => (img instanceof File ? img : img)),
      }));
    }
  };

  // Handle image removal
  const handleRemoveImage = async (imageToRemove) => {
    try {
      const response = await fetch(`${API_URL}/api/products/delete-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id,
          imageUrl: imageToRemove,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("✅ Image removed successfully!");

        // Remove the image from the images array
        const newImages = images.filter((img) => img !== imageToRemove);
        setImages(newImages);

        // Update the selected product state
        setSelectedProduct((prev) => ({
          ...prev,
          images: newImages,
        }));
      } else {
        toast.error(data.error || "❌ Failed to remove image.");
      }
    } catch (error) {
      console.error("❌ Error deleting image:", error);
      toast.error("❌ An error occurred. Try again.");
    }
  };

  // Add color to list
  const addColor = () => {
    if (!colors.includes(selectedColor)) {
      setColors([...colors, selectedColor]);
      setSelectedProduct((prev) => ({
        ...prev,
        colors: [...prev.colors, selectedColor],
      }));
    }
  };

  // Remove color from list
  const removeColor = (colorToRemove) => {
    setColors(colors.filter((color) => color !== colorToRemove));
    setSelectedProduct((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Category Products
      </h1>

      {/* Category Filter Dropdown */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="p-2 border border-gray-300 rounded-lg mb-6"
      >
        <option value="All">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category} ({categoryCounts[category] || 0}/25)
          </option>
        ))}
      </select>

      {/* Product List */}
      <div className="grid grid-cols-1 lg:grid-cols-3  xl:grid-cols-4 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <motion.div
              key={product._id}
              className="border p-4 bg-white rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              layout
            >
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : "/placeholder.jpg"
                }
                alt={product.title}
                className="w-full h-40 object-cover rounded-md"
              />
              <h2 className="text-lg font-bold mt-2">{product.title}</h2>
              <p className="text-gray-600">₦{product.price}</p>
              {product.quantity === 0 ? (
                <div className="inline-block px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full font-medium mb-2">
                  Out of Stock
                </div>
              ) : product.quantity <= 5 ? (
                <div className="inline-block px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full font-medium mb-2">
                  Low Stock ({product.quantity})
                </div>
              ) : null}
              <div className="flex mt-3 gap-3">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-black text-white px-4 py-2 rounded-md w-full"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setProductToDelete(product._id);
                    setDeleteModalOpen(true);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-md w-full"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">No products found.</p>
        )}
      </div>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {modalOpen && selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg xl:w-[60%] w-[95%] h-[80%] relative overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              >
                ✖
              </button>

              <h2 className="text-xl font-bold mb-4">Edit Product</h2>

              {/* Image Upload Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative border-2 border-dashed border-gray-300 p-4 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    {img ? (
                      <>
                        <img
                          src={
                            typeof img === "string"
                              ? img
                              : URL.createObjectURL(img)
                          }
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                        <button
                          onClick={() => handleRemoveImage(img)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer text-center w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">
                          {index === 0
                            ? "Upload Image"
                            : `Upload Image ${index + 1}`}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}

                {/* Add a "+" icon to upload more images if the total is less than 4 */}
                {images.length < 4 && (
                  <div
                    className="relative border-2 border-dashed border-gray-300 p-4 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => {
                      // Add a null entry to the images array to trigger the upload box
                      setImages([...images, null]);
                    }}
                  >
                    <span className="text-gray-500 text-2xl">+</span>
                    <span className="text-gray-500 text-sm">Add Image</span>
                  </div>
                )}
              </div>

              {/* Color Picker Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 xl:text-start text-center text-gray-800">
                  Select Available Colors
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-12 h-12 cursor-pointer border-2 border-gray-300 rounded-lg shadow-sm"
                    />
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                  <button
                    onClick={addColor}
                    className="px-6 py-3 bg-black text-white rounded-md transition-all transform hover:scale-105 shadow-lg"
                  >
                    Add Color
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {colors.length > 0 ? (
                    colors.map((color, index) => (
                      <div key={index} className="relative group">
                        <div
                          className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer shadow-md hover:shadow-lg transition-all"
                          style={{ backgroundColor: color }}
                        ></div>
                        <button
                          onClick={() => removeColor(color)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No colors selected</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={selectedProduct.title}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        title: e.target.value,
                      })
                    }
                    placeholder="Product Name"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        price: e.target.value,
                      })
                    }
                    placeholder="Price (₦)"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    value={
                      selectedProduct.quantity === 0 || selectedProduct.quantity
                        ? selectedProduct.quantity
                        : ""
                    }
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        quantity:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    placeholder="Quantity"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />

                  <select
                    value={selectedProduct.category}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={selectedProduct.description}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="4"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-96"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
              <p className="mb-6">This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(productToDelete)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}