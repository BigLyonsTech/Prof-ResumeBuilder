package com.profresumebuilder.service;

import com.profresumebuilder.exception.ResourceNotFoundException;
import com.profresumebuilder.exception.ValidationException;
import com.profresumebuilder.model.*;
import com.profresumebuilder.repository.ResumeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Core service — handles all Resume CRUD and validation.
 *
 * With MongoDB, all sections (personalInfo, experiences, etc.)
 * are updated directly on the Resume document — no child
 * repositories needed. One save() call persists everything.
 */
@Service
public class ResumeService {

    private static final Logger log = LoggerFactory.getLogger(ResumeService.class);
    private final ResumeRepository resumeRepository;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    // ── Resume CRUD ──────────────────────────────────────────

    public Resume createResume(String title) {
        if (title == null || title.trim().length() < 2)
            throw new ValidationException("Resume title must be at least 2 characters");
        Resume resume = new Resume();
        resume.setTitle(title.trim());
        Resume saved = resumeRepository.save(resume);
        log.info("Resume created: {}", saved.getId());
        return saved;
    }

    public List<Resume> getAllResumes() { return resumeRepository.findAll(); }

    public Resume getResumeById(String id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));
    }

    public List<Resume> searchByTitle(String keyword) {
        return resumeRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public Resume updateTitle(String id, String title) {
        Resume resume = getResumeById(id);
        if (title == null || title.trim().length() < 2)
            throw new ValidationException("Resume title must be at least 2 characters");
        resume.setTitle(title.trim());
        return resumeRepository.save(resume);
    }

    public void deleteResume(String id) {
        resumeRepository.delete(getResumeById(id));
        log.info("Resume deleted: {}", id);
    }

    // ── Personal Info ────────────────────────────────────────

    public Resume savePersonalInfo(String id, PersonalInfo info) {
        Resume resume = getResumeById(id);
        validateUrls(info);
        resume.setPersonalInfo(info);
        return resumeRepository.save(resume);
    }

    // ── Experiences ──────────────────────────────────────────

    public Resume saveExperiences(String id, List<Experience> experiences) {
        Resume resume = getResumeById(id);
        experiences.forEach(this::validateExperience);
        resume.setExperiences(experiences);
        return resumeRepository.save(resume);
    }

    public Resume addExperience(String id, Experience experience) {
        Resume resume = getResumeById(id);
        validateExperience(experience);
        if (resume.getExperiences() == null) resume.setExperiences(new ArrayList<>());
        resume.getExperiences().add(experience);
        return resumeRepository.save(resume);
    }

    public Resume removeExperience(String id, int index) {
        Resume resume = getResumeById(id);
        if (resume.getExperiences() == null || index >= resume.getExperiences().size())
            throw new ValidationException("Experience at index " + index + " not found");
        resume.getExperiences().remove(index);
        return resumeRepository.save(resume);
    }

    // ── Educations ───────────────────────────────────────────

    public Resume saveEducations(String id, List<Education> educations) {
        Resume resume = getResumeById(id);
        educations.forEach(this::validateEducation);
        resume.setEducations(educations);
        return resumeRepository.save(resume);
    }

    public Resume addEducation(String id, Education education) {
        Resume resume = getResumeById(id);
        validateEducation(education);
        if (resume.getEducations() == null) resume.setEducations(new ArrayList<>());
        resume.getEducations().add(education);
        return resumeRepository.save(resume);
    }

    public Resume removeEducation(String id, int index) {
        Resume resume = getResumeById(id);
        if (resume.getEducations() == null || index >= resume.getEducations().size())
            throw new ValidationException("Education at index " + index + " not found");
        resume.getEducations().remove(index);
        return resumeRepository.save(resume);
    }

    // ── Skills ───────────────────────────────────────────────

    public Resume saveSkills(String id, List<Skill> skills) {
        Resume resume = getResumeById(id);
        validateSkills(skills);
        // Normalize names to Title Case
        skills.forEach(s -> s.setName(normalizeName(s.getName())));
        resume.setSkills(skills);
        return resumeRepository.save(resume);
    }

    // ── Signature ────────────────────────────────────────────

    public Resume saveSignature(String id, Signature signature) {
        Resume resume = getResumeById(id);
        validateSignature(signature);
        if (signature.isShowDate() && (signature.getDateLabel() == null || signature.getDateLabel().isBlank()))
            signature.setDateLabel(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")));
        resume.setSignature(signature);
        return resumeRepository.save(resume);
    }

    public Resume removeSignature(String id) {
        Resume resume = getResumeById(id);
        resume.setSignature(null);
        return resumeRepository.save(resume);
    }

    // ── Full Resume Save (all sections at once) ──────────────

    public Resume saveFullResume(String id, Resume incoming) {
        Resume resume = getResumeById(id);
        if (incoming.getTitle() != null) resume.setTitle(incoming.getTitle());
        if (incoming.getPersonalInfo() != null) {
            validateUrls(incoming.getPersonalInfo());
            resume.setPersonalInfo(incoming.getPersonalInfo());
        }
        if (incoming.getExperiences() != null) {
            incoming.getExperiences().forEach(this::validateExperience);
            resume.setExperiences(incoming.getExperiences());
        }
        if (incoming.getEducations() != null) {
            incoming.getEducations().forEach(this::validateEducation);
            resume.setEducations(incoming.getEducations());
        }
        if (incoming.getSkills() != null) {
            validateSkills(incoming.getSkills());
            incoming.getSkills().forEach(s -> s.setName(normalizeName(s.getName())));
            resume.setSkills(incoming.getSkills());
        }
        if (incoming.getSignature() != null) {
            validateSignature(incoming.getSignature());
            resume.setSignature(incoming.getSignature());
        }
        return resumeRepository.save(resume);
    }

    // ── Private Validators ───────────────────────────────────

    private void validateUrls(PersonalInfo info) {
        if (info.getLinkedIn() != null && !info.getLinkedIn().isBlank()
                && !info.getLinkedIn().toLowerCase().contains("linkedin.com"))
            throw new ValidationException("LinkedIn URL must be a valid LinkedIn link");
        if (info.getGithub() != null && !info.getGithub().isBlank()
                && !info.getGithub().toLowerCase().contains("github.com"))
            throw new ValidationException("GitHub URL must be a valid GitHub link");
    }

    private void validateExperience(Experience e) {
        if (!e.isCurrentlyWorking() && (e.getEndDate() == null || e.getEndDate().isBlank()))
            throw new ValidationException("End date is required, or set 'currentlyWorking' to true.");
        if (e.isCurrentlyWorking() && e.getEndDate() != null && !e.getEndDate().isBlank())
            throw new ValidationException("End date should not be set when 'currentlyWorking' is true.");
        if (e.getDescription() != null && e.getDescription().trim().length() < 20)
            throw new ValidationException("Job description must be at least 20 characters.");
    }

    private void validateEducation(Education e) {
        int currentYear = Year.now().getValue();
        if (e.getStartYear() > currentYear)
            throw new ValidationException("Start year cannot be in the future.");
        if (!e.isCurrentlyStudying() && e.getEndYear() == null)
            throw new ValidationException("End year is required, or set 'currentlyStudying' to true.");
        if (e.getEndYear() != null && e.getEndYear() < e.getStartYear())
            throw new ValidationException("End year cannot be before start year.");
        if (e.getGpa() != null && (e.getGpa() < 0.0 || e.getGpa() > 4.0))
            throw new ValidationException("GPA must be between 0.0 and 4.0.");
    }

    private void validateSkills(List<Skill> skills) {
        List<String> seen = new ArrayList<>();
        for (Skill s : skills) {
            String name = normalizeName(s.getName());
            if (seen.stream().anyMatch(n -> n.equalsIgnoreCase(name)))
                throw new ValidationException("Duplicate skill: '" + name + "'");
            seen.add(name);
        }
    }

    private void validateSignature(Signature sig) {
        if (sig.getSignatureType() == SignatureType.TYPED) {
            if (sig.getSignatoryName() == null || sig.getSignatoryName().isBlank())
                throw new ValidationException("Signatory name is required for a TYPED signature.");
        } else if (sig.getSignatureType() == SignatureType.IMAGE) {
            if (sig.getImageData() == null || sig.getImageData().isBlank())
                throw new ValidationException("Image data is required for an IMAGE signature.");
        }
    }

    private String normalizeName(String name) {
        if (name == null) return null;
        String[] words = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(Character.toUpperCase(w.charAt(0)));
            if (w.length() > 1) sb.append(w.substring(1).toLowerCase());
        }
        return sb.toString();
    }
}
