package org.example.repository;

import org.example.model.WhistleblowerReport;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WhistleblowerReportRepository
        extends MongoRepository<WhistleblowerReport, String> {

    Optional<WhistleblowerReport> findBySecretKey(String secretKey);

    Optional<WhistleblowerReport> findByReportId(String reportId);
    List<WhistleblowerReport> findAllByTenantId(String tenantId);

}
