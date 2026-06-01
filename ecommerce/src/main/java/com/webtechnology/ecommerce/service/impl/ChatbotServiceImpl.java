package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.service.ChatbotService;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.entity.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    @Value("${spring.ai.google.genai.api-key}")
    private String apiKey;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getResponse(String message) {
        try {
            // 1. Lấy tất cả sản phẩm từ database
            List<Product> allProducts = productRepository.findAll();
            String productCatalog = formatProductCatalog(allProducts);
            
            log.info("Loaded {} products for chatbot context", allProducts.size());

            // 2. Xây dựng system prompt với thông tin sản phẩm
            String systemPrompt = "Bạn là trợ lý bán hàng chuyên nghiệp của cửa hàng Web-IT4409.\n\n" +
                    "=== DANH SÁCH SẢN PHẨM CÓ SẴN ===\n" +
                    productCatalog + "\n" +
                    "=== KẾT THÚC DANH SÁCH ===\n\n" +
                    "Hướng dẫn:\n" +
                    "- Nếu khách hỏi về sản phẩm, hãy tham khảo danh sách trên\n" +
                    "- Tư vấn sản phẩm phù hợp với nhu cầu của khách\n" +
                    "- Trả lời bằng tiếng Việt, ngắn gọn và rõ ràng\n" +
                    "- Luôn lịch sự và chuyên nghiệp";

            String fullPrompt = systemPrompt + "\n\nCâu hỏi khách hàng: " + message;

            // 3. Gọi Google Generative AI API với dữ liệu sản phẩm
            return callGoogleAPI(fullPrompt, message);

        } catch (Exception e) {
            log.error("Lỗi khi gọi Google Generative AI API: " + e.getMessage(), e);
            return "Xin lỗi, tôi đang gặp khó khăn khi xử lý yêu cầu của bạn. Vui lòng thử lại sau!";
        }
    }

    /**
     * Format danh sách sản phẩm thành text dễ đọc cho AI
     */
    private String formatProductCatalog(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return "Hiện không có sản phẩm nào có sẵn.";
        }

        return products.stream()
            .map(p -> {
                String category = p.getCategory() != null ? p.getCategory().getName() : "Không xác định";
                String description = p.getDescription() != null ? p.getDescription() : "Không có mô tả";
                
                return String.format("• %s (ID: %s, Danh mục: %s, Mô tả: %s)",
                    p.getName(), p.getId(), category, description);
            })
            .collect(Collectors.joining("\n"));
    }

    /**
     * Gọi Google Generative AI API
     */
    private String callGoogleAPI(String prompt, String originalMessage) {
        try {
            // Build request body
            String requestBody = buildRequestBody(prompt);
            log.debug("Gửi yêu cầu tới Google Generative AI API");

            // Call Google API
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> httpEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, httpEntity, String.class);
            String responseBody = response.getBody();

            log.debug("Google API response status: {}", response.getStatusCode());
            
            // Parse and return response
            return parseResponse(responseBody, originalMessage);

        } catch (Exception e) {
            log.error("Lỗi khi gọi Google Generative AI API: " + e.getMessage(), e);
            // Fallback to demo mode
            return generateDemoResponse(originalMessage);
        }
    }

    /**
     * Xây dựng request body JSON
     */
    private String buildRequestBody(String prompt) {
        try {
            String json = "{"  +
                "\"contents\": [{"  +
                "\"parts\": [{"  +
                "\"text\": \"" + escapeJson(prompt) + "\""  +
                "}]"  +
                "}]"  +
                "}";
            return json;
        } catch (Exception e) {
            log.error("Error building request body: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Escape JSON string
     */
    private String escapeJson(String text) {
        return text
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    /**
     * Parse Google API response
     */
    private String parseResponse(String responseBody, String originalMessage) {
        try {
            if (responseBody == null || responseBody.isEmpty()) {
                log.warn("Empty response from API");
                return generateDemoResponse(originalMessage);
            }

            JsonNode root = objectMapper.readTree(responseBody);
            log.debug("API Response JSON: {}", root.toString());

            // Check for error in response
            if (root.has("error")) {
                JsonNode errorNode = root.get("error");
                String errorMessage = errorNode.has("message") 
                    ? errorNode.get("message").asText() 
                    : "Unknown error from API";
                log.error("API returned error: {}", errorMessage);
                log.info("Switching to demo mode due to API error");
                return generateDemoResponse(originalMessage);
            }

            // Extract text from: response.candidates[0].content.parts[0].text
            if (root.has("candidates") && root.get("candidates").isArray()) {
                JsonNode candidates = root.get("candidates");
                if (candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    if (firstCandidate.has("content") && firstCandidate.get("content").has("parts")) {
                        JsonNode parts = firstCandidate.get("content").get("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            JsonNode firstPart = parts.get(0);
                            if (firstPart.has("text")) {
                                String textResponse = firstPart.get("text").asText();
                                log.info("Successfully got AI response from Google");
                                return textResponse;
                            }
                        }
                    }
                }
            }

            log.warn("Could not parse expected structure from API response");
            return generateDemoResponse(originalMessage);

        } catch (Exception e) {
            log.error("Error parsing API response: " + e.getMessage(), e);
            return generateDemoResponse(originalMessage);
        }
    }

    /**
     * Demo mode fallback - generates intelligent responses based on keywords
     */
    private String generateDemoResponse(String message) {
        String lowerMessage = message.toLowerCase();
        log.info("Using demo mode for message: {}", message);
        
        // Recommend products based on keywords
        if (lowerMessage.contains("recommend") || lowerMessage.contains("đề xuất") || lowerMessage.contains("gợi ý")) {
            return "💡 **Sản phẩm được đề xuất cho bạn:**\n\n" +
                    "Dựa trên sự quan tâm của bạn, tôi đề xuất những sản phẩm sau:\n\n" +
                    "✨ Các sản phẩm phổ biến nhất trong cửa hàng\n" +
                    "⭐ Các sản phẩm có đánh giá cao từ khách hàng\n" +
                    "🎁 Các sản phẩm có khuyến mại đặc biệt\n\n" +
                    "Bạn hãy duyệt qua danh sách sản phẩm để tìm thứ mình thích nhé!";
        }
        // Help with product information
        else if (lowerMessage.contains("sản phẩm") || lowerMessage.contains("product") || 
                 lowerMessage.contains("giá") || lowerMessage.contains("price") ||
                 lowerMessage.contains("bao nhiêu") || lowerMessage.contains("cost")) {
            return "📦 **Thông tin sản phẩm:**\n\n" +
                    "Cửa hàng chúng tôi cung cấp nhiều loại sản phẩm đa dạng:\n\n" +
                    "👕 **Thời trang** - Áo, quần, giày dép\n" +
                    "💻 **Điện tử** - Điện thoại, laptop, phụ kiện\n" +
                    "🏠 **Gia dụng** - Đồ nội thất, đồ dùng gia đình\n" +
                    "📚 **Sách và Giáo dục** - Sách, tài liệu học tập\n\n" +
                    "Hãy nêu cụ thể loại sản phẩm bạn quan tâm để tôi giúp bạn tìm kiếm!";
        }
        // Help with orders and transactions
        else if (lowerMessage.contains("order") || lowerMessage.contains("đặt hàng") || 
                 lowerMessage.contains("mua") || lowerMessage.contains("thanh toán")) {
            return "🛒 **Hướng dẫn đặt hàng:**\n\n" +
                    "1️⃣ Chọn sản phẩm bạn muốn\n" +
                    "2️⃣ Thêm vào giỏ hàng\n" +
                    "3️⃣ Kiểm tra thông tin giao hàng\n" +
                    "4️⃣ Chọn phương thức thanh toán\n" +
                    "5️⃣ Xác nhận đơn hàng\n\n" +
                    "Nếu bạn cần trợ giúp thêm, hãy liên hệ với đội hỗ trợ khách hàng của chúng tôi!";
        }
        // Default helpful response
        else {
            return "👋 **Xin chào!**\n\n" +
                    "Tôi là trợ lý mua sắm của Web-IT4409 Shop. Tôi có thể giúp bạn:\n\n" +
                    "🔍 **Tìm kiếm sản phẩm** - Mô tả thứ bạn đang tìm\n" +
                    "💬 **Tư vấn** - Giúp bạn chọn sản phẩm phù hợp\n" +
                    "📦 **Thông tin đơn hàng** - Theo dõi đơn hàng của bạn\n" +
                    "❓ **Hỏi đáp** - Trả lời các câu hỏi về sản phẩm\n\n" +
                    "Bạn cần giúp gì không?";
        }
    }
}


