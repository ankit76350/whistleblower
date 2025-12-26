package org.example.repository;

import org.example.model.WhistleblowerReport;
import org.example.repository.projection.AdminReportView;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WhistleblowerReportRepository
        extends MongoRepository<WhistleblowerReport, String> {

    Optional<WhistleblowerReport> findByReportId(String reportId);
    List<WhistleblowerReport> findAllByTenantId(String tenantId);
    Optional<WhistleblowerReport> findByReportIdAndTenantId(String reportId,String tenantId);
    //Projection in MongoDb
    Optional<AdminReportView> findProjectedByReportIdAndTenantId(String reportId,String tenantId);

    Optional<WhistleblowerReport> findBySecretKey(String secretKey);


}
