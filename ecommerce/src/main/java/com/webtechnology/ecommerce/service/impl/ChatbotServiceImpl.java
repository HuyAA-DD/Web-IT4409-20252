package com.webtechnology.ecommerce.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webtechnology.ecommerce.entity.Category;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.ProductVariant;
import com.webtechnology.ecommerce.enums.ProductStatus;
import com.webtechnology.ecommerce.repository.CategoryRepository;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.ProductVariantRepository;
import com.webtechnology.ecommerce.service.ChatbotService;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatbotServiceImpl implements ChatbotService {

    private static final int MAX_CONTEXT_PRODUCTS = 8;
    private static final int MAX_DIRECT_PRODUCTS = 6;
    private static final Locale VIETNAM_LOCALE = Locale.forLanguageTag("vi-VN");

    private static final Set<String> STOP_WORDS = Set.of(
            "shop", "cua", "hang", "co", "khong", "ban", "san", "pham", "mat", "loai",
            "bao", "nhieu", "may", "tong", "so", "la", "gi", "nao", "nhung", "cac",
            "cho", "toi", "minh", "em", "anh", "chi", "can", "muon", "mua", "tim",
            "kiem", "ve", "tu", "van", "goi", "y", "gia", "tien", "dong", "vnd",
            "con", "ton", "kho", "duoi", "tren", "tam", "khoang", "trieu", "nghin",
            "moi", "nhat", "gan", "day", "hay", "xin", "chao", "hello", "hi");

    @Value("${spring.ai.google.genai.api-key:}")
    private String apiKey;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getResponse(String message) {
        try {
            String directAnswer = answerFromDatabase(message);
            if (directAnswer != null) {
                return directAnswer;
            }

            List<Product> relevantProducts = findRelevantProducts(message, MAX_CONTEXT_PRODUCTS);
            String prompt = buildPrompt(message, relevantProducts);

            return callGoogleAPI(prompt, message);
        } catch (Exception e) {
            log.error("Could not generate chatbot response: {}", e.getMessage(), e);
            return generateLocalFallbackResponse(message);
        }
    }

    private String answerFromDatabase(String message) {
        String normalizedMessage = normalize(message);

        if (isGreeting(normalizedMessage)) {
            return buildGreetingResponse();
        }

        if (isProductCountQuestion(normalizedMessage)) {
            return buildProductCountResponse();
        }

        if (isCategoryQuestion(normalizedMessage)) {
            return buildCategoryResponse();
        }

        if (isLatestProductQuestion(normalizedMessage)) {
            List<Product> latestProducts = productRepository.findTop8ByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE);
            return buildProductListResponse("Các sản phẩm mới nhất đang bán tại shop:", latestProducts);
        }

        if (isConcreteProductQuestion(normalizedMessage)) {
            List<Product> matches = findRelevantProducts(message, MAX_DIRECT_PRODUCTS);
            if (matches.isEmpty()) {
                return "Mình chưa tìm thấy sản phẩm phù hợp với câu hỏi này. Bạn thử nhập tên sản phẩm cụ thể hơn, ví dụ: \"áo sơ mi\", \"laptop\", \"Samsung\" nhé.";
            }

            if (isPriceQuestion(normalizedMessage)) {
                return buildProductListResponse("Mình tìm thấy giá của các sản phẩm phù hợp:", matches);
            }

            if (isStockQuestion(normalizedMessage)) {
                return buildProductListResponse("Tình trạng hàng của các sản phẩm phù hợp:", matches);
            }

            return buildProductListResponse("Shop có các sản phẩm phù hợp với câu hỏi của bạn:", matches);
        }

        return null;
    }

    private String buildPrompt(String message, List<Product> relevantProducts) {
        long activeProductCount = productRepository.countByStatus(ProductStatus.ACTIVE);
        long totalProductCount = productRepository.count();
        String categories = categoryRepository.findAll().stream()
                .map(Category::getName)
                .filter(name -> name != null && !name.isBlank())
                .limit(12)
                .collect(Collectors.joining(", "));

        String productContext = relevantProducts.isEmpty()
                ? "Không tìm thấy sản phẩm liên quan trực tiếp đến câu hỏi."
                : formatProductCatalog(relevantProducts);

        return """
                Bạn là trợ lý bán hàng AI của cửa hàng Web-IT4409.

                Dữ liệu cửa hàng:
                - Tổng sản phẩm đang bán: %d
                - Tổng sản phẩm trong hệ thống: %d
                - Danh mục hiện có: %s

                Sản phẩm liên quan đến câu hỏi:
                %s

                Quy tắc trả lời:
                - Trả lời bằng tiếng Việt, thân thiện, ngắn gọn và thực tế.
                - Chỉ dùng số lượng, giá, tồn kho và tên sản phẩm có trong dữ liệu trên.
                - Nếu dữ liệu chưa đủ, nói rõ là shop chưa có đủ thông tin để khẳng định.
                - Không bịa khuyến mãi, chính sách, giá hoặc tồn kho.

                Câu hỏi của khách: %s
                """.formatted(activeProductCount, totalProductCount,
                categories.isBlank() ? "Chưa có danh mục" : categories,
                productContext, message);
    }

    private String buildGreetingResponse() {
        long activeProductCount = productRepository.countByStatus(ProductStatus.ACTIVE);
        List<String> categoryNames = categoryRepository.findAll().stream()
                .map(Category::getName)
                .filter(name -> name != null && !name.isBlank())
                .limit(5)
                .toList();

        String categoryText = categoryNames.isEmpty()
                ? "một số danh mục sản phẩm"
                : String.join(", ", categoryNames);

        return "Xin chào! Mình là trợ lý mua sắm của Web-IT4409. Hiện shop có "
                + activeProductCount + " sản phẩm đang bán. Bạn có thể hỏi mình về sản phẩm, giá, tồn kho, danh mục như "
                + categoryText + ".";
    }

    private String buildProductCountResponse() {
        long activeProductCount = productRepository.countByStatus(ProductStatus.ACTIVE);
        long totalProductCount = productRepository.count();

        if (activeProductCount == totalProductCount) {
            return "Hiện shop có " + activeProductCount + " sản phẩm đang được bán.";
        }

        return "Hiện shop có " + activeProductCount + " sản phẩm đang được bán, trên tổng "
                + totalProductCount + " sản phẩm trong hệ thống.";
    }

    private String buildCategoryResponse() {
        List<String> categoryNames = categoryRepository.findAll().stream()
                .map(Category::getName)
                .filter(name -> name != null && !name.isBlank())
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();

        if (categoryNames.isEmpty()) {
            return "Hiện shop chưa có danh mục sản phẩm nào.";
        }

        return "Shop hiện có " + categoryNames.size() + " danh mục: " + String.join(", ", categoryNames) + ".";
    }

    private String buildProductListResponse(String intro, List<Product> products) {
        if (products == null || products.isEmpty()) {
            return "Mình chưa tìm thấy sản phẩm phù hợp trong shop.";
        }

        String productLines = products.stream()
                .limit(MAX_DIRECT_PRODUCTS)
                .map(product -> "- " + formatProductSummary(product))
                .collect(Collectors.joining("\n"));

        return intro + "\n" + productLines;
    }

    private String formatProductCatalog(List<Product> products) {
        return products.stream()
                .limit(MAX_CONTEXT_PRODUCTS)
                .map(this::formatProductSummary)
                .collect(Collectors.joining("\n"));
    }

    private String formatProductSummary(Product product) {
        ProductPriceStock priceStock = getPriceStock(product.getId());
        String category = product.getCategory() != null ? product.getCategory().getName() : "Chưa phân loại";
        String description = product.getDescription() == null || product.getDescription().isBlank()
                ? "Chưa có mô tả"
                : product.getDescription();

        return "%s | Danh mục: %s | %s | Tồn kho: %s | Mô tả: %s".formatted(
                product.getName(),
                category,
                priceStock.priceText(),
                priceStock.stockText(),
                shorten(description, 140));
    }

    private ProductPriceStock getPriceStock(UUID productId) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(productId);
        if (variants.isEmpty()) {
            return new ProductPriceStock("Chưa có giá", "Chưa có phiên bản");
        }

        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(price -> price != null)
                .min(BigDecimal::compareTo)
                .orElse(null);
        BigDecimal maxPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(price -> price != null)
                .max(BigDecimal::compareTo)
                .orElse(null);
        int totalStock = variants.stream()
                .map(ProductVariant::getStock)
                .filter(stock -> stock != null)
                .mapToInt(Integer::intValue)
                .sum();

        String priceText;
        if (minPrice == null) {
            priceText = "Chưa có giá";
        } else if (minPrice.compareTo(maxPrice) == 0) {
            priceText = "Giá: " + formatMoney(minPrice);
        } else {
            priceText = "Giá: " + formatMoney(minPrice) + " - " + formatMoney(maxPrice);
        }

        return new ProductPriceStock(priceText, totalStock + " sản phẩm");
    }

    private List<Product> findRelevantProducts(String message, int limit) {
        List<String> tokens = extractMeaningfulTokens(message);
        List<Product> activeProducts = productRepository.searchProducts(
                null, null, null, ProductStatus.ACTIVE, null, null);

        if (tokens.isEmpty()) {
            return activeProducts.stream()
                    .sorted(Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(limit)
                    .toList();
        }

        return activeProducts.stream()
                .map(product -> Map.entry(product, scoreProduct(product, tokens)))
                .filter(entry -> entry.getValue() > 0)
                .sorted(Map.Entry.<Product, Integer>comparingByValue().reversed()
                        .thenComparing(entry -> entry.getKey().getCreatedAt(), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();
    }

    private int scoreProduct(Product product, List<String> tokens) {
        String name = normalize(product.getName());
        String category = product.getCategory() == null ? "" : normalize(product.getCategory().getName());
        String description = normalize(product.getDescription());

        int score = 0;
        for (String token : tokens) {
            if (name.contains(token)) {
                score += 5;
            }
            if (category.contains(token)) {
                score += 3;
            }
            if (description.contains(token)) {
                score += 1;
            }
        }

        return score;
    }

    private List<String> extractMeaningfulTokens(String message) {
        return List.of(normalize(message).split("\\s+")).stream()
                .map(token -> token.replaceAll("[^a-z0-9]", ""))
                .filter(token -> token.length() >= 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .distinct()
                .toList();
    }

    private boolean isGreeting(String normalizedMessage) {
        return normalizedMessage.matches("^(hi|hello|xin chao|chao|alo|hey)\\b.*")
                && normalizedMessage.length() <= 30;
    }

    private boolean isProductCountQuestion(String normalizedMessage) {
        return normalizedMessage.contains("bao nhieu san pham")
                || normalizedMessage.contains("co may san pham")
                || normalizedMessage.contains("tong so san pham")
                || normalizedMessage.contains("so luong san pham")
                || normalizedMessage.contains("dem san pham");
    }

    private boolean isCategoryQuestion(String normalizedMessage) {
        boolean mentionsCategory = normalizedMessage.contains("danh muc")
                || normalizedMessage.contains("loai hang")
                || normalizedMessage.contains("nganh hang")
                || normalizedMessage.contains("category");

        return mentionsCategory && (normalizedMessage.contains("co")
                || normalizedMessage.contains("bao nhieu")
                || normalizedMessage.contains("liet ke")
                || normalizedMessage.contains("nao"));
    }

    private boolean isLatestProductQuestion(String normalizedMessage) {
        return normalizedMessage.contains("san pham moi")
                || normalizedMessage.contains("hang moi")
                || normalizedMessage.contains("moi nhat")
                || normalizedMessage.contains("gan day");
    }

    private boolean isConcreteProductQuestion(String normalizedMessage) {
        return normalizedMessage.contains("co ban")
                || normalizedMessage.contains("tim")
                || normalizedMessage.contains("kiem")
                || normalizedMessage.contains("gia")
                || normalizedMessage.contains("bao nhieu tien")
                || normalizedMessage.contains("con hang")
                || normalizedMessage.contains("ton kho")
                || normalizedMessage.contains("san pham")
                || normalizedMessage.contains("tu van")
                || normalizedMessage.contains("goi y");
    }

    private boolean isPriceQuestion(String normalizedMessage) {
        return normalizedMessage.contains("gia")
                || normalizedMessage.contains("bao nhieu tien")
                || normalizedMessage.contains("bao tien")
                || normalizedMessage.contains("cost")
                || normalizedMessage.contains("price");
    }

    private boolean isStockQuestion(String normalizedMessage) {
        return normalizedMessage.contains("con hang")
                || normalizedMessage.contains("ton kho")
                || normalizedMessage.contains("het hang")
                || normalizedMessage.contains("stock");
    }

    private String callGoogleAPI(String prompt, String originalMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is missing. Using local chatbot fallback.");
            return generateLocalFallbackResponse(originalMessage);
        }

        try {
            String requestBody = buildRequestBody(prompt);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<String> response = restTemplate.postForEntity(url, new HttpEntity<>(requestBody, headers), String.class);
            return parseResponse(response.getBody(), originalMessage);
        } catch (Exception e) {
            log.error("Error calling Google Generative AI API: {}", e.getMessage(), e);
            return generateLocalFallbackResponse(originalMessage);
        }
    }

    private String buildRequestBody(String prompt) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            ArrayNode contents = root.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new IllegalStateException("Could not build Gemini request body", e);
        }
    }

    private String parseResponse(String responseBody, String originalMessage) {
        try {
            if (responseBody == null || responseBody.isBlank()) {
                return generateLocalFallbackResponse(originalMessage);
            }

            JsonNode root = objectMapper.readTree(responseBody);
            if (root.has("error")) {
                String errorMessage = root.path("error").path("message").asText("Unknown Gemini error");
                log.error("Gemini returned error: {}", errorMessage);
                return generateLocalFallbackResponse(originalMessage);
            }

            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isTextual() && !textNode.asText().isBlank()) {
                return textNode.asText();
            }

            return generateLocalFallbackResponse(originalMessage);
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage(), e);
            return generateLocalFallbackResponse(originalMessage);
        }
    }

    private String generateLocalFallbackResponse(String message) {
        List<Product> matches = findRelevantProducts(message, 4);
        if (!matches.isEmpty() && isConcreteProductQuestion(normalize(message))) {
            return buildProductListResponse("Mình chưa gọi được AI, nhưng đã tìm trong dữ liệu shop và thấy:", matches);
        }

        long activeProductCount = productRepository.countByStatus(ProductStatus.ACTIVE);
        return "Mình có thể giúp bạn tìm sản phẩm, xem giá, tồn kho, danh mục hoặc tư vấn mua hàng. Hiện shop có "
                + activeProductCount + " sản phẩm đang bán. Bạn thử hỏi như: \"shop có bao nhiêu sản phẩm\", \"có bán laptop không\", hoặc \"giá Samsung bao nhiêu\" nhé.";
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }

        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String formatMoney(BigDecimal value) {
        return NumberFormat.getCurrencyInstance(VIETNAM_LOCALE).format(value);
    }

    private String shorten(String text, int maxLength) {
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3).trim() + "...";
    }

    private record ProductPriceStock(String priceText, String stockText) {
    }
}
