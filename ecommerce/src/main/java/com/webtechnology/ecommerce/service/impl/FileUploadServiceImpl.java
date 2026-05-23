package com.webtechnology.ecommerce.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.webtechnology.ecommerce.dto.FileUploadResponse;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.service.FileUploadService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.upload-folder}")
    private String uploadFolder;

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};
    private static final String[] ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"};

    @Override
    public FileUploadResponse uploadImage(MultipartFile file) {
        validateImageFile(file);
        return uploadToCloudinary(file, "image", uploadFolder + "/images");
    }

    @Override
    public FileUploadResponse uploadVideo(MultipartFile file) {
        validateVideoFile(file);
        return uploadToCloudinary(file, "video", uploadFolder + "/videos");
    }

    @Override
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new BadRequestException("Failed to delete file: " + e.getMessage());
        }
    }

    private FileUploadResponse uploadToCloudinary(MultipartFile file, String resourceType, String folder) {
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType,
                    "format", "jpg"
            );

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            return FileUploadResponse.builder()
                    .url((String) uploadResult.get("secure_url"))
                    .publicId((String) uploadResult.get("public_id"))
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .fileType(file.getContentType())
                    .uploadedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
        } catch (IOException e) {
            throw new BadRequestException("File upload failed: " + e.getMessage());
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BadRequestException("Image size must not exceed 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("File content type cannot be determined");
        }

        boolean isValidType = false;
        for (String type : ALLOWED_IMAGE_TYPES) {
            if (contentType.equals(type)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new BadRequestException("Only JPEG, PNG, GIF and WebP images are allowed");
        }
    }

    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new BadRequestException("Video size must not exceed 100MB");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("File content type cannot be determined");
        }

        boolean isValidType = false;
        for (String type : ALLOWED_VIDEO_TYPES) {
            if (contentType.equals(type)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new BadRequestException("Only MP4, MPEG, MOV and AVI videos are allowed");
        }
    }
}
