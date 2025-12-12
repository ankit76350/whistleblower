package org.example.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Configuration
public class DynamoDBEnhancedConfig {

        @Value("${cloud.aws.region.static}")
        private String region;

        @Bean
        @Profile("local")
        public DynamoDbClient dynamoDbClientLocal(
                        @Value("${cloud.aws.credentials.access-key}") String accessKey,
                        @Value("${cloud.aws.credentials.secret-key}") String secretKey) {
                return DynamoDbClient.builder()
                                .region(Region.of(region))
                                .credentialsProvider(StaticCredentialsProvider.create(
                                                AwsBasicCredentials.create(accessKey, secretKey)))
                                .build();
        }

        @Bean
        @Profile("local")
        public DynamoDbEnhancedClient dynamoDbEnhancedClientLocal(DynamoDbClient dynamoDbClient) {
                return DynamoDbEnhancedClient.builder()
                                .dynamoDbClient(dynamoDbClient)
                                .build();
        }

        @Bean
        @Profile("dev")
        public DynamoDbClient dynamoDbClientDev() {
                return DynamoDbClient.builder()
                                .region(Region.of(region))
                                .credentialsProvider(DefaultCredentialsProvider.create())
                                .build();
        }

        @Bean
        @Profile("dev")
        public DynamoDbEnhancedClient dynamoDbEnhancedClientDev(DynamoDbClient dynamoDbClient) {
                return DynamoDbEnhancedClient.builder()
                                .dynamoDbClient(dynamoDbClient)
                                .build();
        }
}