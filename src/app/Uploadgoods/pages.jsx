"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define tag limits
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

export default function UploadProduct() {
  const [formData, setFormData] = useState({
    title: "",
    quantity: "",
    price: "",
    category: "",
    description: "",
    armLength: "",
    size: "",
    width: "",
    tags: [],
  });

  const [images, setImages] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#000000");

  // Fetch current product counts for each tag
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

  useEffect(() => {
    // Fetch product counts for each tag
    const fetchProductCounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/product-counts`);
        const data = await response.json();
        if (response.ok) {
          setProductCounts(data);
        }
      } catch (error) {
        console.error("❌ Error fetching product counts:", error);
      }
    };

    fetchProductCounts();
  }, []);

  // Function to format the price with commas
  const formatPriceWithCommas = (value) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to remove commas from the price
  const removeCommasFromPrice = (value) => {
    return value.replace(/,/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for the price field
    if (name === "price") {
      const formattedValue = formatPriceWithCommas(value); // Add commas
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  const addColor = () => {
    if (!colors.includes(selectedColor)) {
      setColors([...colors, selectedColor]);
    }
  };

  const removeColor = (colorToRemove) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // ✅ Validate required fields
      if (
        !formData.title ||
        !formData.quantity ||
        !formData.price ||
        !formData.size || // still needed even for accessories in case you decide to use it
        !formData.description
      ) {
        toast.error(
          "❌ Please fill all required fields (Title, Quantity, Price, Size, and Description).",
          {
            position: "top-right",
            autoClose: 3000,
            style: { background: "#FFEB3B", color: "#000" },
          }
        );
        setLoading(false);
        return;
      }
  
      // ✅ Validate at least one image is uploaded
      const uploadedImages = images.filter((img) => img !== null);
      if (uploadedImages.length === 0) {
        toast.error("❌ Please upload at least one image.", {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }
  
      // ✅ Ensure at least one category or tag is selected
      if (
        !formData.category &&
        (!formData.tags || formData.tags.length === 0)
      ) {
        toast.error(
          "❌ Please select a category or at least one section (tag).",
          {
            position: "top-right",
            autoClose: 3000,
            style: { background: "#FFEB3B", color: "#000" },
          }
        );
        setLoading(false);
        return;
      }
  
      // ✅ Check product limits for tags (only for non-accessories)
      const isAccessory = formData.category === "Accessories";
      if (!isAccessory) {
        for (const tag of formData.tags) {
          if (productCounts[tag] >= tagLimits[tag]) {
            toast.error(
              `❌ You cannot post beyond ${tagLimits[tag]} items in ${tag}.`,
              {
                position: "top-right",
                autoClose: 3000,
                style: { background: "#FFEB3B", color: "#000" },
              }
            );
            setLoading(false);
            return;
          }
        }
      }
  
      // ✅ Remove commas from the price before submitting
      const numericPrice = removeCommasFromPrice(formData.price);
  
      // ✅ Upload images to AWS S3 and get URLs
      const imageUrls = [];

      for (const img of uploadedImages) {
        const imgForm = new FormData();
        imgForm.append("file", img);
      
        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: imgForm,
          credentials: "include",
        });
      
        const uploadData = await uploadRes.json();
      
        if (!uploadRes.ok || !uploadData.imageUrl) {
          throw new Error("Failed to upload image");
        }
      
        imageUrls.push(uploadData.imageUrl);
      }
      
      console.log("Image URLs:", imageUrls); // Log image URLs
  
      // ✅ Choose endpoint and payload based on category
      const endpoint = `${API_URL}/api/auth/add-product`;

  
      const payload = isAccessory
        ? {
            title: formData.title,
            price: numericPrice,
            quantity: formData.quantity,
            description: formData.description,
            category: formData.category,
            images: imageUrls,    
            colors,
          }
        : {
            ...formData,
            price: numericPrice,
            images: imageUrls,
            colors,
            tags: formData.tags,
          };
  
      // ✅ Send product data to backend
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("Backend Response:", data);
  
      if (response.ok) {
        toast.success("✅ Product uploaded successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#4CAF50", color: "#fff" },
        });
  
        // Reset form
        setFormData({
          title: "",
          quantity: "",
          price: "",
          category: "",
          description: "",
          armLength: "",
          size: "",
          width: "",
          tags: [],
        });
        setImages([null, null, null, null]);
        setColors([]);
      } else {
        toast.error(data.error || "❌ Failed to upload product.", {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#FF5252", color: "#fff" },
        });
      }
    } catch (error) {
      toast.error(`❌ Upload failed: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#FF5252", color: "#fff" },
      });
      console.error("❌ Upload Error:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white shadow-lg p-6 rounded-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Upload New Product
        </h2>

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
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                  <button
                    onClick={() => {
                      const newImages = [...images];
                      newImages[index] = null;
                      setImages(newImages);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <label className="cursor-pointer text-center">
                  <span className="text-gray-500">
                    Upload Image {index + 1}
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
            {colors.map((color, index) => (
              <div
                key={index}
                className="relative group"
                onClick={() => removeColor(color)}
              >
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-md hover:shadow-lg transition-all"
                  style={{ backgroundColor: color }}
                ></div>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Product Name"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text" // Changed to type="text" for comma formatting
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price (₦)"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Category (Optional)</option>
              <option value="Caps">Caps</option>
              <option value="Shoes">Shoes</option>
              <option value="Agbada">Abgada</option>
              <option value="Kaftan">Kaftan</option>
              <option value="Suits">Suits</option>
              <option value="Pams">Pams</option>
              <option value="Two-Piece">Two - Piece</option>
              <option value="Accessories">Accessories</option>
            </select>

            <input
              type="text"
              name="armLength"
              value={formData.armLength}
              onChange={handleChange}
              placeholder="Arm Length (Optional)"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="Size (e.g., M, L, XL)"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="width"
              value={formData.width}
              onChange={handleChange}
              placeholder="Width / Trouser Length (Optional)"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />

            <select
              multiple
              name="tags"
              value={formData.tags}
              onChange={(e) => {
                const selectedTags = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData({ ...formData, tags: selectedTags });
              }}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {Object.entries(tagLimits).map(([tag, limit]) => (
                <option
                  key={tag}
                  value={tag}
                  disabled={productCounts[tag] >= limit}
                >
                  {tag} {productCounts[tag] >= limit ? "(Limit Reached)" : ""}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
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
            {loading ? "Uploading..." : "Upload Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
