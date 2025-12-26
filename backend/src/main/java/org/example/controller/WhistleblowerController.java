package org.example.controller;

import org.example.model.Tenant;
import org.example.model.WhistleblowerReport;
import org.example.service.ConversationService;
import org.example.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.example.dto.CreateReportRequest;
import org.example.dto.SendMessageRequest;
import org.example.model.ApiResponse;
import org.example.model.ConversationMessage;
import org.example.dto.ReportWithConversationResponse;
import org.example.dto.AdminReportConversationResponse;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/whistleblower")
@RequiredArgsConstructor
public class WhistleblowerController {

        private final TenantService service;

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
        @PostMapping("/anonymous/submitNewReport")
        public WhistleblowerReport createReport(@RequestBody CreateReportRequest req) {
                return conversationService.createReport(
                                req.getTenantId(),
                                req.getSubject(),
                                req.getMessage(),
                                req.getAttachments());
        }

        // Get Tenant's Reports
        @GetMapping("/tenant/{tenantId}/reports")
        public ResponseEntity<List<WhistleblowerReport>> getReportsByTenant(
                        @PathVariable String tenantId) {

                return ResponseEntity.ok(
                                conversationService.getAllReportForParticularTenant(tenantId));
        }

        // Add new message to a report conversation
        @PostMapping("/reports/{reportId}/messages")
        public ResponseEntity<ConversationMessage> sendNewMessage(
                        @PathVariable String reportId,
                        @RequestBody SendMessageRequest request) {

                ConversationMessage message = conversationService.addMessage(
                                reportId,
                                request.getSender(),
                                request.getMessage(),
                                request.getAttachments());

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

        // Public – access by secret key
        @GetMapping("/report/{secretKey}/conversation")
        public ResponseEntity<ReportWithConversationResponse> getConversation(
                        @PathVariable String secretKey) {
                return ResponseEntity.ok(
                                conversationService.getConversationBySecretKey(secretKey));
        }

}