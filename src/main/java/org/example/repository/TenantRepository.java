package org.example.repository;

import org.example.model.Tenant;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TenantRepository {
    private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
    private DynamoDbTable<Tenant> tenantTable;

    @PostConstruct
    public void init() {
        tenantTable = dynamoDbEnhancedClient.table("whistleblower_tenant", TableSchema.fromBean(Tenant.class));
    }

    public Tenant save(Tenant tenant) {
        tenantTable.putItem(tenant);
        return tenant;
    }

    public Tenant findById(String id) {
        return tenantTable.getItem(r -> r.key(k -> k.partitionValue(id)));
    }

    public List<Tenant> findAll() {
        List<Tenant> tenants = new ArrayList<>();
        tenantTable.scan().items().forEach(tenants::add);
        return tenants;
    }

    public void deleteById(String id) {
        tenantTable.deleteItem(r -> r.key(k -> k.partitionValue(id)));
    }
}