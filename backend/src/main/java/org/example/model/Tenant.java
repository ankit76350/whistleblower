package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    // Mongo internal ID
    @Id
    private String id;

    // Public tenant identifier (UUID)
    @Indexed(unique = true)
    private String tenantId;

    // Legal / escalation email
    @Indexed(unique = true)
    private String email;

    // Legal company name
    private String companyName;

    // HinSchG compliance flags
    private Boolean active;

    // Role (ADMIN, SUPERADMIN)
    private String role;

    // Audit fields
    private Instant createdAt;
    private Instant updatedAt;
}
