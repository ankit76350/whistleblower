
package org.example.service;

import org.example.model.Tenant;
import org.example.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final TenantRepository repository;

    public Tenant createTenant(Tenant tenant) {
        tenant.setTenantId(UUID.randomUUID().toString());
        return repository.save(tenant);
    }

    public Tenant getTenant(String tenantId) {
        return repository.findById(tenantId);
    }

    public List<Tenant> getAllTenants() {
        return repository.findAll();
    }

    public Tenant updateTenant(Tenant tenant) {
        return repository.save(tenant); // DynamoDB putItem replaces existing
    }

    public void deleteTenant(String tenantId) {
        repository.deleteById(tenantId);
    }
}