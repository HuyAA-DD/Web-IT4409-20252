# BÁO CÁO CHI TIẾT TRIỂN KHAI HỆ THỐNG AI CHATBOT THƯƠNG MẠI ĐIỆN TỬ

**Dự án:** Web-IT4409-20252 (Hệ thống E-commerce)
**Tính năng:** Trợ lý ảo AI Chatbot (Tư vấn sản phẩm & Tra cứu đơn hàng)

---

## 1. Công nghệ và Kiến trúc sử dụng
*   **Ngôn ngữ & Framework chính:** Java 17, Spring Boot 3.5.0.
*   **AI Framework:** Spring AI (Phiên bản `1.0.0-M5` - Quản lý qua Spring AI BOM).
*   **Mô hình ngôn ngữ (LLM):** Google Gemini (thông qua `spring-ai-vertex-ai-gemini-spring-boot-starter`).
*   **Kiến trúc AI:**
    *   **RAG (Retrieval-Augmented Generation):** Nạp dữ liệu sản phẩm từ MySQL vào không gian Vector để AI tìm kiếm theo ngữ nghĩa.
    *   **Vector Database:** `SimpleVectorStore` (Vector DB trên RAM tĩnh do MySQL chưa hỗ trợ kiểu dữ liệu Vector).
    *   **Function Calling (Tool Calling):** Cho phép AI tự động kích hoạt các phương thức Java (lấy danh sách đơn hàng, xem trạng thái) để trả lời truy vấn động.

---

## 2. Các bước thực hiện chi tiết

### Bước 1: Cấu hình Môi trường và Thư viện (Dependencies)
**File xử lý:** `pom.xml`, `application.properties`

*   **Vấn đề:** Ban đầu gặp lỗi không tìm thấy artifact `spring-ai-google-genai-starter` do sự thay đổi tên cấu trúc thư viện trong các bản cập nhật Milestone của Spring AI.
*   **Cách giải quyết:** 
    *   Thêm `spring-ai-bom` bản `1.0.0-M5` vào `<dependencyManagement>` để tự động đồng bộ phiên bản các thư viện con.
    *   Sử dụng dependency chuẩn: `spring-ai-vertex-ai-gemini-spring-boot-starter`.
*   **Cấu hình API Key:** Khai báo biến `spring.ai.google.genai.api-key=${GEMINI_API_KEY}` trong `application.properties` để xác thực với Google AI Studio.

### Bước 2: Thiết lập Endpoint và Tầng Bảo mật
**File xử lý:** `SecurityConfig.java`, `ChatbotController.java`

*   **Tạo Controller:** Xây dựng `ChatbotController` với endpoint `GET /api/v1/chatbot/chat?message={text}` để nhận câu hỏi từ giao diện.
*   **Cấu hình Security:** Cập nhật `SecurityConfig` thêm `.requestMatchers("/api/v1/chatbot/**").permitAll()` nhằm cho phép mọi đối tượng khách hàng (kể cả chưa đăng nhập) đều có thể chat với hệ thống để được tư vấn sản phẩm.

### Bước 3: Khởi tạo Cấu trúc Service chuẩn hóa
**File xử lý:** `ChatbotService.java`, `ChatbotServiceImpl.java`

*   Tuân thủ nguyên tắc thiết kế của dự án, tôi đã refactor đoạn code AI thành kiến trúc Interface - Implementation.
*   **Khởi tạo `ChatClient`:** Khởi tạo đối tượng `ChatClient` thông qua `ChatClient.Builder`. Thiết lập `defaultSystem` (System Prompt) để định hướng "tính cách" cho AI: *Là trợ lý ảo của Web-IT4409, trả lời thân thiện, ưu tiên tiếng Việt.*

### Bước 4: Tích hợp Function Calling (Khắc phục hạn chế UX)
**File xử lý:** `AiFunctionConfig.java`, `ChatbotServiceImpl.java`

