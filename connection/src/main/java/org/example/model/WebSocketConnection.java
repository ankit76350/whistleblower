package org.example.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "websocket_connections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketConnection {

    @Id
    private String id;

    private String connectionId;
    private String reportId;
    private String userType; // ADMIN / REPORTER
    private Instant connectedAt;
}
