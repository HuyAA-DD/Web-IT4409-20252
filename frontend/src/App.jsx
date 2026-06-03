import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Import Floating Chatbot
import FloatingChatbot from './Components/FloatingChatbot/FloatingChatbot';

// Import các Layouts và Pages
import UserMainLayout from './Layouts/UserMainLayout/UserMainLayout';
import HomePage from './Pages/User/Homepage/HomePage';      
import AuthPage from './Pages/AuthPage/AuthPage';
import WishListPage from './Pages/User/WishListPage/WishListPage';
import TopProductsPage from './Pages/User/TopProductsPage/TopProductsPage';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import CartPage from './Pages/User/CartPage/CartPage';
import ChatbotPage from './Pages/User/ChatbotPage/ChatbotPage';

//Import cac Route
import USER_ROUTE from './Routes/User.routes';
import ADMIN_ROUTE from './Routes/Admin.routes';
import SELLER_ROUTE from './Routes/Seller.routes';
 
import ProductDetailPage from './Pages/User/ProductDetailPage/ProductDetailPage';
import AdminMainLayout from './Layouts/AdminMainLayout/AdminMainLayout';
import OrderListPage from './Pages/Admin/OrderListPage/OrderListPage';
import OrderDetailPage from './Pages/Admin/OrderDetailPage/OrderDetailPage';
import AuditLogPage from './Pages/Admin/AuditLogPage/AuditLogPage';
import AdminDashboardPage from './Pages/Admin/AdminDashboardPage/AdminDashboardPage';
import CouponPage from './Pages/Admin/CouponPage/CouponPage';
import AdminRevenuePage from './Pages/Admin/AdminRevenuePage/AdminRevenuePage';
import AdminTopProductPage from './Pages/Admin/AdminTopProductPage/AdminTopProductPage';
import AdminNotificationPage from './Pages/Admin/AdminNotificationPage/AdminNotificationPage';
import AdminProfilePage from './Pages/Admin/AdminProfilePage/AdminProfilePage';
import AdminChangePasswordPage from './Pages/Admin/AdminChangePasswordPage/AdminChangePasswordPage';
import NotificationPage from './Pages/User/NotificationPage/NotificationPage';
import AdminProductPage from "./Pages/Admin/AdminProductPage/AdminProductPage";
import ProductListPage from './Pages/User/ProductListPage/ProductListPage';
import SellerMainLayout from './Layouts/SellerMainLayout/SellerMainLayout';
import SellerProductPage from './Pages/Seller/SellerProductPage/SellerProductPage';
import SellerDashboardPage from './Pages/Seller/SellerDashboardPage/SellerDashboardPage';
import SellerProfilePage from './Pages/Seller/SellerProfilePage/SellerProfilePage';
import SellerNotificationPage from './Pages/Seller/SellerNotificationPage/SellerNotificationPage';
import UserProfilePage from './Pages/User/UserProfilePage/UserProfilePage';
import UserChangePasswordPage from './Pages/User/UserChangePasswordPage/UserChangePasswordPage';
import PaymentPage from './Pages/User/PaymentPage/PaymentPage';
import SellerChangePasswordPage from './Pages/Seller/SellerChangePasswordPage/SellerChangePasswordPage';
 
import RequireAuth from './Components/RequireAuth';
import CheckoutPage from './Pages/User/CheckoutPage/CheckoutPage';
import UserOrderListPage from './Pages/User/UserOrderListPage/UserOrderListPage';
import UserOrderDetailPage from './Pages/User/UserOrderDetailPage/UserOrderDetailPage';
 
// Thiết lập router
 
