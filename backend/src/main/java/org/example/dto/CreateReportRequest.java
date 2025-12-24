package org.example.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateReportRequest {
    private String tenantId;
    private String subject;
    private String message;
    private List<String> attachments;
}
