package org.example.repository;

import org.example.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends MongoRepository<Tenant, String> {
    Optional<Tenant> findByEmail(String email);
    Optional<Tenant> findByTenantId(String tenantId);

}