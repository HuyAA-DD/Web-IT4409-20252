import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import các Layouts và Pages
import UserMainLayout from './Layouts/UserMainLayout/UserMainLayout'; // Đường dẫn tới file MainLayout của bạn
import HomePage from './Pages/User/Homepage/HomePage';       // Đường dẫn tới file HomePage của bạn
import AuthPage from './Pages/AuthPage/AuthPage';
import WishListPage from './Pages/User/WishListPage/WishListPage'; // Đường dẫn tới file WishListPage của bạn
import TopProductsPage from './Pages/User/TopProductsPage/TopProductsPage';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import CartPage from './Pages/User/CartPage/CartPage';

//Import cac Route
import USER_ROUTE from './Routes/User.routes';
import ADMIN_ROUTE from './Routes/Admin.routes';
import SELLER_ROUTE from './Routes/Seller.routes';

import ProductDetailPage from './Pages/User/ProductDetailPage/ProductDetailPage';
import AdminMainLayout from './Layouts/AdminMainLayout/AdminMainLayout';
import OrderPage from './Pages/Admin/OrderDetailPage/OrderDetailPage';
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
import SellerRevenuePage from './Pages/Seller/SellerRevenuePage/SellerRevenuePage';
import SellerProductPage from './Pages/Seller/SellerProductPage/SellerProductPage';
import UserProfilePage from './Pages/User/UserProfilePage/UserProfilePage';

// Thiết lập router
const router = createBrowserRouter([
  {
    // USER ROUTE
    path: USER_ROUTE.Home, // Home
    element: <UserMainLayout />,

    children: [
      {
        index: true, // Render HomePage mặc định khi truy cập vào "/"
        element: <HomePage />, // day la Home
      },
      {
        path: USER_ROUTE.WishList,
        element: <WishListPage />,
      },
      {
        path:USER_ROUTE.TopProduct,
        element: <TopProductsPage />,
      },
      {
        path: USER_ROUTE.Cart, // sau có thể là '/card/:id'
        element: <CartPage/>

      },
      {
        path: USER_ROUTE.Discover,
        element : <NotFoundPage/>
      },
      {
        path: USER_ROUTE.Seapay,
        element: <NotFoundPage/>
      },
      {
        path: USER_ROUTE.Supermarket,
        element: <ProductListPage/>
      },
      {
        path: USER_ROUTE.DetailProduct, // Cái này sau track theo Params với useParams
        element: <ProductDetailPage/>
      },
      {
        path : USER_ROUTE.Notification,
        element: <NotificationPage/>
      },
      {
        path: USER_ROUTE.Profile,
        element: <UserProfilePage/>
      }

      // [TODO] Sau này bạn có thể thêm các trang khác vào đây:
      // {
      //   path: "product/:id",
      //   element: <ProductDetailPage />,
      // },
      // {
      //   path: "cart",
      //   element: <CartPage />,
      // },
      // {
      //   path: "profile",
      //   element: <ProfilePage />,
      // },
    ],
  },

  // ADMIN ROUTE
  {
    path : ADMIN_ROUTE.Home,
    element: <AdminMainLayout/>,

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
    element: <OrderDetailPage/>
  },
  // SELLER ROUTE
  {
    path: SELLER_ROUTE.Home,
    element: <SellerMainLayout/>,

    children:[
      {
        index: true,
        element: <div/>
      },
      {
        path : SELLER_ROUTE.Revenue,
        element: <SellerRevenuePage/>
      },
      {
        path: SELLER_ROUTE.Product,
        element: <SellerProductPage/>
      }
    ]
      

  },


  //OTHER
  {
    path: "/auth/login&register",
    element: <AuthPage />, // Layout riêng cho trang đăng nhập/đăng ký
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