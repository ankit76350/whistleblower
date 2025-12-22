package org.example.controller;

import org.example.model.Tenant;
import org.example.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.example.model.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/whistleblower")
@RequiredArgsConstructor
public class WhistleblowerController {

    private final TenantService service;

    // ? Adding new tenant
    @PostMapping("/addNewTenant")
    public ResponseEntity<ApiResponse<Tenant>> createTenant(@RequestBody Tenant tenant) {
        Tenant createdTenant = service.createTenant(tenant);
        ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                .status("success")
                .message("Tenant added successfully")
                .data(createdTenant)
                .build();
        return ResponseEntity.ok(response);
    }

    // ? Get tenanat information
    @GetMapping("/getTenantInfo/{tenantId}")
    public ResponseEntity<ApiResponse<Tenant>> getTenant(@PathVariable String tenantId) {
        Tenant tenant = service.getTenant(tenantId);
        ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                .status("success")
                .message("Tenant retrieved successfully")
                .data(tenant)
                .build();
        return ResponseEntity.ok(response);
    }

    // ? get all tenant list
    @GetMapping("/getAllTenants")
    public ResponseEntity<ApiResponse<List<Tenant>>> getAllTenants() {
        List<Tenant> tenants = service.getAllTenants();
        ApiResponse<List<Tenant>> response = ApiResponse.<List<Tenant>>builder()
                .status("success")
                .message("All tenants retrieved successfully")
                .data(tenants)
                .build();
        return ResponseEntity.ok(response);
    }

    // ? To update tenant
    @PutMapping("/updateTenant/{tenantId}")
    public ResponseEntity<ApiResponse<Tenant>> updateTenant(@PathVariable String tenantId,
            @RequestBody Tenant newTenantInfo) {
        Tenant updatedTenant = service.updateTenant(tenantId, newTenantInfo);
        ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                .status("success")
                .message("Tenant updated successfully")
                .data(updatedTenant)
                .build();
        return ResponseEntity.ok(response);
    }

    // ? To delete tenant
    @DeleteMapping("/deleteTenant/{tenantId}")
    public ResponseEntity<ApiResponse<Tenant>> deleteTenant(@PathVariable String tenantId) {
        Tenant deletedTenant = service.deleteTenant(tenantId);
        ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                .status("success")
                .message("Tenant deleted successfully")
                .data(deletedTenant)
                .build();
        return ResponseEntity.ok(response);
    }

}