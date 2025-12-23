package org.example.service;

import lombok.RequiredArgsConstructor;

import org.example.dto.ReportWithConversationResponse;
import org.example.error.ApiException;
import org.example.model.*;
import org.example.repository.*;
import org.example.utility.SecretKeyGenerator;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {

        private final WhistleblowerReportRepository reportRepo;
        private final ConversationMessageRepository messageRepo;
        private final TenantRepository tenantRepo;

        public WhistleblowerReport createReport(
                        String tenantId,
                        String subject,
                        String message,
                        List<String> attachments) {

                Optional<Tenant> tenant = tenantRepo.findByTenantId(tenantId);

                if (tenant.isEmpty()) {
                        throw new ApiException(404, "Tenant not found with id: " + tenantId);
                }
                if (subject == null || subject.trim().isEmpty()) {
                        throw new ApiException(400, "Subject must not be empty");
                }
                if (message == null || message.trim().isEmpty()) {
                        throw new ApiException(400, "Message must not be empty");
                }

                Instant now = Instant.now();

                WhistleblowerReport report = WhistleblowerReport.builder()
                                .reportId(UUID.randomUUID().toString())
                                .secretKey(SecretKeyGenerator.generateSecretKey())
                                .tenantId(tenantId)
                                .subject(subject)
                                .message(message)
                                .attachments(attachments)
                                .status(ReportStatus.NEW)
                                .createdAt(now)
                                .deadlineAt(now.plusSeconds(7 * 24 * 60 * 60))
                                .updatedAt(now)
                                .build();

                return reportRepo.save(report);
        }

        public List<WhistleblowerReport> getAllReportForParticularTenant(String tenantId) {
                Optional<Tenant> tenant = tenantRepo.findByTenantId(tenantId);
                if (tenant.isEmpty()) {
                        throw new ApiException(404, "Tenant not found with id: " + tenantId);
                }

                return reportRepo.findAllByTenantId(tenantId);

        }

        // Add new conversation message
        public ConversationMessage addMessage(
                        String reportId,
                        MessageSender sender,
                        String message,
                        List<String> attachments) {

                // 1️⃣ Validate report
                WhistleblowerReport report = reportRepo.findByReportId(reportId)
                                .orElseThrow(() -> new ApiException(404, "Report not found with id: " + reportId));

                // 2️⃣ Validate sender
                if (sender == null) {
                        throw new ApiException(400, "Message sender must be provided");
                }

                // 3️⃣ Validate message
                if (message == null || message.trim().isEmpty()) {
                        throw new ApiException(400, "Message must not be empty");
                }

                // 5️⃣ Build message
                ConversationMessage conversationMessage = ConversationMessage.builder()
                                .reportId(report.getReportId())
                                .sender(sender)
                                .message(message)
                                .attachments(attachments)
                                .readOrUnRead(false) // default unread
                                .createdAt(Instant.now())
                                .build();

                // 6️⃣ Save message
                return messageRepo.save(conversationMessage);
        }

        // Todo: for admin
        public ReportWithConversationResponse getReportWithConversation(
                        String tenantId,
                        String reportId) {

                Tenant tenant = tenantRepo.findByTenantId(tenantId)
                                .orElseThrow(() -> new ApiException(404, "Invalid tenantId"));

                WhistleblowerReport report = reportRepo
                                .findByReportIdAndTenantId(reportId, tenantId)
                                .orElseThrow(() -> new ApiException(404, "Report not found for this tenant"));

                List<ConversationMessage> messages = messageRepo.findByReportIdOrderByCreatedAtAsc(reportId);

                return ReportWithConversationResponse.builder()
                                .report(report)
                                .messages(messages)
                                .build();
        }

        public ReportWithConversationResponse getConversationBySecretKey(String secretKey) {
                // 1️⃣ Validate secret key
                WhistleblowerReport report = reportRepo
                                .findBySecretKey(secretKey)
                                .orElseThrow(() -> new ApiException(404, "Invalid secret key"));

                // 2️⃣ Fetch messages using reportId
                List<ConversationMessage> messages = messageRepo.findByReportIdOrderByCreatedAtAsc(
                                report.getReportId());

                // 3️⃣ Return combined response
                return ReportWithConversationResponse.builder()
                                .report(report)
                                .messages(messages)
                                .build();
        }

}
