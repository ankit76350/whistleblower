package org.example.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.HashMap;
import java.util.Map;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.ListTablesResponse;
import lombok.RequiredArgsConstructor;

@RestController
@EnableWebMvc
@RequiredArgsConstructor
public class PingController {

    private final DynamoDbClient dynamoDbClient;

    @RequestMapping(path = "/ping", method = RequestMethod.GET)
    public Map<String, String> ping() {
        Map<String, String> pong = new HashMap<>();
        pong.put("pong", "Hello, World!");
        return pong;
    }

    @GetMapping("/health/db")
    public String checkDb() {
        try {
            ListTablesResponse res = dynamoDbClient.listTables();
            return "DynamoDB CONNECTED. Tables: " + res.tableNames();
        } catch (Exception ex) {
            ex.printStackTrace();
            return "DynamoDB NOT CONNECTED: " + ex.getMessage();
        }
    }
}
