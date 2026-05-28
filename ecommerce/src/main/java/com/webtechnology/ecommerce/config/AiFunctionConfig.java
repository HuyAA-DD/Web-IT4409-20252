// package com.webtechnology.ecommerce.config;

// import com.webtechnology.ecommerce.dto.OrderResponse;
// import com.webtechnology.ecommerce.dto.ProductResponse;
// import com.webtechnology.ecommerce.service.OrderService;
// import com.webtechnology.ecommerce.service.ProductService;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.context.annotation.Description;

// import java.util.List;
// import java.util.UUID;
// import java.util.function.Function;

// @Configuration
// public class AiFunctionConfig {

//     @Bean
//     @Description("Tra cứu trạng thái và thông tin chi tiết của một đơn hàng dựa trên ID")
//     public Function<OrderRequest, OrderResponse> getOrderStatus(OrderService orderService) {
//         return request -> {
//             try {
//                 return orderService.getOrderById(UUID.fromString(request.orderId()));
//             } catch (Exception e) {
//                 return null;
//             }
//         };
//     }

//     @Bean
//     @Description("Tìm kiếm danh sách sản phẩm trong cửa hàng dựa trên từ khóa hoặc tên sản phẩm")
//     public Function<SearchRequest, List<ProductResponse>> searchProducts(ProductService productService) {
//         return request -> productService.searchProducts(request.query(), null, null, null, null, "createdAt", "desc");
//     }

//     @Bean
//     @Description("Tra cứu danh sách các đơn hàng gần đây của người dùng đang đăng nhập")
//     public Function<UserRequest, List<OrderResponse>> getMyRecentOrders(OrderService orderService) {
//         return request -> {
//             try {
//                 String principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
//                 UUID userId = UUID.fromString(principal);
//                 return orderService.getUserOrders(userId);
//             } catch (Exception e) {
//                 return List.of();
//             }
//         };
//     }

//     // DTOs cho Function Calling
//     public record OrderRequest(String orderId) {}
//     public record SearchRequest(String query) {}
//     public record UserRequest() {}
// }
