package com.webtechnology.ecommerce.config;

import com.webtechnology.ecommerce.entity.Category;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.ProductImage;
import com.webtechnology.ecommerce.entity.Role;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.enums.ProductStatus;
import com.webtechnology.ecommerce.repository.CategoryRepository;
import com.webtechnology.ecommerce.repository.ProductImageRepository;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Configuration
@Slf4j
public class DataLoader {

    @Bean
    public CommandLineRunner loadInitialData(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            ProductImageRepository productImageRepository) {

        return args -> {
            // Check if data already exists
            if (productRepository.count() > 0) {
                log.info("Sample data already exists. Skipping data load.");
                return;
            }

            log.info("Loading sample product data...");

            // 1. Create sample categories
            Category electronicsCategory = createCategory(categoryRepository, "Điện tử", "Các sản phẩm điện tử hiện đại");
            Category fashionCategory = createCategory(categoryRepository, "Thời trang", "Quần áo, giày dép, phụ kiện");
            Category homeCategory = createCategory(categoryRepository, "Gia dụng", "Đồ nội thất, đồ dùng nhà bếp");
            Category booksCategory = createCategory(categoryRepository, "Sách", "Sách giáo dục, tiểu thuyết, tham khảo");
            Category beautyCategory = createCategory(categoryRepository, "Làm đẹp", "Mỹ phẩm, dụng cụ làm đẹp");
            Category sportsCategory = createCategory(categoryRepository, "Thể thao", "Thiết bị thể thao, áo quần tập luyện");

            // 2. Create or get seller user
            User seller = getOrCreateSeller(userRepository);

            // 3. Create sample products
            List<Product> products = createSampleProducts(
                    productRepository,
                    seller,
                    electronicsCategory,
                    fashionCategory,
                    homeCategory,
                    booksCategory,
                    beautyCategory,
                    sportsCategory);

            // 4. Create product images
            createProductImages(productImageRepository, products);

            log.info("Successfully loaded {} sample products with images", products.size());
        };
    }

    private Category createCategory(CategoryRepository repository, String name, String description) {
        if (repository.existsByName(name)) {
            // If category exists, create a new one with slightly different name or just return a new one
            // For simplicity, we'll just create all categories fresh
        }
        Category category = Category.builder()
                .name(name)
                .description(description)
                .build();
        return repository.save(category);
    }

    private User getOrCreateSeller(UserRepository repository) {
        return repository.findByEmail("seller@web-it4409.com")
                .orElseGet(() -> {
                    User seller = User.builder()
                            .email("seller@web-it4409.com")
                            .password("password123") // In production, this should be hashed
                            .fullName("Web IT4409 Shop")
                            .role(Role.SELLER)
                            .build();
                    return repository.save(seller);
                });
    }

