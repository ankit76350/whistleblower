package org.example.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.data.mongodb.core.MongoTemplate;

public class MongoClientProvider {

    private static MongoTemplate mongoTemplate;

    public static MongoTemplate getMongoTemplate() {
        System.out.println("MongoClientProvider_1: Creating new Mongo Client...");
        if (mongoTemplate == null) {
            String connectionString = System.getenv("MONGO_URI");
            System.out.println("MongoClientProvider_3: Using connection string: "
                    + (connectionString.contains("@") ? "Confidential" : connectionString));

            MongoClient client = MongoClients.create(connectionString);
            mongoTemplate = new MongoTemplate(client, "whistleblower");
            System.out.println("MongoClientProvider_4: Mongo Template created successfully");
        }
        System.out.println("MongoClientProvider_5: Returning Mongo Template" + mongoTemplate);
        return mongoTemplate;
    }
}
