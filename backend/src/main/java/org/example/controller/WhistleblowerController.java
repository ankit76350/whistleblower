package org.example.controller;

import org.example.model.Tenant;
import org.example.model.WhistleblowerReport;
import org.example.service.ConversationService;
import org.example.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.example.service.S3Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.example.dto.CreateReportRequest;
import org.example.dto.SendMessageRequest;
import org.example.model.ApiResponse;
import org.example.model.ConversationMessage;
import org.example.dto.ReportWithConversationResponse;
import org.example.dto.AdminReportConversationResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/whistleblower")
@RequiredArgsConstructor
public class WhistleblowerController {

        private final TenantService service;
        private final S3Service s3Service;

        // ? Adding new tenant
        @PostMapping("/admin/addNewTenant")
        public ResponseEntity<ApiResponse<Tenant>> createTenant(@RequestBody Tenant tenant) {
                Tenant createdTenant = service.createTenant(tenant);
                ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                                .status("success")
                                .message("Tenant added successfully")
                                .data(createdTenant)
                                .build();
                return ResponseEntity.ok(response);
        }

        // ? Get tenanat information
        @GetMapping("/admin/getTenantInfo/{_id}")
        public ResponseEntity<ApiResponse<Tenant>> getTenant(@PathVariable String _id) {
                Tenant tenant = service.getTenant(_id);
                ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                                .status("success")
                                .message("Tenant retrieved successfully")
                                .data(tenant)
                                .build();
                return ResponseEntity.ok(response);
        }

        // ? get all tenant list
        @GetMapping("/admin/getAllTenants")
        public ResponseEntity<ApiResponse<List<Tenant>>> getAllTenants() {
                List<Tenant> tenants = service.getAllTenants();
                ApiResponse<List<Tenant>> response = ApiResponse.<List<Tenant>>builder()
                                .status("success")
                                .message("All tenants retrieved successfully")
                                .data(tenants)
                                .build();
                return ResponseEntity.ok(response);
        }

        // ? To update tenant
        @PutMapping("/admin/updateTenant/{tenantId}")
        public ResponseEntity<ApiResponse<Tenant>> updateTenant(@PathVariable String tenantId,
                        @RequestBody Tenant newTenantInfo) {

                Tenant updatedTenant = service.updateTenant(tenantId, newTenantInfo);
                ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                                .status("success")
                                .message("Tenant updated successfully")
                                .data(updatedTenant)
                                .build();
                return ResponseEntity.ok(response);
        }

        // ? To delete tenant
        @DeleteMapping("/deleteTenant/{tenantId}")
        public ResponseEntity<ApiResponse<Tenant>> deleteTenant(@PathVariable String tenantId) {
                Tenant deletedTenant = service.deleteTenant(tenantId);
                ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                                .status("success")
                                .message("Tenant deleted successfully")
                                .data(deletedTenant)
                                .build();
                return ResponseEntity.ok(response);
        }

        private final ConversationService conversationService;

        // Public – anonymous submit
        // Public – anonymous submit
        @PostMapping(value = "/anonymous/submitNewReport", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public WhistleblowerReport createReport(
                        @RequestPart("reportData") CreateReportRequest req,
                        @RequestParam(value = "attachments", required = false) List<MultipartFile> files)
                        throws IOException {

                System.out.println("DEBUG: createReport called");
                List<String> attachments = new ArrayList<>();

                if (files != null && !files.isEmpty()) {
                        System.out.println("DEBUG: Files received count: " + files.size());
                        for (MultipartFile file : files) {
                                System.out.println("DEBUG: Processing file: " + file.getOriginalFilename());
                                String fileKey = s3Service.uploadFile(file);
                                attachments.add(fileKey);
                        }
                } else {
                        System.out.println("DEBUG: Files list is null or empty");
                }

                // If JSON had attachments, we might want to keep or merge them.
                // For this use case, we can assume the frontend sends empty attachments list
                // and the image is the primary attachment.
                // Or merge:
                if (req.getAttachments() != null) {
                        attachments.addAll(req.getAttachments());
                }

                return conversationService.createReport(
                                req.getTenantId(),
                                req.getSubject(),
                                req.getMessage(),
                                attachments);
        }

        // Get Tenant's Reports
        @GetMapping("/tenant/{tenantId}/reports")
        public ResponseEntity<List<WhistleblowerReport>> getReportsByTenant(
                        @PathVariable String tenantId) {

                return ResponseEntity.ok(
                                conversationService.getAllReportForParticularTenant(tenantId));
        }

        // Add new message to a report conversation
        // Add new message to a report conversation
        @PostMapping(value = "/reports/{reportId}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ConversationMessage> sendNewMessage(
                        @PathVariable String reportId,
                        @RequestPart("messageData") SendMessageRequest request,
                        @RequestParam(value = "attachments", required = false) List<MultipartFile> files)
                        throws IOException {

                List<String> attachments = new ArrayList<>();
                if (files != null && !files.isEmpty()) {
                        for (MultipartFile file : files) {
                                String fileKey = s3Service.uploadFile(file);
                                attachments.add(fileKey);
                        }
                }

                if (request.getAttachments() != null) {
                        attachments.addAll(request.getAttachments());
                }

                ConversationMessage message = conversationService.addMessage(
                                reportId,
                                request.getSender(),
                                request.getMessage(),
                                attachments);

                return ResponseEntity.ok(message);

        }

        // Todo: Get conversation for the admin
        @GetMapping("/tenant/{tenantId}/report/{reportId}/conversation")
        public ResponseEntity<AdminReportConversationResponse> getReportConversation(
                        @PathVariable String tenantId,
                        @PathVariable String reportId) {
                return ResponseEntity.ok(
                                conversationService.getReportWithConversation(tenantId, reportId));
        }

        // Update Report Status (Manual)
        @PutMapping("/reports/{reportId}/status")
        public ResponseEntity<WhistleblowerReport> updateReportStatus(
                        @PathVariable String reportId,
                        @RequestParam String status) {
                return ResponseEntity.ok(
                                conversationService.updateReportStatus(reportId, status));
        }

        // Public – access by secret key
        @GetMapping("/report/{secretKey}/conversation")
        public ResponseEntity<ReportWithConversationResponse> getConversation(
                        @PathVariable String secretKey) {
                return ResponseEntity.ok(
                                conversationService.getConversationBySecretKey(secretKey));
        }

        // Get Presigned URL for file
        @GetMapping("/file-url/{key}")
        public ResponseEntity<String> getFileUrl(@PathVariable String key) {
                // In a real app, you should verify if the user has access to this file
                // But for now, we assume the key is hard to guess (UUID)
                String url = s3Service.getPresignedUrl(key);
                return ResponseEntity.ok(url);
        }

}