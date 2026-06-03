package com.profresumebuilder.model;

import jakarta.validation.constraints.*;

/**
 * Embedded document — stored as array inside Resume.
 */
public class Skill {

    @NotBlank(message = "Skill name is required")
    @Size(min = 1, max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9\\s#+.()/\\-]+$",
             message = "Skill name contains invalid characters")
    private String name;

    @NotNull(message = "Proficiency level is required")
    private ProficiencyLevel proficiencyLevel;

    public Skill() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ProficiencyLevel getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(ProficiencyLevel proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
}