    private List<Product> createSampleProducts(
            ProductRepository productRepository,
            User seller,
            Category... categories) {

        List<Product> products = new ArrayList<>();
        String[] productData = {
                // Electronics (1-10)
                "iPhone 15 Pro,Smartphone cao cấp với chip A17 Pro mới nhất,Electronics",
                "Samsung Galaxy S24,Điện thoại flagship Samsung với màn hình AMOLED,Electronics",
                "iPad Pro 12.9,Máy tính bảng mạnh mẽ cho công việc và giải trí,Electronics",
                "MacBook Pro M3,Laptop professional cho lập trình viên và designer,Electronics",
                "Sony WH-1000XM5,Tai nghe chống ồn hàng đầu thế giới,Electronics",
                "Apple Watch Ultra,Đồng hồ thông minh chuyên dụng ngoài trời,Electronics",
                "Samsung Washing Machine,Máy giặt lồng ngang với AI Ecobubble,Electronics",
                "LG Refrigerator,Tủ lạnh thông minh tiết kiệm điện,Electronics",
                "Canon EOS R5,Máy ảnh mirrorless 8K chuyên nghiệp,Electronics",
                "DJI Mini 4 Pro,Drone gấp gọn cho người mới bắt đầu,Electronics",

                // Fashion (11-22)
                "Áo Thun Nam Cotton,Áo thun 100% cotton mềm mại và thoáng khí,Fashion",
                "Quần Jean Denim,Quần jean co giãn với design hiện đại,Fashion",
                "Áo Sơ Mi Trắng,Áo sơ mi lịch sự cho công sở,Fashion",
                "Áo Khoác Denim,Áo khoác jean unisex phong cách street style,Fashion",
                "Giày Thể Thao Nike,Giày chạy bộ với công nghệ cushioning,Fashion",
                "Giày Tây Nam,Giày tây công sở da cao cấp,Fashion",
                "Sandal Xỏ Ngón,Sandal thoáng khí cho mùa hè,Fashion",
                "Túi Xách Nữ,Túi xách da cao cấp nhiều ngăn,Fashion",
                "Mũ Lưỡi Trai,Mũ baseball thể thao,Fashion",
                "Kính Mắt Thời Trang,Kính mát chống UV UV 400,Fashion",
                "Dây Chuyền Nữ,Dây chuyền bạc tinh tế,Fashion",
                "Nhẫn Kim Cương,Nhẫn vàng với đá quý,Fashion",

                // Home (23-32)
                "Bàn Cà Phê Gỗ,Bàn cà phê hiện đại từ gỗ tự nhiên,Home",
                "Ghế Văn Phòng Ergonomic,Ghế công sở hỗ trợ lưng tốt,Home",
                "Bộ Giường Ngủ,Giường ngủ gỗ với nệm cao cấp,Home",
                "Tủ Quần Áo 2 Cánh,Tủ quần áo hiện đại với gương,Home",
                "Đèn Treo Trần,Đèn trang trí phòng khách,Home",
                "Gối Tựa Lưng,Gối tựa lưng êm ái cho ghế,Home",
                "Rèm Cửa Cao Cấp,Rèm vải đẹp che nắng tốt,Home",
                "Thảm Trang Trí,Thảm trải sàn trang trí nhà,Home",
                "Bộ Nồi Nấu Ăn,Bộ nồi nấu ăn 10 món chống dính,Home",
                "Bình Đun Nước Điện,Bình đun nước thông minh,Home",

                // Books (33-38)
                "Lập Trình Java Nâng Cao,Sách hướng dẫn lập trình Java chuyên sâu,Books",
                "Kinh Tế Nhân Văn,Sách về kinh tế học dạy cho mọi người,Books",
                "Tư Duy Nhanh và Chậm,Sách tâm lý học nổi tiếng,Books",
                "Sapiens - Lịch Sử Loài Người,Sách lịch sử từ quá khứ đến hiện tại,Books",
                "Dạy Con Biết Yêu Thương,Sách hướng dẫn nuôi dạy con,Books",
                "Tiểu Thuyết Dế Mèn Phiêu Lưu Ký,Tiểu thuyết kinh điển dành cho trẻ,Books",

                // Beauty (39-45)
                "Kem Dưỡng Mặt,Kem dưỡng ẩm cho da mặt,Beauty",
                "Mặt Nạ Dưỡng Da,Mặt nạ dưỡng da sâu,Beauty",
                "Son Môi Lì,Son môi màu đỏ tươi,Beauty",
                "Kem Chống Nắng SPF50,Kem chống nắng bảo vệ da,Beauty",
                "Nước Tẩy Trang,Nước tẩy trang làm sạch da,Beauty",
                "Xà Phòng Tắm Hữu Cơ,Xà phòng tắm từ thành phần tự nhiên,Beauty",
                "Dầu Gội Đầu,Dầu gội tóc chuyên biệt cho tóc khô,Beauty",

                // Sports (46-50)
                "Bộ Tạ Nhà,Bộ tạ điều chỉnh trọng lượng,Sports",
                "Thảm Yoga,Thảm yoga chống trượt cao su,Sports",
                "Vợt Cầu Lông,Vợt cầu lông nhôm nhẹ,Sports",
                "Bóng Đá Chính Hãng,Bóng đá da chính hãng FIFA,Sports",
                "Mũ Bảo Hiểm Xe Máy,Mũ bảo hiểm moto an toàn,Sports"
        };

        int imageIndex = 300; // Using different image sizes from picsum.photos
        Category[] categoryArray = categories;

        for (String data : productData) {
            String[] parts = data.split(",");
            String productName = parts[0];
            String description = parts[1];
            String categoryName = parts[2];

            // Find category
            Category category = null;
            for (Category cat : categoryArray) {
                if (cat.getName().contains(categoryName)) {
                    category = cat;
                    break;
                }
            }

            if (category == null) {
                category = categoryArray[0]; // Default to first category
            }

            Product product = Product.builder()
                    .name(productName)
                    .description(description)
                    .category(category)
                    .seller(seller)
                    .status(ProductStatus.ACTIVE)
                    .build();

            Product savedProduct = productRepository.save(product);
            products.add(savedProduct);
            imageIndex += 50;
        }

        return products;
    }

