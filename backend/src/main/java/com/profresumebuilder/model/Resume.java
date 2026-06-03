package com.profresumebuilder.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Root MongoDB document — stored in ProfResumeBuilder.resumes collection.
 *
 * Unlike JPA where data is split across 6 tables,
 * MongoDB stores the ENTIRE resume as one document:
 * {
 *   "_id": "ObjectId",
 *   "title": "My Resume",
 *   "personalInfo": { ... },
 *   "experiences": [ {...}, {...} ],
 *   "educations":  [ {...} ],
 *   "skills":      [ {...} ],
 *   "signature":   { ... }
 * }
 */
@Document(collection = "resumes")
public class Resume {

    @Id
    private String id;                      // MongoDB ObjectId (String, not Long)

    @NotBlank(message = "Resume title is required")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    @Indexed                                // Adds MongoDB index for faster title search
    private String title;

    @Valid
    private PersonalInfo personalInfo;      // Embedded document

    @Valid
    private List<Experience> experiences = new ArrayList<>();  // Embedded array

    @Valid
    private List<Education> educations = new ArrayList<>();    // Embedded array

    @Valid
    private List<Skill> skills = new ArrayList<>();            // Embedded array

    @Valid
    private Signature signature;            // Embedded document

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Resume() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public PersonalInfo getPersonalInfo() { return personalInfo; }
    public void setPersonalInfo(PersonalInfo personalInfo) { this.personalInfo = personalInfo; }
    public List<Experience> getExperiences() { return experiences; }
    public void setExperiences(List<Experience> experiences) { this.experiences = experiences; }
    public List<Education> getEducations() { return educations; }
    public void setEducations(List<Education> educations) { this.educations = educations; }
    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }
    public Signature getSignature() { return signature; }
    public void setSignature(Signature signature) { this.signature = signature; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
