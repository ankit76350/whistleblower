package org.example.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "whistleblower_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhistleblowerReport {

    @Id
    private String id; // Mongo internal ID

    // Public identifiers
    @Indexed(unique = true)
    private String reportId;     // UUID shown internally

    @Indexed(unique = true)
    private String secretKey;    // ONLY identifier for whistleblower

    @Indexed
    private String tenantId;     // links to Tenant.tenantId

    // Report content
    private String subject;

    private String message;      // encrypted before save

    private List<String> attachments; // S3 URLs (encrypted)

    // Report status
    private ReportStatus status;

    // status for read or unread
    private boolean readOrUnRead;

    // Legal timing
    private Instant createdAt;
    private Instant receivedAt;
    private Instant deadlineAt;  // createdAt + 7 days

    // Audit (minimal, no identity)
    private Instant updatedAt;
}
