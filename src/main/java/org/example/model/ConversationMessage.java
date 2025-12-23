package org.example.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "conversation_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMessage {

    @Id
    private String id;

    @Indexed
    private String reportId;   // FK → WhistleblowerReport.reportId

    private MessageSender sender; // WHISTLEBLOWER | ADMIN

    private String message;       // encrypted text

    private List<String> attachments; // optional
    
    private boolean readOrUnRead;

    private Instant createdAt;
}
