package org.example.dto;

import lombok.Builder;
import lombok.Data;
import org.example.model.ConversationMessage;
import org.example.model.WhistleblowerReport;

import java.util.List;

@Data
@Builder
public class ReportWithConversationResponse {

    private WhistleblowerReport report;
    private List<ConversationMessage> messages;
}
