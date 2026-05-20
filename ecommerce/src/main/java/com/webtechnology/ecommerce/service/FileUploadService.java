package com.webtechnology.ecommerce.service;

import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.FileUploadResponse;

public interface FileUploadService {

    FileUploadResponse uploadImage(MultipartFile file);

    FileUploadResponse uploadVideo(MultipartFile file);

    void deleteFile(String publicId);
}
