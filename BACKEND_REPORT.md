# BÁO CÁO CHI TIẾT HỆ THỐNG BACKEND - ECOMMERCE PLATFORM

## 1. TỔNG QUAN HỆ THỐNG
Hệ thống Backend được xây dựng trên nền tảng **Spring Boot 3.5.0**, tuân thủ kiến trúc **Clean Architecture** và các nguyên tắc thiết kế hướng đối tượng (SOLID). Mục tiêu của hệ thống là cung cấp một nền tảng thương mại điện tử (E-commerce) mạnh mẽ, bảo mật và có khả năng mở rộng cao, tích hợp trí tuệ nhân tạo (AI) để tối ưu hóa trải nghiệm người dùng.

## 2. KIẾN TRÚC HỆ THỐNG
Hệ thống được chia thành các lớp (Layers) rõ rệt:
- **Controller Layer:** Tiếp nhận các yêu cầu HTTP, xác thực dữ liệu đầu vào (Validation) và điều phối xử lý.
- **Service Layer:** Chứa logic nghiệp vụ (Business Logic) cốt lõi của hệ thống.
- **Repository Layer (JPA/Hibernate):** Tương tác với cơ sở dữ liệu MySQL thông qua Spring Data JPA.
- **Entity Layer:** Định nghĩa các thực thể dữ liệu (Database Models).
- **DTO Layer (Data Transfer Object):** Đảm bảo an toàn dữ liệu khi trao đổi giữa Client và Server thông qua MapStruct để chuyển đổi giữa Entity và DTO.

## 3. CÔNG NGHỆ SỬ DỤNG
- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.5.0
- **Bảo mật:** Spring Security + JSON Web Token (JWT)
- **Cơ sở dữ liệu:** MySQL (Production), H2 (Testing)
- **Lưu trữ tệp:** Cloudinary API (Dùng cho hình ảnh sản phẩm, avatar)
- **AI:** Spring AI (Tích hợp Google Gemini AI)
- **Thanh toán:** SePay Webhook Integration (Tự động xác nhận chuyển khoản)
- **Công cụ bổ trợ:** Lombok, MapStruct, Spring Boot Actuator, Dotenv.

## 4. DANH SÁCH CÁC MODULE VÀ CHỨC NĂNG CHI TIẾT

### 4.1. Hệ thống Xác thực và Phân quyền (Auth & Security)
- **Đăng ký/Đăng nhập:** Hỗ trợ đăng ký tài khoản mới với các vai trò (User, Seller).
- **JWT Authentication:** Cơ chế xác thực không trạng thái (Stateless) sử dụng Access Token.
- **Role-based Access Control (RBAC):** 
    - `ROLE_USER`: Người mua hàng cơ bản.
    - `ROLE_SELLER`: Người bán hàng, có quyền quản lý kho hàng.
    - `ROLE_ADMIN`: Quản trị viên hệ thống, có quyền kiểm soát toàn bộ.
- **Quản lý mật khẩu:** Mã hóa mật khẩu bằng BCrypt, hỗ trợ chức năng đổi mật khẩu an toàn.

### 4.2. Quản lý Người dùng (User Management)
- **Profile:** Xem và cập nhật thông tin cá nhân.
- **Avatar:** Tải lên và cập nhật ảnh đại diện thông qua Cloudinary.
- **Address Book:** Quản lý danh sách địa chỉ nhận hàng (Thêm, sửa, xóa, đặt làm mặc định).
- **Admin Control:** Admin có thể liệt kê, xem chi tiết và xóa người dùng vi phạm.

### 4.3. Quản lý Sản phẩm và Danh mục (Product & Category)
- **Product Lifecycle:** Thêm, sửa, xóa sản phẩm. Hỗ trợ trạng thái sản phẩm (DRAFT, PUBLISHED, OUT_OF_STOCK).
- **Product Variants:** Quản lý các biến thể sản phẩm (Kích thước, màu sắc, giá riêng biệt, số lượng kho).
- **Image Management:** Tải lên nhiều hình ảnh cho một sản phẩm, hỗ trợ xóa hình ảnh cụ thể.
- **Search & Filter:** Tìm kiếm sản phẩm theo từ khóa, lọc theo danh mục, giá cả, người bán và sắp xếp linh hoạt.
- **Category:** Quản lý danh mục sản phẩm theo phân cấp.

### 4.4. Hệ thống Giỏ hàng và Yêu thích (Cart & Wishlist)
- **Cart:** Thêm/cập nhật số lượng sản phẩm trong giỏ hàng, tính toán tổng tiền thời gian thực.
- **Wishlist:** Lưu trữ các sản phẩm yêu thích để xem lại sau.

