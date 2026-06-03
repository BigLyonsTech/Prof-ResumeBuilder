package com.profresumebuilder.controller;

import com.profresumebuilder.service.PdfService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes")
public class PdfController {

    private static final Logger log = LoggerFactory.getLogger(PdfController.class);
    private final PdfService pdfService;

    public PdfController(PdfService pdfService) { this.pdfService = pdfService; }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String id) {
        log.info("PDF requested for resume: {}", id);
        byte[] pdf = pdfService.generateResumePdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "resume-" + id + ".pdf");
        headers.setContentLength(pdf.length);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
