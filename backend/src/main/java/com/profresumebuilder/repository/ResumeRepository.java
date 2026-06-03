package com.profresumebuilder.repository;

import com.profresumebuilder.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB repository.
 * MongoRepository<Resume, String>:
 *   Resume → the document type
 *   String → the ID type (MongoDB ObjectId stored as String)
 *
 * All CRUD methods are auto-generated — no SQL needed.
 */
@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {

    // Find resumes whose title contains the keyword (case-insensitive)
    // MongoDB regex query — equivalent to SQL LIKE %keyword%
    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    List<Resume> findByTitleContainingIgnoreCase(String keyword);

    // Find resumes by the applicant's email inside the embedded personalInfo
    @Query("{ 'personalInfo.email': ?0 }")
    List<Resume> findByPersonalInfoEmail(String email);
}
