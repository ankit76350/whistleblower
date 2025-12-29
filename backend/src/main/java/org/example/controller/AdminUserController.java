package org.example.controller;

import lombok.Data;
import org.example.service.CognitoUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.cognitoidentityprovider.model.CognitoIdentityProviderException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UsernameExistsException;

import java.util.Map;

@RestController
@RequestMapping("/admin/invite/user")
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final CognitoUserService cognitoUserService;

    public AdminUserController(CognitoUserService cognitoUserService) {
        this.cognitoUserService = cognitoUserService;
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email is required"));
            }
            if (request.getRole() == null || request.getRole().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Role is required"));
            }

            cognitoUserService.inviteUser(request.getEmail(), request.getRole());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User invited successfully. An email with temporary credentials has been sent to "
                            + request.getEmail()));
        } catch (UsernameExistsException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "A user with this email already exists"));
        } catch (CognitoIdentityProviderException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to invite user: " + e.awsErrorDetails().errorMessage()));
        }
    }

    @Data
    static class CreateUserRequest {
        private String email;
        private String role;
    }
}