    private void createProductImages(ProductImageRepository repository, List<Product> products) {
        String[] imageUrls = {
                "https://picsum.photos/500/500?random=1",
                "https://picsum.photos/500/500?random=2",
                "https://picsum.photos/500/500?random=3",
                "https://picsum.photos/500/500?random=4",
                "https://picsum.photos/500/500?random=5",
                "https://picsum.photos/500/500?random=6",
                "https://picsum.photos/500/500?random=7",
                "https://picsum.photos/500/500?random=8",
                "https://picsum.photos/500/500?random=9",
                "https://picsum.photos/500/500?random=10",
                "https://picsum.photos/500/500?random=11",
                "https://picsum.photos/500/500?random=12",
                "https://picsum.photos/500/500?random=13",
                "https://picsum.photos/500/500?random=14",
                "https://picsum.photos/500/500?random=15",
                "https://picsum.photos/500/500?random=16",
                "https://picsum.photos/500/500?random=17",
                "https://picsum.photos/500/500?random=18",
                "https://picsum.photos/500/500?random=19",
                "https://picsum.photos/500/500?random=20",
                "https://picsum.photos/500/500?random=21",
                "https://picsum.photos/500/500?random=22",
                "https://picsum.photos/500/500?random=23",
                "https://picsum.photos/500/500?random=24",
                "https://picsum.photos/500/500?random=25",
                "https://picsum.photos/500/500?random=26",
                "https://picsum.photos/500/500?random=27",
                "https://picsum.photos/500/500?random=28",
                "https://picsum.photos/500/500?random=29",
                "https://picsum.photos/500/500?random=30",
                "https://picsum.photos/500/500?random=31",
                "https://picsum.photos/500/500?random=32",
                "https://picsum.photos/500/500?random=33",
                "https://picsum.photos/500/500?random=34",
                "https://picsum.photos/500/500?random=35",
                "https://picsum.photos/500/500?random=36",
                "https://picsum.photos/500/500?random=37",
                "https://picsum.photos/500/500?random=38",
                "https://picsum.photos/500/500?random=39",
                "https://picsum.photos/500/500?random=40",
                "https://picsum.photos/500/500?random=41",
                "https://picsum.photos/500/500?random=42",
                "https://picsum.photos/500/500?random=43",
                "https://picsum.photos/500/500?random=44",
                "https://picsum.photos/500/500?random=45",
                "https://picsum.photos/500/500?random=46",
                "https://picsum.photos/500/500?random=47",
                "https://picsum.photos/500/500?random=48",
                "https://picsum.photos/500/500?random=49",
                "https://picsum.photos/500/500?random=50"
        };

        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            String imageUrl = imageUrls[i % imageUrls.length];

            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .build();

            repository.save(image);
        }
    }
}
