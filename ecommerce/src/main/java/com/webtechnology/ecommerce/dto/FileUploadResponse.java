package com.webtechnology.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {
    private String url;
    private String publicId;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private String uploadedAt;
}
