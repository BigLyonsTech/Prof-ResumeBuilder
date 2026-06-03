package com.profresumebuilder.model;

import jakarta.validation.constraints.*;

/**
 * Embedded document — stored as array inside Resume.
 */
public class Education {

    @NotBlank(message = "School name is required")
    @Size(min = 2, max = 150)
    @Pattern(regexp = "^[a-zA-Z0-9\\s&,'.()\"-]+$",
             message = "School name contains invalid characters")
    private String school;

    @NotBlank(message = "Degree is required")
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[a-zA-Z\\s.]+$", message = "Degree must contain letters only")
    private String degree;

    @NotBlank(message = "Field of study is required")
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[a-zA-Z\\s&,'.()\"-]+$",
             message = "Field of study contains invalid characters")
    private String fieldOfStudy;

    @NotNull(message = "Start year is required")
    @Min(value = 1950, message = "Start year must be 1950 or later")
    @Max(value = 2100, message = "Start year is not valid")
    private Integer startYear;

    @Min(value = 1950) @Max(value = 2100)
    private Integer endYear;

    @DecimalMin(value = "0.0", message = "GPA must be at least 0.0")
    @DecimalMax(value = "4.0", message = "GPA must not exceed 4.0")
    private Double gpa;

    private boolean currentlyStudying = false;

    public Education() {}

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public String getFieldOfStudy() { return fieldOfStudy; }
    public void setFieldOfStudy(String fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }
    public Integer getStartYear() { return startYear; }
    public void setStartYear(Integer startYear) { this.startYear = startYear; }
    public Integer getEndYear() { return endYear; }
    public void setEndYear(Integer endYear) { this.endYear = endYear; }
    public Double getGpa() { return gpa; }
    public void setGpa(Double gpa) { this.gpa = gpa; }
    public boolean isCurrentlyStudying() { return currentlyStudying; }
    public void setCurrentlyStudying(boolean currentlyStudying) { this.currentlyStudying = currentlyStudying; }
}
