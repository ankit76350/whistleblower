package org.example.error;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiErrorResponse {

    private String timestamp;
    private int status;
    private String error;
    private String message;
    private String path;


    // 🔥 NEW (optional, for debugging)
    private String exception;
    private List<String> stackTrace;
}
