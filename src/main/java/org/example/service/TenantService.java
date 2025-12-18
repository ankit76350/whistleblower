
package org.example.service;

import org.example.model.Tenant;
import org.example.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.error.ApiException;

import java.util.UUID;
import java.util.List;

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

        Tenant existingTenant = repository.findByEmail(tenant.getEmail());

        if (existingTenant != null) {
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
        Tenant tenant = repository.findById(tenantId);
        if (tenant == null) {
            throw new ApiException(404, "Tenant not found with id: " + tenantId);
        }
        return tenant;
    }

    public List<Tenant> getAllTenants() {
        List<Tenant> tenants = repository.findAll();
        return tenants;
    }

   
}