*   **Vấn đề:** Để tra cứu đơn hàng, nếu bắt khách hàng nhập UUID (chuỗi 36 ký tự) là trải nghiệm (UX) cực kỳ tệ.
*   **Cách giải quyết:** Áp dụng **Function Calling**. 
    *   Tạo file `AiFunctionConfig.java` chứa các `@Bean` kiểu `Function<Request, Response>` và dùng annotation `@Description` để "dạy" cho AI biết khi nào nên gọi hàm này.
    *   **Các hàm đã tạo:**
        1.  `getMyRecentOrders`: Lấy User ID từ Security Context (phiên đăng nhập hiện tại) để lấy danh sách các đơn hàng của họ (Không cần bắt khách nhập mã).
        2.  `getOrderStatus`: Lấy chi tiết tiến độ của một đơn hàng cụ thể.
        3.  `searchProducts`: Tìm kiếm sản phẩm theo keyword cơ bản.
    *   **Tích hợp:** Trong `ChatbotServiceImpl`, sử dụng `.functions("getMyRecentOrders", "getOrderStatus", "searchProducts")` để đăng ký các "kỹ năng" này vào não bộ của AI.

### Bước 5: Triển khai Kiến trúc RAG (Retrieval-Augmented Generation)
**File xử lý:** `AiConfig.java`, `ProductIngestionService.java`, `ChatbotServiceImpl.java`

*   **Vấn đề:** Mô hình Gemini không biết gì về cơ sở dữ liệu nội bộ của cửa hàng (các sản phẩm đang bán, giá cả, mô tả).
*   **Cách giải quyết:** 
    1.  **Cấu hình Vector Store (`AiConfig.java`):** Khởi tạo Bean `SimpleVectorStore` bằng Builder Pattern (`SimpleVectorStore.builder(embeddingModel).build()`). Đây là kho lưu trữ Vector nội bộ trên RAM.
    2.  **Nạp dữ liệu (Indexing) (`ProductIngestionService.java`):**
        *   Tạo một Service với `@PostConstruct`. Khi Server Spring Boot vừa khởi động, nó tự động query toàn bộ bảng `products` từ MySQL.
        *   Đóng gói thông tin mỗi sản phẩm thành chuỗi text (Tên + Mô tả + Danh mục) và chuyển đổi thành đối tượng `Document` của Spring AI.
        *   Lưu các `Document` này vào `VectorStore` (dữ liệu text tự động được biến đổi thành tọa độ số học qua Embedding Model).
    3.  **Gắn não bộ RAG vào Chatbot (`ChatbotServiceImpl.java`):**
        *   Thêm `QuestionAnswerAdvisor(vectorStore)` vào `ChatClient.Builder`. 
        *   *Luồng hoạt động:* Khi khách hỏi "Tư vấn áo sơ mi", hệ thống tự lấy câu hỏi đi tính toán vector, tìm ra 3 chiếc áo sơ mi sát nghĩa nhất trong RAM, trộn 3 chiếc áo đó vào Prompt và gửi cho Gemini. Gemini sẽ đọc thông tin đó để trả lời khách một cách chính xác tuyệt đối.

### Bước 6: Sửa lỗi và Tối ưu hóa Codebase
*   **Lỗi cú pháp:** Xử lý triệt để các cảnh báo *Type Safety* và lỗi *Syntax Error* trong hệ thống do việc cập nhật thư viện qua nhiều giai đoạn.
*   **Xử lý Ngoại lệ:** Thêm khối `try-catch` vào `ChatbotServiceImpl` để nếu API của Google bị quá tải hoặc lỗi mạng, hệ thống sẽ trả về câu xin lỗi tiếng Việt thân thiện thay vì crash Server.

---

## 3. Kết quả luồng trải nghiệm (User Flow)
Sau khi áp dụng toàn bộ các kỹ thuật chuyên sâu trên, luồng chat diễn ra như sau:

1.  **Người dùng:** "Đơn hàng của tôi bao giờ giao tới?"
2.  **AI (Ngầm):** Phân tích ý định -> Nhận diện khách muốn tra đơn -> Gọi hàm `getMyRecentOrders` -> Nhận về list 2 đơn hàng.
3.  **AI:** "Tôi thấy bạn có 2 đơn hàng gần đây (Đơn 500k ngày 20/05 và Đơn 1tr ngày 24/05). Bạn muốn kiểm tra đơn nào ạ?"
4.  **Người dùng:** "Cái đơn 500k ấy"
5.  **AI (Ngầm):** Map câu "đơn 500k" với ID của đơn số 1 -> Gọi hàm `getOrderStatus` -> Nhận dữ liệu DB.
6.  **AI:** "Đơn hàng 500k của bạn hiện đang ở trạng thái Đang Vận Chuyển, dự kiến giao trong ngày mai nhé!"
