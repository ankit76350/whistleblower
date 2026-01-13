package org.example.controller;

import org.example.model.ApiResponse;
import org.example.model.Tenant;
import org.example.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final TenantService tenantService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Tenant>> getCurrentUser(Authentication authentication) {
        // Extract email from the JWT token (Principal)
        // Adjust this depending on how your Authentication principal is structured
        // Often with OAuth2/JWT it's the subject or a claim
        String email = null;

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            // Cognito often puts email in "email" claim, or uses "username" as sub
            email = jwt.getClaim("email");
            if (email == null) {
                // Fallback to username if email claim is missing
                email = jwt.getSubject();
            }
        } else {
            // Fallback for other auth types (e.g. testing)
            email = authentication.getName();
        }

        Tenant tenant = tenantService.findByEmail(email);

        ApiResponse<Tenant> response = ApiResponse.<Tenant>builder()
                .status("success")
                .message("Current user retrieved successfully")
                .data(tenant)
                .build();
        return ResponseEntity.ok(response);
    }
}