### 4.5. Quy trình Đặt hàng và Hóa đơn (Order & Invoice)
- **Checkout Workflow:** Quy trình đặt hàng từ giỏ hàng, áp dụng mã giảm giá và tính phí.
- **Order Tracking:** Theo dõi trạng thái đơn hàng (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED).
- **Invoice Generation:** Tự động tạo hóa đơn chi tiết sau khi đơn hàng được tạo.
- **Seller Management:** Seller có thể xem các đơn hàng thuộc sản phẩm của mình và quản lý trạng thái.

### 4.6. Tích hợp Thanh toán Tự động (Payment Integration)
- **SePay Integration:** Tích hợp cổng thanh toán SePay thông qua cơ chế Webhook.
- **Tự động xác nhận:** Hệ thống tự động nhận tín hiệu từ ngân hàng (qua SePay), kiểm tra mã đơn hàng và số tiền, sau đó cập nhật trạng thái "Đã thanh toán" (PAID) mà không cần can thiệp thủ công.
- **Lịch sử giao dịch:** Lưu trữ chi tiết các giao dịch thanh toán để đối soát.

### 4.7. Hệ thống Khuyến mãi (Coupon System)
- **Quản lý Coupon:** Tạo mã giảm giá theo phần trăm hoặc số tiền cố định.
- **Validation:** Kiểm tra hạn sử dụng, số lần sử dụng tối đa và giá trị đơn hàng tối thiểu.
- **Coupon Usage:** Theo dõi lịch sử sử dụng coupon của người dùng.

### 4.8. Đánh giá và Phản hồi (Review System)
- **Rating:** Người dùng có thể đánh giá sản phẩm theo thang điểm 1-5 sao.
- **Comment:** Gửi nhận xét chi tiết kèm hình ảnh sản phẩm.

### 4.9. Trí tuệ nhân tạo (AI Chatbot)
- **Gemini AI:** Tích hợp AI Chatbot để hỗ trợ người dùng tìm kiếm sản phẩm, giải đáp thắc mắc về đơn hàng và tư vấn mua sắm dựa trên dữ liệu thời gian thực.

### 4.10. Thông báo và Nhật ký hệ thống (Notification & Audit Log)
- **Notifications:** Gửi thông báo cho người dùng về trạng thái đơn hàng, khuyến mãi mới hoặc tin nhắn hệ thống.
- **Audit Logs:** Ghi lại các hành động quan trọng của Admin và người dùng (Đăng nhập, thay đổi cấu hình, giao dịch quan trọng) để phục vụ mục đích bảo mật và kiểm tra.

### 4.11. Quản trị và Báo cáo (Admin Dashboard)
- **Thống kê tổng quan:** Tổng doanh thu, số lượng đơn hàng, số lượng người dùng mới.
- **Báo cáo doanh thu:** Phân tích doanh thu theo năm, quý, tháng.
- **Top Products:** Danh sách các sản phẩm bán chạy nhất.
- **System Monitoring:** Kiểm tra sức khỏe hệ thống qua Spring Boot Actuator.

## 5. CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)
Hệ thống sử dụng khoảng 20 bảng cơ sở dữ liệu chính, bao gồm:
- `users`, `roles`: Lưu trữ thông tin định danh.
- `products`, `product_variants`, `product_images`: Dữ liệu kho hàng.
- `categories`: Phân loại sản phẩm.
- `orders`, `order_items`, `invoices`: Dữ liệu kinh doanh.
- `payments`: Dữ liệu thanh toán.
- `coupons`, `coupon_usages`: Dữ liệu khuyến mãi.
- `reviews`: Dữ liệu tương tác người dùng.
- `notifications`, `audit_logs`: Dữ liệu vận hành.

## 6. ĐIỂM MẠNH CỦA HỆ THỐNG
1. **Tính Bảo mật cao:** Sử dụng JWT và phân quyền chặt chẽ đến từng Endpoint.
2. **Hiệu năng:** Tối ưu hóa truy vấn JPA và cấu trúc DTO linh hoạt.
3. **Trải nghiệm người dùng:** Tích hợp AI và thanh toán tự động giúp quy trình mua hàng mượt mà.
4. **Khả năng mở rộng:** Kiến trúc tách biệt giúp dễ dàng thêm mới các module như vận chuyển (Shipping API) hay các cổng thanh toán khác (VNPAY, Momo).
5. **Vận hành chuyên nghiệp:** Hệ thống Audit Log và Dashboard giúp quản trị viên nắm bắt tình hình hệ thống tức thì.

---
*Báo cáo được thực hiện bởi Hệ thống Gemini CLI - 2026*
