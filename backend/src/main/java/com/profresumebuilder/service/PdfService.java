package com.profresumebuilder.service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.profresumebuilder.exception.ValidationException;
import com.profresumebuilder.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;

@Service
public class PdfService {

    private static final Logger log = LoggerFactory.getLogger(PdfService.class);
    private static final DeviceRgb PRIMARY   = new DeviceRgb(30, 64, 175);
    private static final DeviceRgb SECONDARY = new DeviceRgb(71, 85, 105);
    private static final DeviceRgb ACCENT    = new DeviceRgb(219, 234, 254);
    private static final DeviceRgb TEXT      = new DeviceRgb(15, 23, 42);
    private static final DeviceRgb MUTED     = new DeviceRgb(100, 116, 139);
    private static final DeviceRgb LIGHT_BG  = new DeviceRgb(248, 250, 252);

    private final ResumeService resumeService;

    public PdfService(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    public byte[] generateResumePdf(String resumeId) {
        log.info("Generating PDF for resume: {}", resumeId);
        Resume resume = resumeService.getResumeById(resumeId);
        if (resume.getPersonalInfo() == null)
            throw new ValidationException("Cannot generate PDF: Personal info is missing.");
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfDocument pdf = new PdfDocument(new PdfWriter(out));
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 50, 40, 50);

            PdfFont regular = PdfFontFactory.createFont("Helvetica");
            PdfFont bold    = PdfFontFactory.createFont("Helvetica-Bold");
            PdfFont italic  = PdfFontFactory.createFont("Helvetica-Oblique");

            addHeader(doc, resume.getPersonalInfo(), bold, regular, italic);
            addDivider(doc);
            addSummary(doc, resume.getPersonalInfo(), regular, bold);

            if (resume.getExperiences() != null && !resume.getExperiences().isEmpty()) {
                addSectionTitle(doc, "Work Experience", bold);
                resume.getExperiences().forEach(e -> addExperience(doc, e, regular, bold, italic));
            }
            if (resume.getEducations() != null && !resume.getEducations().isEmpty()) {
                addSectionTitle(doc, "Education", bold);
                resume.getEducations().forEach(e -> addEducation(doc, e, regular, bold, italic));
            }
            if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
                addSectionTitle(doc, "Skills", bold);
                addSkills(doc, resume.getSkills(), regular, bold);
            }
            if (resume.getSignature() != null) {
                try { addSignature(doc, resume.getSignature(), regular, bold, italic); }
                catch (Exception e) { log.warn("Signature render failed: {}", e.getMessage()); }
            }

