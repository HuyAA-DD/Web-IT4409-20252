Dưới đây là phiên bản Markdown đơn giản, truyền thống hơn, dễ copy vào README hoặc báo cáo:

---

# Frontend Roadmap – 1 Month (E-commerce Project)

## Mục tiêu

Xây dựng frontend cho web bán hàng với các chức năng cơ bản:

* Đăng nhập / đăng ký
* Xem sản phẩm
* Giỏ hàng
* Đặt hàng

---

# Week 1 – Setup và giao diện cơ bản

## Setup project

* Khởi tạo project React (Vite)
* Cài đặt thư viện cần thiết (react-router-dom, axios)
* Tạo cấu trúc thư mục:

  * components
  * pages
  * layouts
  * services
  * routes

## Cấu trúc ứng dụng

* Thiết lập routing
* Tạo layout chung (header, footer, navbar)

## Giao diện (chưa cần API)

* Trang Home
* Trang danh sách sản phẩm
* Trang chi tiết sản phẩm
* Trang đăng nhập / đăng ký
* Component product card

## API chuẩn bị

* Tạo file gọi API (axios)
* Thiết lập base URL
* Thống nhất API với backend

## Kết quả tuần 1

* Ứng dụng chạy được
* Có giao diện cơ bản
* Dùng mock data để hiển thị

---

# Week 2 – Auth và sản phẩm

## Authentication

* Gọi API login, register
* Lưu token
* Tạo protected route

## Product

* Gọi API danh sách sản phẩm
* Gọi API chi tiết sản phẩm
* Hiển thị dữ liệu thật

## Search và filter

* Tìm kiếm sản phẩm
* Lọc theo giá hoặc danh mục

## Xử lý lỗi

* Loading
* Hiển thị lỗi khi API fail

## Kết quả tuần 2

* Đăng nhập hoạt động
* Hiển thị sản phẩm từ backend

---

# Week 3 – Giỏ hàng và đặt hàng

## Cart

* Thêm sản phẩm vào giỏ
* Hiển thị giỏ hàng
* Cập nhật số lượng
* Xóa sản phẩm

## Order

* Tạo đơn hàng
* Trang checkout
* Nhập địa chỉ
* Xác nhận đơn

## User

* Trang thông tin cá nhân
* Lịch sử đơn hàng

## State

* Quản lý state user và cart
* Đồng bộ với backend

## Kết quả tuần 3

* Hoàn thành luồng mua hàng cơ bản

---

# Week 4 – Hoàn thiện và deploy

## Giao diện

* Responsive cơ bản
* Cải thiện layout

## Tính năng bổ sung (nếu có)

* Đánh giá sản phẩm
* Phân trang

## Hoàn thiện

* Sửa lỗi
* Dọn dẹp code

## Deploy

* Build project
* Deploy lên Vercel hoặc Netlify

## Documentation

* Viết README
* Hướng dẫn chạy project

## Kết quả cuối

* Web hoạt động ổn định
* Có đầy đủ chức năng chính

---

# Ghi chú

## Thứ tự ưu tiên

1. Auth
2. Product
3. Cart
4. Order

## Không nên làm sớm

* Animation phức tạp
* Các tính năng nâng cao

---

# Tổng kết

Sau 1 tháng, cần đạt được:

* Web bán hàng hoàn chỉnh
* Có thể đăng nhập, xem sản phẩm, mua hàng
* Code rõ ràng, dễ hiểu
* Có thể deploy và demo

---

