package org.example.controller;

import org.example.model.Tenant;
import org.example.service.TenantService;
import org.example.service.Services;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;

@RestController
@RequestMapping("/whistleblower")
@RequiredArgsConstructor
public class WhistleblowerController {

    private final TenantService service;
    private final Services services;

    // ? Adding new tenant 
    @GetMapping("/dbConnection")
    public String dbConnection() {
        System.out.print("👍 " + services.dbConnection() + " 👍");
        return "👍 " + services.dbConnection() + " 👍";
    }

    // ? Adding new tenant
    @PostMapping("/addNewTenant")
    public Tenant createTenant(@RequestBody Tenant tenant) {
        return service.createTenant(tenant);
    }

    // ? Get tenanat information
    @GetMapping("/getTenantInfo/{tenantId}")
    public Tenant getTenant(@PathVariable String tenantId) {
        return service.getTenant(tenantId);
    }

    // ? get all tenant list
    @GetMapping("/getAllTenants")
    public List<Tenant> getAllTenants() {
        return service.getAllTenants();
    }

  
}