import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import các Layouts và Pages
import UserMainLayout from './Layouts/UserMainLayout/UserMainLayout'; 
import HomePage from './Pages/User/Homepage/HomePage';       
import AuthPage from './Pages/AuthPage/AuthPage';
import WishListPage from './Pages/User/WishListPage/WishListPage'; 
import TopProductsPage from './Pages/User/TopProductsPage/TopProductsPage';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import CartPage from './Pages/User/CartPage/CartPage';

//Import cac Route
import USER_ROUTE from './Routes/User.routes';
import ADMIN_ROUTE from './Routes/Admin.routes';
import SELLER_ROUTE from './Routes/Seller.routes';

import ProductDetailPage from './Pages/User/ProductDetailPage/ProductDetailPage';
import AdminMainLayout from './Layouts/AdminMainLayout/AdminMainLayout';
import OrderListPage from './Pages/Admin/OrderListPage/OrderListPage';
import OrderDetailPage from './Pages/Admin/OrderDetailPage/OrderDetailPage';
import AuditLogPage from './Pages/Admin/AuditLogPage/AuditLogPage';
import DashboardPage from './Pages/Admin/DashboardPage/DashboardPage';
import CouponPage from './Pages/Admin/CouponPage/CouponPage';
import AdminRevenuePage from './Pages/Admin/AdminRevenuePage/AdminRevenuePage';
import AdminTopProductPage from './Pages/Admin/AdminTopProductPage/AdminTopProductPage';
import AdminNotificationPage from './Pages/Admin/AdminNotificationPage/AdminNotificationPage';
import NotificationPage from './Pages/User/NotificationPage/NotificationPage';
import AdminProductPage from "./Pages/Admin/AdminProductPage/AdminProductPage";
import ProductListPage from './Pages/User/ProductListPage/ProductListPage';
import SellerMainLayout from './Layouts/SellerMainLayout/SellerMainLayout';
import SellerPage from './Pages/Seller/SellerPage';
import SellerRevenuePage from './Pages/Seller/SellerRevenuePage/SellerRevenuePage';
import SellerProductPage from './Pages/Seller/SellerProductPage/SellerProductPage';
import SellerSettingPage from './Pages/Seller/SellerSettingPage';
import SellerNotificationPage from './Pages/Seller/SellerNotificationPage';
import UserProfilePage from './Pages/User/UserProfilePage/UserProfilePage';
import PaymentPage from './Pages/User/PaymentPage/PaymentPage';

import RequireAuth from './Components/RequireAuth';

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
        element: <RequireAuth><WishListPage /></RequireAuth>, 
      },
      {
        path: USER_ROUTE.TopProduct,
        element: <TopProductsPage />,
      },
      {
        path: USER_ROUTE.Cart, 
        element: <RequireAuth><CartPage/></RequireAuth>
      },
      {
        path: USER_ROUTE.Seapay,
        element: <RequireAuth><PaymentPage/></RequireAuth>
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
        path : USER_ROUTE.Notification,
        element: <RequireAuth><NotificationPage/></RequireAuth>
      },
      {
        path: USER_ROUTE.Profile,
        // Yêu cầu đăng nhập để xem/sửa profile
        element: <RequireAuth><UserProfilePage/></RequireAuth> 
      }
    ],
  },

  // ADMIN ROUTE
  {
    path : ADMIN_ROUTE.Home,
    // Bọc toàn bộ layout Admin bằng RequireAuth
    element: <RequireAuth><AdminMainLayout/></RequireAuth>, 

    children:[
      {
        index: true,
        element: <div></div>
      },
      {
        path: ADMIN_ROUTE.Dashboard,
        element: <DashboardPage/>
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
      }
    ]
  },
  {
    path: ADMIN_ROUTE.Order,
    // Bọc RequireAuth vì trang này nằm ngoài AdminMainLayout
    element: <RequireAuth><OrderDetailPage/></RequireAuth> 
  },
  
  // SELLER ROUTE
  {
    path: SELLER_ROUTE.Home,
    // Bọc toàn bộ layout Seller bằng RequireAuth
    element: <RequireAuth><SellerMainLayout/></RequireAuth>, 

    children:[
      {
        index: true,
        element: <SellerPage />
      },
      {
        path : SELLER_ROUTE.Revenue,
        element: <SellerRevenuePage/>
      },
      {
        path: SELLER_ROUTE.Product,
        element: <SellerProductPage/>
      },
      {
        path: SELLER_ROUTE.Setting,
        element: <SellerSettingPage/>
      },
      {
        path: SELLER_ROUTE.Notification,
        element: <SellerNotificationPage/>
      }
    ]
  },

  // OTHER
  {
    path: "/auth/login&register",
    element: <AuthPage />, 
  },
  {
    path: "/404NotFound",
    element: <NotFoundPage/>
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;