package org.example.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import org.example.repository.WebSocketConnectionRepository;

import java.util.Map;

public class DisconnectHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private final WebSocketConnectionRepository repository = new WebSocketConnectionRepository();

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {
        System.out.println("DisconnectHandler: Received request");

        Map<String, Object> requestContext = (Map<String, Object>) event.get("requestContext");

        String connectionId = (String) requestContext.get("connectionId");
        System.out.println("DisconnectHandler: Extracted connectionId to delete: " + connectionId);

        repository.deleteByConnectionId(connectionId);
        System.out.println("DisconnectHandler: Deleted connection from DB");

        return Map.of("statusCode", 200);
    }
}
