
package org.example.service;

import org.example.model.Tenant;
import org.example.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;


@Service
@RequiredArgsConstructor
public class Services {
    private final TenantRepository repository;

    public DynamoDbTable<Tenant> dbConnection() {
        return repository.dbConnection();
    }

  
}