import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { CartProvider } from "./contexts/CartContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { MobileToolbar } from "./components/MobileToolbar";
import { ScrollToTop } from "./components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const SpaceAnalyzer = lazy(() => import("./pages/SpaceAnalyzer"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages (split for smaller initial bundle)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCompetitivePricing = lazy(() => import("./pages/admin/AdminCompetitivePricing"));

const queryClient = new QueryClient();

const Shell = () => (
  <>
    <ScrollToTop />
    <Outlet />
    <MobileToolbar />
  </>
);

const router = createBrowserRouter(
  [
    {
      element: <Shell />,
      children: [
        { path: "/", element: <Index /> },
        { path: "/products", element: <Products /> },
        { path: "/product/:slug", element: <ProductDetail /> },
        { path: "/cart", element: <Cart /> },
        { path: "/checkout", element: <Checkout /> },
        { path: "/space-analyzer", element: <SpaceAnalyzer /> },
        { path: "/about", element: <About /> },
        { path: "/contact", element: <Contact /> },

        // Admin
        { path: "/admin/login", element: <AdminLogin /> },
        { path: "/admin", element: <AdminDashboard /> },
        { path: "/admin/products", element: <AdminProducts /> },
        { path: "/admin/orders", element: <AdminOrders /> },
        { path: "/admin/customers", element: <AdminCustomers /> },
        { path: "/admin/analytics", element: <AdminAnalytics /> },
        { path: "/admin/categories", element: <AdminCategories /> },
        { path: "/admin/settings", element: <AdminSettings /> },
        { path: "/admin/competitive-pricing", element: <AdminCompetitivePricing /> },

        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}>
            <RouterProvider router={router} />
          </Suspense>
        </CartProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
