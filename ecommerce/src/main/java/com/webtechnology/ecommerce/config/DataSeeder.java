package com.webtechnology.ecommerce.config;

import com.webtechnology.ecommerce.entity.Category;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.ProductImage;
import com.webtechnology.ecommerce.entity.ProductVariant;
import com.webtechnology.ecommerce.entity.Role;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.enums.ProductStatus;
import com.webtechnology.ecommerce.repository.CategoryRepository;
import com.webtechnology.ecommerce.repository.ProductImageRepository;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.ProductVariantRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            System.out.println("Seed skipped: products already exist.");
            return;
        }

        User seller = userRepository.findByEmail("seller@megamart.com")
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email("seller@megamart.com")
                                .password(passwordEncoder.encode("12345678"))
                                .fullName("MegaMart Seller")
                                .role(Role.SELLER)
                                .avatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80")
                                .build()
                ));

        Category electronics = createCategoryIfNotExists(
                "Điện tử",
                "Các sản phẩm công nghệ, thiết bị điện tử và phụ kiện."
        );

        Category fashion = createCategoryIfNotExists(
                "Thời trang",
                "Quần áo, túi xách, giày dép và phụ kiện thời trang."
        );

        Category home = createCategoryIfNotExists(
                "Nhà cửa",
                "Đồ gia dụng, trang trí và sản phẩm tiện ích cho gia đình."
        );

        Category grocery = createCategoryIfNotExists(
                "Siêu thị",
                "Thực phẩm, đồ dùng hằng ngày và sản phẩm tiêu dùng nhanh."
        );

        seedProduct(
                "Tai nghe Bluetooth MegaSound Air",
                "Tai nghe không dây thiết kế nhỏ gọn, âm thanh rõ ràng, phù hợp học tập, làm việc và giải trí.",
                electronics,
                seller,
                "MS-AIR-001",
                new BigDecimal("450000"),
                35,
                Map.<String, Object>of("color", "Trắng", "connection", "Bluetooth"),
                List.of(
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
                )
        );

        seedProduct(
                "Bàn phím cơ Mini RGB",
                "Bàn phím cơ layout nhỏ gọn, đèn RGB, cảm giác gõ tốt cho học tập và làm việc.",
                electronics,
                seller,
                "KB-MINI-RGB-001",
                new BigDecimal("690000"),
                20,
                Map.<String, Object>of("switch", "Blue Switch", "layout", "75%"),
                List.of(
                        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"
                )
        );

        seedProduct(
                "Áo thun Basic Cotton",
                "Áo thun cotton mềm, form rộng dễ mặc, phù hợp đi học, đi chơi và mặc hằng ngày.",
                fashion,
                seller,
                "TSHIRT-BASIC-001",
                new BigDecimal("159000"),
                80,
                Map.<String, Object>of("size", "M", "color", "Trắng"),
                List.of(
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
                )
        );

        seedProduct(
                "Áo khoác Hoodie Unisex",
                "Hoodie nỉ dày vừa phải, phong cách trẻ trung, dễ phối đồ.",
                fashion,
                seller,
                "HOODIE-UNI-001",
                new BigDecimal("299000"),
                45,
                Map.<String, Object>of("size", "L", "color", "Xám"),
                List.of(
                        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80"
                )
        );

        seedProduct(
                "Đèn bàn học LED chống cận",
                "Đèn LED để bàn có nhiều mức sáng, phù hợp học tập và làm việc buổi tối.",
                home,
                seller,
                "LED-DESK-001",
                new BigDecimal("249000"),
                30,
                Map.<String, Object>of("power", "USB", "mode", "3 mức sáng"),
                List.of(
                        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
                )
        );

        seedProduct(
                "Bình giữ nhiệt inox 500ml",
                "Bình giữ nhiệt tiện dụng, giữ nóng và lạnh tốt, phù hợp mang đi học hoặc đi làm.",
                home,
                seller,
                "BOTTLE-500-001",
                new BigDecimal("189000"),
                60,
                Map.<String, Object>of("capacity", "500ml", "material", "Inox"),
                List.of(
                        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80"
                )
        );

        seedProduct(
                "Combo trái cây tươi mỗi ngày",
                "Combo trái cây tươi gồm nhiều loại hoa quả phổ biến, phù hợp dùng trong ngày.",
                grocery,
                seller,
                "FRUIT-COMBO-001",
                new BigDecimal("99000"),
                25,
                Map.<String, Object>of("weight", "1kg", "type", "mixed"),
                List.of(
                        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80"
                )
        );

        seedProduct(
                "Cà phê rang xay nguyên chất",
                "Cà phê rang xay hương thơm đậm, phù hợp pha phin hoặc pha máy.",
                grocery,
                seller,
                "COFFEE-250-001",
                new BigDecimal("129000"),
                40,
                Map.<String, Object>of("weight", "250g", "origin", "Việt Nam"),
                List.of(
                        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80"
                )
        );

        System.out.println("Seed completed: demo categories and products inserted.");
    }

    private Category createCategoryIfNotExists(String name, String description) {
        return categoryRepository.findAll()
                .stream()
                .filter(category -> category.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(
                        Category.builder()
                                .name(name)
                                .description(description)
                                .build()
                ));
    }

    private void seedProduct(
            String name,
            String description,
            Category category,
            User seller,
            String sku,
            BigDecimal price,
            Integer stock,
            Map<String, Object> attributes,
            List<String> imageUrls
    ) {
        Product product = Product.builder()
                .name(name)
                .description(description)
                .category(category)
                .seller(seller)
                .status(ProductStatus.ACTIVE)
                .deleted(false)
                .build();

        Product savedProduct = productRepository.save(product);

        ProductVariant variant = ProductVariant.builder()
                .product(savedProduct)
                .sku(sku)
                .price(price)
                .stock(stock)
                .attributes(attributes)
                .deleted(false)
                .build();

        productVariantRepository.save(variant);

        for (String imageUrl : imageUrls) {
            ProductImage image = ProductImage.builder()
                    .product(savedProduct)
                    .imageUrl(imageUrl)
                    .deleted(false)
                    .build();

            productImageRepository.save(image);
        }
    }
}