package org.example.repository;

import org.example.model.ConversationMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ConversationMessageRepository
        extends MongoRepository<ConversationMessage, String> {

    List<ConversationMessage> findByReportIdOrderByCreatedAtAsc(String reportId);
}
