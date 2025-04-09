"use client";
import { useState, useEffect } from "react";
import { 
  FaBox, 
  FaChartBar, 
  FaSignOutAlt, 
  FaShoppingCart, 
  FaUsers, 
  FaUpload, 
  FaList,
  FaRegChartBar,
  FaBars
} from "react-icons/fa";
import Uploadgoods from "../Uploadgoods/pages";
import Productlist from "../Productlist/pages";
import AdminAuthGuard from "../components/AdminAuthGuard";
import { useRouter } from "next/navigation";
import Category from "../Category/page";
import Orders from "../Orders/page";
import ManageUsers from "../manage-users/page";
import Overview from "../overview/page";
import Analytics from "../analytics/page";


function ProtectedAdminDashboard() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout-admin`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Logout failed");
      sessionStorage.removeItem("adminToken");
      setTimeout(() => router.replace("/admin-login"), 500);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gray-800 text-gray-100 transition-all duration-300
          ${isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full md:w-20 md:translate-x-0"}
          flex flex-col space-y-4 p-4 shadow-xl`}
      >
        <div className="flex items-center justify-between px-2 h-16">
          {isSidebarOpen && (
            <h2 className="text-xl font-semibold tracking-tight">Admin Panel</h2>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            {isSidebarOpen ? <FaBars className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { section: "overview", icon: <FaChartBar />, label: "Dashboard" },
            { section: "uploadProduct", icon: <FaUpload />, label: "Upload Product" },
            { section: "productList", icon: <FaList />, label: "Product List" },
            { section: "orders", icon: <FaShoppingCart />, label: "Orders" },
            { section: "category-list", icon: <FaBox />, label: "Categories" },
            { section: "analytics", icon: <FaRegChartBar />, label: "Analytics" },
            { section: "manage-users", icon: <FaUsers />, label: "Manage Users" },
          ].map(({ section, icon, label }) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                ${activeSection === section ? "bg-gray-700 text-white" : "hover:bg-gray-700/50"}`}
            >
              <span className="text-xl">{icon}</span>
              {isSidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600/10 text-red-400"
        >
          <FaSignOutAlt className="text-xl" />
          {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <header className="sticky top-0 bg-white border-b flex items-center justify-between px-6 h-16 z-50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 capitalize">
            {activeSection.replace("-", " ")}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Administrator</span>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {activeSection === "overview" && <DashboardStats />}
            {activeSection === "uploadProduct" && <UploadProduct />}
            {activeSection === "productList" && <ProductList />}
            {activeSection === "orders" && <Orders />}
            {activeSection === "analytics" && <Analytics />}
            {activeSection === "category-list" && <Category />}
            {activeSection === "manage-users" && <ManageUsers />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Enhanced Dashboard Components
function DashboardStats() {
  return (
    // <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //   <StatCard 
    //     icon={<FaUsers className="text-3xl text-blue-600" />}
    //     title="Total Users"
    //     value="2,500"
    //     trend="↑ 12% from last month"
    //   />
    //   <StatCard 
    //     icon={<FaShoppingCart className="text-3xl text-green-600" />}
    //     title="Total Orders"
    //     value="1,234"
    //     trend="↑ 8% from last week"
    //   />
    //   <StatCard 
    //     icon={<FaChartBar className="text-3xl text-purple-600" />}
    //     title="Revenue"
    //     value="$75,678"
    //     trend="↑ 15% YTD"
    //   />
    // </div>
    <Overview/>
  );
}

function StatCard({ icon, title, value, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-sm text-gray-500 font-medium">{title}</span>
          <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
          {trend && <span className="text-xs font-medium text-green-600">{trend}</span>}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

function UploadProduct() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <Uploadgoods />
    </div>
  );
}

function ProductList() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <Productlist />
    </div>
  );
}

function AnalyticsSection() {
  return (
    <Analytics />
  );
}

export default function AdminDashboard() {
  return (
    <AdminAuthGuard>
      <ProtectedAdminDashboard />
    </AdminAuthGuard>
  );
}