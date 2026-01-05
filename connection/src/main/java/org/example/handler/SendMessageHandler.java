package org.example.handler;

import com.amazonaws.services.apigatewaymanagementapi.AmazonApiGatewayManagementApi;
import com.amazonaws.services.apigatewaymanagementapi.AmazonApiGatewayManagementApiClientBuilder;
import com.amazonaws.services.apigatewaymanagementapi.model.GoneException;
import com.amazonaws.services.apigatewaymanagementapi.model.PostToConnectionRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.WebSocketConnection;
import org.example.repository.WebSocketConnectionRepository;

import java.net.URI;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;

public class SendMessageHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

        private final WebSocketConnectionRepository repository = new WebSocketConnectionRepository();

        private final ObjectMapper mapper = new ObjectMapper();

        @Override
        public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {
                System.out.println("SendMessageHandler_1: Received request");

                try {
                        Map<String, Object> requestContext = (Map<String, Object>) event.get("requestContext");

                        String endpoint = "https://"
                                        + requestContext.get("domainName")
                                        + "/"
                                        + requestContext.get("stage");
                        System.out.println("SendMessageHandler_2: Callback Endpoint: " + endpoint);

                        AmazonApiGatewayManagementApi client = AmazonApiGatewayManagementApiClientBuilder.standard()
                                        .withEndpointConfiguration(
                                                        new AmazonApiGatewayManagementApiClientBuilder.EndpointConfiguration(
                                                                        endpoint, "eu-central-1"))
                                        .build();

                        Map<String, String> payload = mapper.readValue((String) event.get("body"), Map.class);
                        System.out.println("SendMessageHandler_3: Parsed Body: " + payload);

                        String reportId = payload.get("reportId");
                        String message = payload.get("message");

                        String senderConnectionId = (String) requestContext.get("connectionId");
                        System.out.println("SendMessageHandler_4: Sender Connection ID: " + senderConnectionId);

                        // Robustly determine userType from DB
                        String userType = "UNKNOWN";
                        WebSocketConnection senderConn = repository.findByConnectionId(senderConnectionId);
                        if (senderConn != null) {
                                userType = senderConn.getUserType();
                                System.out.println("SendMessageHandler_5: Resolved UserType from DB: " + userType);
                        } else {
                                // Fallback to payload (legacy/optimize) or stay UNKNOWN
                                String payloadUserType = payload.get("userType");
                                if (payloadUserType != null)
                                        userType = payloadUserType;
                                System.out.println("SendMessageHandler_5: UserType from Payload/Default: " + userType);
                        }

                        List<WebSocketConnection> connections = repository.findByReportId(reportId);
                        System.out.println("SendMessageHandler_6: Found " + connections.size() + " connections");

                        // Construct outgoing payload
                        String outgoingData = mapper.writeValueAsString(Map.of(
                                        "message", message,
                                        "userType", userType,
                                        "sender", userType // Adding both for compatibility
                        ));

                        for (WebSocketConnection conn : connections) {
                                if (conn.getConnectionId().equals(senderConnectionId)) {
                                        continue;
                                }

                                System.out.println("SendMessageHandler_6: Sending to " + conn.getConnectionId());
                                try {
                                        client.postToConnection(new PostToConnectionRequest()
                                                        .withConnectionId(conn.getConnectionId())
                                                        .withData(ByteBuffer.wrap(outgoingData.getBytes())));
                                } catch (GoneException e) {
                                        System.out.println("SendMessageHandler_7: Connection Gone: "
                                                        + conn.getConnectionId());
                                        repository.deleteByConnectionId(conn.getConnectionId());
                                }
                        }

                        return Map.of("statusCode", 200);

                } catch (Exception e) {
                        System.err.println("SendMessageHandler: ERROR: " + e.getMessage());
                        e.printStackTrace();
                        return Map.of(
                                        "statusCode", 500,
                                        "error", e.getMessage());
                }
        }
}
