import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { QuickViewModal } from "@/components/QuickViewModal";
import { SearchModal } from "@/components/SearchModal";

// Pages
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import CustomProject from "@/pages/CustomProject";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import AdminProducts from "@/pages/AdminProducts";
import Orders from "@/pages/Orders";
import NoRoutes from "@/pages/NoRoutes";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans">
            <Navbar />
            
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/custom" element={<CustomProject />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/pedidos" element={<Orders />} />
                <Route path="/meus-pedidos" element={<Orders />} />
                <Route path="/minha-conta" element={<Orders />} />
                <Route path="/conta" element={<Orders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminProducts />} />
                <Route path="*" element={<NoRoutes />} />
              </Routes>
            </main>

            <Footer />

            {/* Global Modals & Drawers */}
            <CartDrawer />
            <CheckoutModal />
            <QuickViewModal />
            <SearchModal />
          </div>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  </BrowserRouter>
);
