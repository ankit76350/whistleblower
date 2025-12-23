package org.example.service;

import lombok.RequiredArgsConstructor;

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

        public List<ConversationMessage> getConversation(String secretKey) {
                WhistleblowerReport report = reportRepo.findBySecretKey(secretKey)
                                .orElseThrow(() -> new RuntimeException("Invalid secret key"));

                return messageRepo.findByReportIdOrderByCreatedAtAsc(report.getReportId());
        }

        public ConversationMessage addMessage(
                        String reportId,
                        MessageSender sender,
                        String message,
                        List<String> attachments) {
                ConversationMessage msg = ConversationMessage.builder()
                                .reportId(reportId)
                                .sender(sender)
                                .message(message)
                                .attachments(attachments)
                                .createdAt(Instant.now())
                                .build();

                return messageRepo.save(msg);
        }

}
