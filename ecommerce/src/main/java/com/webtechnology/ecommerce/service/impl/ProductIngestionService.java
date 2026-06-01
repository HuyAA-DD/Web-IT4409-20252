package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductIngestionService {

    private final ProductRepository productRepository;
    private final VectorStore vectorStore;

    @PostConstruct
    public void init() {
        refreshIndex();
    }

    public void refreshIndex() {
        log.info("Bắt đầu quá trình Indexing sản phẩm vào AI Vector Store...");

        List<Product> products = productRepository.findAll();

        List<Document> documents = products.stream()
                .map(product -> {
                    String content = String.format(
                            "Sản phẩm: %s. Mô tả: %s. Danh mục: %s. Giá: %s",
                            product.getName(),
                            product.getDescription(),
                            product.getCategory().getName(),
                            "Liên hệ shop" // Hoặc lấy giá từ variant thấp nhất
                    );

                    Document doc = new Document(content);
                    doc.getMetadata().put("id", product.getId().toString());
                    doc.getMetadata().put("type", "PRODUCT");
                    return doc;
                })
                .collect(Collectors.toList());

        vectorStore.add(documents);
        log.info("Đã index thành công {} sản phẩm vào Vector Store.", documents.size());
    }
}

