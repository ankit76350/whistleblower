package org.example.repository;

import org.example.model.Tenant;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

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

    public DynamoDbTable<Tenant> dbConnection() {
        return tenantTable;
    }

    public Tenant findByEmail(String email) {
        DynamoDbIndex<Tenant> emailIndex = tenantTable.index("EmailIndex");

        Tenant result = emailIndex.query(r -> r.queryConditional(
                QueryConditional.keyEqualTo(k -> k.partitionValue(email))))
                .stream()
                .flatMap(page -> page.items().stream())
                .findFirst()
                .orElse(null);
        return result;
    }

    public Tenant save(Tenant tenant) {
        tenantTable.putItem(tenant);
        return tenant;
    }

    public Tenant findById(String id) {
        return tenantTable
                .query(r -> r.queryConditional(QueryConditional
                        .keyEqualTo(k -> k.partitionValue(id))))
                .items().stream().findFirst().orElse(null);
    }

    public List<Tenant> findAll() {
        List<Tenant> tenants = new ArrayList<>();
        tenantTable.scan().items().forEach(tenants::add);
        return tenants;
    }

   
}