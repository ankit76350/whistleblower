package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.*;
import org.example.repository.*;
import org.example.utility.SecretKeyGenerator;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {

        private final WhistleblowerReportRepository reportRepo;
        private final ConversationMessageRepository messageRepo;

        public WhistleblowerReport createReport(
                        String tenantId,
                        String subject,
                        String message,
                        List<String> attachments) {
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
