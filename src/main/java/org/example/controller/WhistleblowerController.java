package org.example.controller;

import org.example.model.Tenant;
import org.example.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class WhistleblowerController {

    private final TenantService service;

    @PostMapping
    public Tenant createTenant(@RequestBody Tenant tenant) {
        System.out.println("tenant");
        System.out.println(tenant);
        return service.createTenant(tenant);
    }

    @GetMapping("/{tenantId}")
    public Tenant getTenant(@PathVariable String tenantId) {
        return service.getTenant(tenantId);
    }

    @GetMapping
    public List<Tenant> getAllTenants() {
        return service.getAllTenants();
    }

    @PutMapping
    public Tenant updateTenant(@RequestBody Tenant tenant) {
        return service.updateTenant(tenant);
    }

    @DeleteMapping("/{tenantId}")
    public void deleteTenant(@PathVariable String tenantId) {
        service.deleteTenant(tenantId);
    }
}