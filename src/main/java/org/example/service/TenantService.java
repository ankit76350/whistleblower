
package org.example.service;

import org.example.model.Tenant;
import org.example.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.error.ApiException;

import java.util.UUID;
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
        Optional<Tenant> existingTenant = repository.findById(tenantId);
        if (existingTenant.isEmpty()) {
            throw new ApiException(404, "Tenant not found with id: " + tenantId);
        }
        newTenantInfo.setTenantId(tenantId);
        return repository.save(newTenantInfo);

    }

    public Tenant deleteTenant(String tenantId) {
        Optional<Tenant> existingTenant = repository.findById(tenantId);
        if (existingTenant.isEmpty()) {
            throw new ApiException(404, "Tenant not found with id: " + tenantId);
        }
        repository.delete(existingTenant.get());
        return existingTenant.get();
    }

}