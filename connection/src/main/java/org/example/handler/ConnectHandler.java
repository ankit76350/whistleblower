package org.example.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import org.example.model.WebSocketConnection;
import org.example.repository.WebSocketConnectionRepository;

import java.time.Instant;
import java.util.Map;

public class ConnectHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

        private final WebSocketConnectionRepository repository = new WebSocketConnectionRepository();

        @Override
        public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {
                System.out.println("ConnectHandler: Received request");
                System.out.println("ConnectHandler: Event: " + event);

                Map<String, Object> requestContext = (Map<String, Object>) event.get("requestContext");
                System.out.println("ConnectHandler: Parsed requestContext");

                String connectionId = (String) requestContext.get("connectionId");
                System.out.println("ConnectHandler: Extracted connectionId: " + connectionId);

                Map<String, String> queryParams = (Map<String, String>) event.get("queryStringParameters");
                System.out.println("ConnectHandler: Extracted queryParams: " + queryParams);

                String reportId = queryParams.get("reportId");
                String userType = queryParams.get("userType");
                System.out.println("ConnectHandler: Saving connection for ReportID: " + reportId + ", UserType: "
                                + userType);

                repository.save(WebSocketConnection.builder()
                                .connectionId(connectionId)
                                .reportId(reportId)
                                .userType(userType)
                                .connectedAt(Instant.now())
                                .build());
                System.out.println("ConnectHandler: Saved connection to DB successfully");

                System.out.println("ConnectHandler: Returning 200 OK");
                return Map.of("statusCode", 200);
        }
}
