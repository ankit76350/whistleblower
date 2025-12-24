package org.example.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.HashMap;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@EnableWebMvc
@RequiredArgsConstructor
public class PingController {

    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @RequestMapping(path = "/ping", method = RequestMethod.GET)
    public Map<String, String> ping() {
        Map<String, String> pong = new HashMap<>();
        pong.put("pong", "Hello, World!");
        return pong;
    }
    @RequestMapping(path = "/", method = RequestMethod.GET)
    public Map<String, String> home() {
        Map<String, String> pong = new HashMap<>();
        pong.put("Spring Boot", "Backend Server for Whistleblower App");
        return pong;
    }

    @GetMapping("/health/db")
    public String checkDb() {
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            return "MongoDB CONNECTED";
        } catch (Exception ex) {
            ex.printStackTrace();
            return "MongoDB NOT CONNECTED: " + ex.getMessage();
        }
    }
}
