package com.webtechnology.ecommerce.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.FileUploadResponse;
import com.webtechnology.ecommerce.service.FileUploadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','USER','SELLER')")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        FileUploadResponse response = fileUploadService.uploadImage(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<FileUploadResponse>builder()
                        .success(true)
                        .message("Image uploaded successfully")
                        .data(response)
                        .build());
    }

    @PostMapping("/video")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadVideo(
            @RequestParam("file") MultipartFile file
    ) {
        FileUploadResponse response = fileUploadService.uploadVideo(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<FileUploadResponse>builder()
                        .success(true)
                        .message("Video uploaded successfully")
                        .data(response)
                        .build());
    }
}
