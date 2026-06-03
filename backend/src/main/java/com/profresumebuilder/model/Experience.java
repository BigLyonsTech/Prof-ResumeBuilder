package com.profresumebuilder.model;

import jakarta.validation.constraints.*;

/**
 * Embedded document — stored as array inside Resume.
 */
public class Experience {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 150)
    @Pattern(regexp = "^[a-zA-Z0-9\\s&,'.()\"-]+$",
             message = "Company name contains invalid characters")
    private String company;

    @NotBlank(message = "Job title is required")
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[a-zA-Z\\s&,'.()\"-]+$", message = "Job title must contain letters only")
    private String jobTitle;

    @NotBlank(message = "Job description is required")
    @Size(min = 20, max = 1000, message = "Description must be between 20 and 1000 characters")
    private String description;

    @NotBlank(message = "Start date is required")
    private String startDate;

    private String endDate;

    private boolean currentlyWorking = false;

    public Experience() {}

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public boolean isCurrentlyWorking() { return currentlyWorking; }
    public void setCurrentlyWorking(boolean currentlyWorking) { this.currentlyWorking = currentlyWorking; }
}
