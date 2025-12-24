package org.example.dto;

import lombok.Data;

import java.util.List;

import org.example.model.MessageSender;

@Data
public class SendMessageRequest {

    private MessageSender sender;   // WHISTLEBLOWER | ADMIN
    private String message;
    private List<String> attachments;
}