const router = createBrowserRouter([
  {
    // USER ROUTE
    path: USER_ROUTE.Home, // Home
    element: <UserMainLayout />,
 
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: USER_ROUTE.WishList,
        // Yêu cầu đăng nhập để xem danh sách yêu thích
        element: <RequireAuth requiredRole={"USER"}><WishListPage /></RequireAuth>,
      },
      {
        path: USER_ROUTE.TopProduct,
        element: <TopProductsPage />,
      },
      {
        path: USER_ROUTE.Cart,
        element: <RequireAuth requiredRole={"USER"}><CartPage/></RequireAuth>
      },
      {
        path: USER_ROUTE.Seapay,
        element: <RequireAuth requiredRole={"USER"}><PaymentPage/></RequireAuth>
      },
      {
        path: USER_ROUTE.Supermarket,
        element: <ProductListPage/>
      },
      {
        path: USER_ROUTE.DetailProduct,
        element: <ProductDetailPage/>
      },
      {
        path: USER_ROUTE.Orders,
        element: <RequireAuth requiredRole={"USER"}><UserOrderListPage /></RequireAuth>
      },
      {
        path: USER_ROUTE.OrderDetail,
        element: <RequireAuth requiredRole={"USER"}><UserOrderDetailPage /></RequireAuth>
      },
      {
        path : USER_ROUTE.Notification,
        element: <RequireAuth requiredRole={"USER"}><NotificationPage/></RequireAuth>
      },
      {
        path: USER_ROUTE.Profile,
        // Yêu cầu đăng nhập để xem/sửa profile
        element: <RequireAuth requiredRole={"USER"}><UserProfilePage/></RequireAuth>
      },
      {
        path: USER_ROUTE.ChangePassword,
        element: <RequireAuth requiredRole={"USER"}><UserChangePasswordPage/></RequireAuth>
      },
      {
        path : USER_ROUTE.Checkout,
        element: <RequireAuth requiredRole={"USER"}><CheckoutPage/></RequireAuth>
      },
      {
        path : USER_ROUTE.Chatbot,
        element : <RequireAuth requiredRole={"USER"}><ChatbotPage/></RequireAuth>
      }
    ],
  },
 
  // ADMIN ROUTE
  {
    path : ADMIN_ROUTE.Home,
    // Bọc toàn bộ layout Admin bằng RequireAuth
    element: <RequireAuth requiredRole={"ADMIN"}><AdminMainLayout/></RequireAuth>,
 
    children:[
      {
        index: true,
        element: <div></div>
      },
      {
        path: ADMIN_ROUTE.Dashboard,
        element: <AdminDashboardPage/>
      },
      {
        path: ADMIN_ROUTE.Orderlist,
        element: <OrderListPage/>
      },
      {
        path: ADMIN_ROUTE.Product,
        element: <AdminProductPage/>
      },
      {
        path: ADMIN_ROUTE.Revenue,
        element : <AdminRevenuePage/>
      },
      {
        path: ADMIN_ROUTE.Setting,
        element: <AuditLogPage/>
      },
      {
        path : ADMIN_ROUTE.Voucher,
        element : <CouponPage/>
      },
      {
        path: ADMIN_ROUTE.Topproduct,
        element : <AdminTopProductPage/>
      },
      {
        path : ADMIN_ROUTE.Notification,
        element : <AdminNotificationPage/>
      },
      {
        path: ADMIN_ROUTE.Profile,
        element: <AdminProfilePage/>
      },
      {
        path: ADMIN_ROUTE.ChangePassword,
        element: <AdminChangePasswordPage/>
      }
    ]
  },
  {
    path: ADMIN_ROUTE.Order,
    // Bọc RequireAuth vì trang này nằm ngoài AdminMainLayout
    element: <RequireAuth requiredRole={"ADMIN"}><OrderDetailPage/></RequireAuth>
  },
 
  // SELLER ROUTE
  {
    path: SELLER_ROUTE.Home,
    // Bọc toàn bộ layout Seller bằng RequireAuth
    element: <RequireAuth requiredRole={"SELLER"}><SellerMainLayout/></RequireAuth>,
 
    children:[
      {
        index: true,
        element: <div/>
      },
      {
        path: SELLER_ROUTE.Product,
        element: <SellerProductPage/>
      },
      {
        path: SELLER_ROUTE.Profile,
        element: <SellerProfilePage/>
      },
      {
        path: SELLER_ROUTE.Notification,
        element: <SellerNotificationPage/>
      },
      {
        path: SELLER_ROUTE.Dashboard,
        element: <SellerDashboardPage/>
      },
      {
        path : SELLER_ROUTE.ChangePassword,
        element : <SellerChangePasswordPage/>
      }
    ]
  },
 
  // OTHER
  {
    path: "/auth/login&register",
    element: <Navigate to="/auth/login-register" replace />,
  },
  {
    path: "/auth/login-register",
    element: <AuthPage />,
  },
  {
    path: "/404NotFound",
    element: <NotFoundPage/>
  },
]);
 
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <FloatingChatbot />
    </>
  );
}
 
export default App;