            doc.close();
            log.info("PDF generated — {} bytes", out.size());
            return out.toByteArray();
        } catch (ValidationException ve) {
            throw ve;
        } catch (Exception e) {
            log.error("PDF generation error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF.", e);
        }
    }

    private void addHeader(Document doc, PersonalInfo p, PdfFont bold, PdfFont regular, PdfFont italic) throws Exception {
        doc.add(new Paragraph(p.getFullName()).setFont(bold).setFontSize(26)
                .setFontColor(PRIMARY).setTextAlignment(TextAlignment.CENTER).setMarginBottom(4));
        StringBuilder contact = new StringBuilder(p.getPhone()).append("  |  ").append(p.getEmail());
        if (p.getAddress() != null && !p.getAddress().isBlank()) contact.append("  |  ").append(p.getAddress());
        doc.add(new Paragraph(contact.toString()).setFont(regular).setFontSize(9)
                .setFontColor(SECONDARY).setTextAlignment(TextAlignment.CENTER).setMarginBottom(3));
        StringBuilder links = new StringBuilder();
        if (p.getLinkedIn() != null && !p.getLinkedIn().isBlank()) links.append(p.getLinkedIn());
        if (p.getGithub() != null && !p.getGithub().isBlank()) { if (!links.isEmpty()) links.append("  |  "); links.append(p.getGithub()); }
        if (p.getPortfolio() != null && !p.getPortfolio().isBlank()) { if (!links.isEmpty()) links.append("  |  "); links.append(p.getPortfolio()); }
        if (!links.isEmpty())
            doc.add(new Paragraph(links.toString()).setFont(italic).setFontSize(9)
                    .setFontColor(PRIMARY).setTextAlignment(TextAlignment.CENTER).setMarginBottom(6));
    }

    private void addDivider(Document doc) {
        Table t = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER).setMarginBottom(10);
        t.addCell(new Cell().setBorderBottom(new SolidBorder(PRIMARY, 2))
                .setBorderTop(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER));
        doc.add(t);
    }

    private void addSectionTitle(Document doc, String title, PdfFont bold) {
        doc.add(new Paragraph(title.toUpperCase()).setFont(bold).setFontSize(11)
                .setFontColor(PRIMARY).setMarginTop(12).setMarginBottom(2)
                .setBorderBottom(new SolidBorder(ACCENT, 1.5f)));
    }

    private void addSummary(Document doc, PersonalInfo p, PdfFont regular, PdfFont bold) {
        addSectionTitle(doc, "Professional Summary", bold);
        doc.add(new Paragraph(p.getSummary()).setFont(regular).setFontSize(10)
                .setFontColor(TEXT).setTextAlignment(TextAlignment.JUSTIFIED).setMarginBottom(4));
    }

    private void addExperience(Document doc, Experience exp, PdfFont regular, PdfFont bold, PdfFont italic) {
        Table t = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER).setMarginTop(6);
        t.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(exp.getJobTitle()).setFont(bold).setFontSize(10).setFontColor(TEXT).setMarginBottom(1))
                .add(new Paragraph(exp.getCompany()).setFont(italic).setFontSize(9).setFontColor(SECONDARY)));
        String end = exp.isCurrentlyWorking() ? "Present" : (exp.getEndDate() != null ? exp.getEndDate() : "");
        t.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(exp.getStartDate() + " – " + end)
                        .setFont(italic).setFontSize(9).setFontColor(MUTED).setTextAlignment(TextAlignment.RIGHT)));
        doc.add(t);
        doc.add(new Paragraph(exp.getDescription()).setFont(regular).setFontSize(9.5f)
                .setFontColor(TEXT).setTextAlignment(TextAlignment.JUSTIFIED)
                .setMarginTop(3).setMarginBottom(4).setMarginLeft(8));
    }

    private void addEducation(Document doc, Education edu, PdfFont regular, PdfFont bold, PdfFont italic) {
        Table t = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER).setMarginTop(6);
        t.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(edu.getDegree() + " in " + edu.getFieldOfStudy())
                        .setFont(bold).setFontSize(10).setFontColor(TEXT).setMarginBottom(1))
                .add(new Paragraph(edu.getSchool()).setFont(italic).setFontSize(9).setFontColor(SECONDARY)));
        String endStr = edu.isCurrentlyStudying() ? "Present" : String.valueOf(edu.getEndYear());
        String gpa = edu.getGpa() != null ? "\nGPA: " + edu.getGpa() : "";
        t.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(edu.getStartYear() + " – " + endStr + gpa)
                        .setFont(italic).setFontSize(9).setFontColor(MUTED).setTextAlignment(TextAlignment.RIGHT)));
        doc.add(t);
    }

    private void addSkills(Document doc, List<Skill> skills, PdfFont regular, PdfFont bold) {
        int cols = 3;
        Table t = new Table(UnitValue.createPercentArray(new float[]{33.33f, 33.33f, 33.33f}))
                .setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER).setMarginTop(4);
        for (Skill sk : skills) {
            t.addCell(new Cell().setBorder(new SolidBorder(ACCENT, 1))
                    .setBackgroundColor(LIGHT_BG).setPadding(6).setMargin(3)
                    .add(new Paragraph(sk.getName()).setFont(bold).setFontSize(9).setFontColor(TEXT).setMarginBottom(1))
                    .add(new Paragraph(formatLevel(sk.getProficiencyLevel())).setFont(regular).setFontSize(8).setFontColor(PRIMARY)));
        }
        int rem = skills.size() % cols;
        if (rem != 0) for (int i = 0; i < cols - rem; i++) t.addCell(new Cell().setBorder(Border.NO_BORDER));
        doc.add(t);
    }

    private void addSignature(Document doc, Signature sig, PdfFont regular, PdfFont bold, PdfFont italic) throws Exception {
        doc.add(new Paragraph("\n").setMarginTop(20));
        addDivider(doc);
        doc.add(new Paragraph("Signature").setFont(bold).setFontSize(9).setFontColor(MUTED).setMarginBottom(6));
        if (sig.getSignatureType() == SignatureType.TYPED) {
            doc.add(new Paragraph(sig.getSignatoryName()).setFont(italic).setFontSize(22)
                    .setFontColor(PRIMARY).setMarginBottom(2));
        } else if (sig.getSignatureType() == SignatureType.IMAGE) {
            String data = sig.getImageData();
            if (data.startsWith("data:image")) data = data.split(",", 2)[1];
            Image img = new Image(ImageDataFactory.create(Base64.getDecoder().decode(data)))
                    .setWidth(160).setHeight(60).setHorizontalAlignment(HorizontalAlignment.LEFT);
            doc.add(img);
            if (sig.getSignatoryName() != null && !sig.getSignatoryName().isBlank())
                doc.add(new Paragraph(sig.getSignatoryName()).setFont(italic).setFontSize(10)
                        .setFontColor(SECONDARY).setMarginTop(2));
        }
        if (sig.isShowDate() && sig.getDateLabel() != null)
            doc.add(new Paragraph(sig.getDateLabel()).setFont(regular).setFontSize(9)
                    .setFontColor(MUTED).setMarginTop(2));
    }

    private String formatLevel(ProficiencyLevel l) {
        return switch (l) {
            case BEGINNER -> "⬤○○○ Beginner";
            case INTERMEDIATE -> "⬤⬤○○ Intermediate";
            case ADVANCED -> "⬤⬤⬤○ Advanced";
            case EXPERT -> "⬤⬤⬤⬤ Expert";
        };
    }
}
