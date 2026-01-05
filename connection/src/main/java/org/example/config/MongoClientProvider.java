package org.example.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.data.mongodb.core.MongoTemplate;

public class MongoClientProvider {

    private static MongoTemplate mongoTemplate;

    public static MongoTemplate getMongoTemplate() {
        if (mongoTemplate == null) {
            System.out.println("MongoClientProvider: Creating new Mongo Client...");
            MongoClient client = MongoClients.create(
                    "mongodb+srv://ankit_mongodb_user:oiRvgDvLellC8ruD@mongodbcluster.0qemy0z.mongodb.net/whistleblower?appName=MongoDBCluster");
            mongoTemplate = new MongoTemplate(client, "whistleblower");
        }
        return mongoTemplate;
    }
}
