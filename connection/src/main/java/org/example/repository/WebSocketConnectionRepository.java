package org.example.repository;

import org.example.config.MongoClientProvider;
import org.example.model.WebSocketConnection;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.List;

public class WebSocketConnectionRepository {

    private final MongoTemplate mongoTemplate =
            MongoClientProvider.getMongoTemplate();

    public void save(WebSocketConnection connection) {
        mongoTemplate.save(connection);
    }

    public void deleteByConnectionId(String connectionId) {
        mongoTemplate.remove(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria
                                .where("connectionId").is(connectionId)
                ),
                WebSocketConnection.class
        );
    }

    public List<WebSocketConnection> findByReportId(String reportId) {
        return mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria
                                .where("reportId").is(reportId)
                ),
                WebSocketConnection.class
        );
    }
}
