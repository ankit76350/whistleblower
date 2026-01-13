
package org.example.service;

import org.example.model.Tenant;
import org.example.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.error.ApiException;

import java.util.UUID;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final TenantRepository repository;

    public Tenant createTenant(Tenant tenant) {

        if (tenant == null) {
            throw new ApiException(400, "Request body is required");
        }

        if (tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            throw new ApiException(400, "Email must not be empty");
        }

        if (tenant.getCompanyName() == null || tenant.getCompanyName().isBlank()) {
            throw new ApiException(400, "Company name must not be empty");
        }

        Optional<Tenant> existingTenant = repository.findByEmail(tenant.getEmail());

        if (existingTenant.isPresent()) {
            throw new ApiException(409, "Tenant already exists with email: " + tenant.getEmail());
        }

        tenant.setTenantId(UUID.randomUUID().toString());
        tenant.setCreatedAt(Instant.now());
        tenant.setActive(true);

        if (tenant.getRole() == null || tenant.getRole().isBlank()) {
            tenant.setRole("ADMIN");
        }

        try {
            return repository.save(tenant);
        } catch (Exception e) {
            throw new ApiException(500, "Failed to create tenant");
        }
    }

    public Tenant getTenant(String tenantId) {
        Optional<Tenant> tenant = repository.findById(tenantId);
        if (tenant.isEmpty()) {
            throw new ApiException(404, "Tenant not found with id: " + tenantId);
        }
        return tenant.get();
    }

    public List<Tenant> getAllTenants() {
        return repository.findAll();
    }

    public Tenant updateTenant(String tenantId, Tenant newTenantInfo) {
        Tenant existingTenant = repository.findByTenantId(tenantId)
                .orElseThrow(() -> new ApiException(404, "Tenant not found with tenantId: " + tenantId));

        // ✅ Update ONLY allowed fields
        existingTenant.setCompanyName(newTenantInfo.getCompanyName());
        existingTenant.setEmail(newTenantInfo.getEmail());
        existingTenant.setActive(newTenantInfo.isActive());

        // ✅ Audit
        existingTenant.setUpdatedAt(Instant.now());

        return repository.save(existingTenant);
    }

    public Tenant deleteTenant(String tenantId) {
        Optional<Tenant> existingTenant = repository.findByTenantId(tenantId);
        if (existingTenant.isEmpty()) {
            throw new ApiException(404, "Tenant not found with id: " + tenantId);
        }
        repository.delete(existingTenant.get());
        return existingTenant.get();
    }

    public Tenant findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new ApiException(404, "Tenant not found with email: " + email));
    }

}