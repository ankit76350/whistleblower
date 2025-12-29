package org.example.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

@Service
public class CognitoUserService {

        private final CognitoIdentityProviderClient cognitoClient;

        @Value("${aws.cognito.userPoolId}")
        private String userPoolId;

        public CognitoUserService(CognitoIdentityProviderClient cognitoClient) {
                this.cognitoClient = cognitoClient;
        }

        /**
         * Invites a new user to the Cognito User Pool.
         * Cognito will send an email with temporary credentials to the user.
         * 
         * @param email The email address of the user to invite
         * @param role  Optional role (for future use - groups not configured yet)
         */
        public void inviteUser(String email, String role) {
                AdminCreateUserRequest createUserRequest = AdminCreateUserRequest.builder()
                                .userPoolId(userPoolId)
                                .username(email)
                                .userAttributes(
                                                AttributeType.builder()
                                                                .name("email")
                                                                .value(email)
                                                                .build(),
                                                AttributeType.builder()
                                                                .name("email_verified")
                                                                .value("true")
                                                                .build())
                                .desiredDeliveryMediums(DeliveryMediumType.EMAIL)
                                .build();

                cognitoClient.adminCreateUser(createUserRequest);
        }
}
