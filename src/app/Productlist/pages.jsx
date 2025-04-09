"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [colors, setColors] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All"); // ✅ New state for tag filtering
  
  const [productCounts, setProductCounts] = useState({
    "Newest Products": 0,
    "Men Outfit For The Week": 0,
    "Suits - Tags": 0,
    "Kaftan - Tags": 0,
    "Cap - Tags": 0,
    "Agbada - Tags": 0,
    "Pams - Tags": 0,
    "Two Piece - Tags": 0,
    "Shoes - Tags": 0,
  });
  const tags = [
    "Newest Products",
    "Men Outfit For The Week",
    "Suits - Tags",
    "Kaftan - Tags",
    "Cap - Tags",
    "Agbada - Tags",
    "Pams - Tags",
    "Two Piece - Tags",
    "Shoes - Tags",
  ];

  const tagLimits = {
    "Newest Products": 8,
    "Men Outfit For The Week": 10,
    "Suits - Tags": 4,
    "Kaftan - Tags": 4,
    "Cap - Tags": 4,
    "Agbada - Tags": 4,
    "Pams - Tags": 4,
    "Two Piece - Tags": 4,
    "Shoes - Tags": 4,
  };
  useEffect(() => {
    const fetchProductCounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/product-counts`);
        const data = await response.json();
        if (response.ok) {
          setProductCounts(data); // Update the state with fetched counts
        }
      } catch (error) {
        console.error("❌ Error fetching product counts:", error);
      }
    };
  
    fetchProductCounts();
  }, []);
  // ✅ Fetch all products and organize them by tags
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/all-products`);
        if (!response.ok) throw new Error("Failed to fetch products");
  
        const data = await response.json();
        console.log("Fetched Products:", data); // ✅ Check what is being fetched
        setProducts(data);
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      }
    };
  
    fetchProducts();
  }, []);
  

  // ✅ Filter products based on the selected tag
  const filteredProducts = products.filter((product) => {
    if (selectedTag === "All") {
      return product.tags.length > 0 || !product.category; // ✅ Show products with tags OR no category
    }
    return product.tags.includes(selectedTag);
  });
  
  
  

  // ✅ Add color to list
  const addColor = () => {
    if (!colors.includes(selectedColor)) {
      setColors([...colors, selectedColor]);
      setSelectedProduct((prev) => ({
        ...prev,
        colors: [...prev.colors, selectedColor],
      }));
    }
  };

  // ✅ Remove color from list
  const removeColor = (colorToRemove) => {
    setColors(colors.filter((color) => color !== colorToRemove));
    setSelectedProduct((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  // ✅ Delete product function
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/products/delete-product/${id}`,
        {
          method: "DELETE",
        }
      );

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

  // ✅ Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // ✅ Upload images to AWS S3 and get URLs
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
          return image;
        })
      );
  
      // ✅ Send product data to backend
      const response = await fetch(
        `${API_URL}/api/products/update-product/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedProduct,
            images: uploadedImages,
            colors,
            tags: selectedProduct.tags,
          }),
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success("✅ Product updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#4CAF50", color: "#fff" },
        });
      
        // ✅ Re-fetch accurate stock count
        const stockRes = await fetch(`${API_URL}/api/products/stock/${selectedProduct._id}?includeMine=true`);
        const stockData = await stockRes.json();
      
        // ✅ Update local product state with real stock
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === selectedProduct._id
              ? {
                  ...product,
                  ...selectedProduct,
                  quantity: Number(selectedProduct.quantity), // ✅ use new input value
                  images: uploadedImages,
                  colors,
                }
              : product
          )
        );
        
        setModalOpen(false);
      }
      else {
        toast.error(data.error || "❌ Failed to update product.", {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#FF5252", color: "#fff" },
        });
      }
    } catch (error) {
      console.error("❌ Error updating product:", error);
      toast.error("❌ An error occurred. Try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#FF5252", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ Open Edit Modal
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setImages(product.images);
    setColors(product.colors || []);
    setModalOpen(true);
  };

  // ✅ Handle image upload
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

  // ✅ Handle image removal
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
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Products</h1>

      {/* ✅ Tag Filter Dropdown */}
      <select
        value={selectedTag}
        onChange={(e) => setSelectedTag(e.target.value)}
        className="p-2 border border-gray-300 rounded-lg mb-6"
      >
        <option value="All">All Tags</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      {/* ✅ Product List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              className="border p-4 bg-white rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              layout
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded-md"
                />
              ) : (
                <p className="text-gray-500">No Image Available</p>
              )}

<h2 className="text-lg font-bold mt-2">{product.title}</h2>
<p className="text-gray-600 mb-1">₦{product.price}</p>

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
                  Edit <i className="ri-edit-box-line"></i>
                </button>
                <button
                  onClick={() => {
                    setProductToDelete(product._id);
                    setDeleteModalOpen(true);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-md w-full"
                >
                  Delete <i className="ri-delete-bin-6-line"></i>
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">No products found.</p>
        )}
      </div>

      {/* ✅ Edit Product Modal */}
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

                {/* ✅ Add a "+" icon to upload more images if the total is less than 4 */}
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
                    value={selectedProduct.quantity}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="Quantity"
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
                    placeholder="Price (¥)"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  {/* <select
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
                    <option value="clothing">Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="home">Home</option>
                  </select> */}
                  <input
                    type="text"
                    value={selectedProduct.armLength}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        armLength: e.target.value,
                      })
                    }
                    placeholder="Arm Length (e.g., 20 inches)"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={selectedProduct.size}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        size: e.target.value,
                      })
                    }
                    placeholder="Size (e.g., M, L, XL)"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={selectedProduct.width}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        width: e.target.value,
                      })
                    }
                    placeholder="Width / Trouser Length (e.g., 30 inches)"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
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
                {/* ✅ Tags Selector */}
                <select
                  multiple
                  value={selectedProduct.tags}
                  onChange={(e) => {
                    const selectedTags = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setSelectedProduct({
                      ...selectedProduct,
                      tags: selectedTags,
                    });
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {Object.entries(tagLimits).map(([tag, limit]) => (
                    <option
                      key={tag}
                      value={tag}
                      disabled={productCounts[tag] >= limit}
                    >
                      {tag}{" "}
                      {productCounts[tag] >= limit ? "(Limit Reached)" : ""}
                    </option>
                  ))}
                </select>
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

      {/* ✅ Delete Confirmation Modal */}
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
