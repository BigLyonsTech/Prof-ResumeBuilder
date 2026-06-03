package com.profresumebuilder.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB Configuration
 *
 * @EnableMongoAuditing  → activates @CreatedDate and @LastModifiedDate
 *                         so timestamps are auto-filled by Spring
 * @EnableMongoRepositories → scans for all MongoRepository interfaces
 */
@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.profresumebuilder.repository")
public class MongoConfig {
}
