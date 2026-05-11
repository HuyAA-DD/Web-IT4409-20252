import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import các Layouts và Pages
import MainLayout from './Pages/MainLayout/MainLayout'; // Đường dẫn tới file MainLayout của bạn
import HomePage from './Pages/Homepage/HomePage';       // Đường dẫn tới file HomePage của bạn
import AuthPage from './Pages/AuthPage/AuthPage';

// Thiết lập router
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    // Bạn có thể thêm errorElement ở đây để bắt lỗi 404
    // errorElement: <NotFoundPage />, 
    children: [
      {
        index: true, // Render HomePage mặc định khi truy cập vào "/"
        element: <HomePage />,
      },
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
  {
    path: "/auth/login&register",
    element: <AuthPage />, // Layout riêng cho trang đăng nhập/đăng ký
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;