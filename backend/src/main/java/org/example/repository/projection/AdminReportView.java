package org.example.repository.projection;

import java.time.Instant;
import java.util.List;

public interface AdminReportView {

    String getReportId();
    String getTenantId();
    String getSubject();
    String getMessage();
    List<String> getAttachments();
    String getStatus();
    boolean isReadOrUnRead();
    Instant getCreatedAt();
    Instant getReceivedAt();
    Instant getDeadlineAt();
    Instant getUpdatedAt();
}
