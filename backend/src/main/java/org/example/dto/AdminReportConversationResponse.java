package org.example.dto;

import lombok.Builder;
import lombok.Data;
import org.example.model.ConversationMessage;
import org.example.model.WhistleblowerReport;
import org.example.repository.projection.AdminReportView;

import java.util.List;

@Data
@Builder
public class AdminReportConversationResponse {
    private AdminReportView report;
    private List<ConversationMessage> messages;
}
