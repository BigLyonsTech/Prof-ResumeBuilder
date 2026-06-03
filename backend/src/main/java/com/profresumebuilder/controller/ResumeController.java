package com.profresumebuilder.controller;

import com.profresumebuilder.model.*;
import com.profresumebuilder.service.ResumeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller — all endpoints under /api/resumes
 *
 * With MongoDB, the resume is ONE document, so we have
 * section-specific endpoints that patch just that section.
 */
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private static final Logger log = LoggerFactory.getLogger(ResumeController.class);
    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // ── Resume CRUD ────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Resume> createResume(@RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "My Resume");
        return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.createResume(title));
    }

    @GetMapping
    public ResponseEntity<List<Resume>> getAllResumes(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty())
            return ResponseEntity.ok(resumeService.searchByTitle(search.trim()));
        return ResponseEntity.ok(resumeService.getAllResumes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResume(@PathVariable String id) {
        return ResponseEntity.ok(resumeService.getResumeById(id));
    }

    @PutMapping("/{id}/title")
    public ResponseEntity<Resume> updateTitle(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(resumeService.updateTitle(id, body.get("title")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable String id) {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }

    // ── Full Resume Save (all sections at once) ────────────

    @PutMapping("/{id}")
    public ResponseEntity<Resume> saveFullResume(@PathVariable String id, @RequestBody Resume resume) {
        return ResponseEntity.ok(resumeService.saveFullResume(id, resume));
    }

    // ── Personal Info ──────────────────────────────────────

    @PutMapping("/{id}/personal-info")
    public ResponseEntity<Resume> savePersonalInfo(
            @PathVariable String id, @Valid @RequestBody PersonalInfo info) {
        return ResponseEntity.ok(resumeService.savePersonalInfo(id, info));
    }

    // ── Experiences ────────────────────────────────────────

    @PutMapping("/{id}/experiences")
    public ResponseEntity<Resume> saveExperiences(
            @PathVariable String id, @RequestBody List<@Valid Experience> experiences) {
        return ResponseEntity.ok(resumeService.saveExperiences(id, experiences));
    }

    @PostMapping("/{id}/experiences")
    public ResponseEntity<Resume> addExperience(
            @PathVariable String id, @Valid @RequestBody Experience experience) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.addExperience(id, experience));
    }

    @DeleteMapping("/{id}/experiences/{index}")
    public ResponseEntity<Resume> removeExperience(@PathVariable String id, @PathVariable int index) {
        return ResponseEntity.ok(resumeService.removeExperience(id, index));
    }

    // ── Educations ─────────────────────────────────────────

    @PutMapping("/{id}/educations")
    public ResponseEntity<Resume> saveEducations(
            @PathVariable String id, @RequestBody List<@Valid Education> educations) {
        return ResponseEntity.ok(resumeService.saveEducations(id, educations));
    }

    @PostMapping("/{id}/educations")
    public ResponseEntity<Resume> addEducation(
            @PathVariable String id, @Valid @RequestBody Education education) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.addEducation(id, education));
    }

    @DeleteMapping("/{id}/educations/{index}")
    public ResponseEntity<Resume> removeEducation(@PathVariable String id, @PathVariable int index) {
        return ResponseEntity.ok(resumeService.removeEducation(id, index));
    }

    // ── Skills ─────────────────────────────────────────────

    @PutMapping("/{id}/skills")
    public ResponseEntity<Resume> saveSkills(
            @PathVariable String id, @RequestBody List<@Valid Skill> skills) {
        return ResponseEntity.ok(resumeService.saveSkills(id, skills));
    }

    // ── Signature ──────────────────────────────────────────

    @PutMapping("/{id}/signature")
    public ResponseEntity<Resume> saveSignature(
            @PathVariable String id, @Valid @RequestBody Signature signature) {
        return ResponseEntity.ok(resumeService.saveSignature(id, signature));
    }

    @DeleteMapping("/{id}/signature")
    public ResponseEntity<Resume> removeSignature(@PathVariable String id) {
        return ResponseEntity.ok(resumeService.removeSignature(id));
    }
}
