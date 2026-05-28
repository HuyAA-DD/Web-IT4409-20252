// package com.webtechnology.ecommerce.controller;

// import com.webtechnology.ecommerce.dto.ApiResponse;
// import com.webtechnology.ecommerce.service.ChatbotService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequestMapping("/api/v1/chatbot")
// @RequiredArgsConstructor
// public class ChatbotController {

//     private final ChatbotService chatbotService;

//     @GetMapping("/chat")
//     public ResponseEntity<ApiResponse<String>> chat(@RequestParam String message) {
//         String response = chatbotService.getResponse(message);
//         return ResponseEntity.ok(ApiResponse.<String>builder()
//                 .success(true)
//                 .message("Chatbot response retrieved")
//                 .data(response)
//                 .build());
//     }
// }
