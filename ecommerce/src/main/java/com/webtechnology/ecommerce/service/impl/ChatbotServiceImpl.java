// package com.webtechnology.ecommerce.service.impl;

// import com.webtechnology.ecommerce.service.ChatbotService;
// import org.springframework.ai.chat.client.ChatClient;
// import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
// import org.springframework.ai.vectorstore.VectorStore;
// import org.springframework.stereotype.Service;

// @Service
// public class ChatbotServiceImpl implements ChatbotService {

//     private final ChatClient chatClient;

//     public ChatbotServiceImpl(ChatClient.Builder chatClientBuilder, VectorStore vectorStore) {
//         this.chatClient = chatClientBuilder
//                 .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore)) // Kích hoạt RAG
//                 .defaultSystem("Bạn là trợ lý bán hàng chuyên nghiệp của cửa hàng Web-IT4409. " +
//                         "Hãy sử dụng thông tin sản phẩm được cung cấp để tư vấn cho khách hàng. " +
//                         "Nếu không tìm thấy sản phẩm phù hợp trong dữ liệu, hãy trả lời lịch sự rằng bạn không có thông tin đó. " +
//                         "Luôn ưu tiên tư vấn các sản phẩm có sẵn trong shop. " +
//                         "Bên cạnh đó, bạn vẫn có thể giúp khách tra cứu đơn hàng bằng hàm 'getMyRecentOrders'.")
//                 .build();
//     }

//     @Override
//     public String getResponse(String message) {
//         try {
//             return chatClient.prompt()
//                     .user(message)
//                     .functions("getMyRecentOrders", "getOrderStatus", "searchProducts")
//                     .call()
//                     .content();
//         } catch (Exception e) {
//             return "Rất tiếc, tôi đang gặp khó khăn khi truy xuất dữ liệu sản phẩm. Bạn vui lòng thử lại sau nhé!";
//         }
//     }
// }
