package org.example.service;

import lombok.RequiredArgsConstructor;

import org.example.dto.AdminReportConversationResponse;
import org.example.dto.ReportWithConversationResponse;
import org.example.error.ApiException;
import org.example.model.*;
import org.example.repository.*;
import org.example.repository.projection.AdminReportView;
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
                ConversationMessage savedMessage = messageRepo.save(conversationMessage);

                // 7️⃣ Auto-update status to IN_PROGRESS if Admin replies
                if (sender == MessageSender.COMPLIANCE_TEAM) {
                        if (report.getStatus() != ReportStatus.CLOSED && report.getStatus() != ReportStatus.CANCELED) {
                                report.setStatus(ReportStatus.IN_PROGRESS);
                                report.setUpdatedAt(Instant.now());
                                reportRepo.save(report);
                        }
                }

                return savedMessage;
        }

        // Todo: for admin
        public AdminReportConversationResponse getReportWithConversation(
                        String tenantId,
                        String reportId) {

                Tenant tenant = tenantRepo.findByTenantId(tenantId)
                                .orElseThrow(() -> new ApiException(404, "Invalid tenantId"));

                // WhistleblowerReport report = reportRepo
                // .findByReportIdAndTenantId(reportId, tenantId)
                // .orElseThrow(() -> new ApiException(404, "Report not found for this
                // tenant"));
                AdminReportView report = reportRepo
                                .findProjectedByReportIdAndTenantId(reportId, tenantId)
                                .orElseThrow(() -> new ApiException(404, "Report not found for this tenant"));

                // Auto-update status from NEW -> RECEIVED on first view
                // We need the full entity to update it, AdminReportView is a projection
                // (read-only usually)
                // So let's fetch the full entity if we need to update status
                // But `findProjected` returns a View. We can use `findByReportIdAndTenantId`
                // separately or check the view.

                // Fetch full entity for status update check
                Optional<WhistleblowerReport> fullReportOpt = reportRepo.findByReportIdAndTenantId(reportId, tenantId);
                if (fullReportOpt.isPresent()) {
                        WhistleblowerReport fullReport = fullReportOpt.get();
                        if (fullReport.getStatus() == ReportStatus.NEW) {
                                fullReport.setStatus(ReportStatus.RECEIVED);
                                fullReport.setReceivedAt(Instant.now());
                                fullReport.setUpdatedAt(Instant.now());
                                reportRepo.save(fullReport);

                                // Update the view projection logic?
                                // The view returned below might be stale if we don't refresh it,
                                // but usually acceptable for this request or we can re-fetch.
                                // For simplicity, we let the frontend see "NEW" this one time (or maybe they
                                // see RECEIVED if they refresh),
                                // OR we can rely on the fact that next time it will be RECEIVED.
                                // Actually, better to re-wait or just let it be.
                        }
                }

                List<ConversationMessage> messages = messageRepo.findByReportIdOrderByCreatedAtAsc(reportId);

                return AdminReportConversationResponse.builder()
                                .report(report)
                                .messages(messages)
                                .build();
        }

        // Todo: For Reporter
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

        public WhistleblowerReport updateReportStatus(String reportId, String statusString) {
                WhistleblowerReport report = reportRepo.findByReportId(reportId)
                                .orElseThrow(() -> new ApiException(404, "Report not found"));

                try {
                        // Robust matching (ignore case)
                        ReportStatus newStatus = null;
                        for (ReportStatus s : ReportStatus.values()) {
                                if (s.name().equalsIgnoreCase(statusString)) {
                                        newStatus = s;
                                        break;
                                }
                        }

                        if (newStatus == null) {
                                throw new IllegalArgumentException("Unknown status: " + statusString);
                        }

                        report.setStatus(newStatus);
                        report.setUpdatedAt(Instant.now());
                        return reportRepo.save(report);
                } catch (IllegalArgumentException e) {
                        throw new ApiException(400, "Invalid status: " + statusString);
                }
        }

}
