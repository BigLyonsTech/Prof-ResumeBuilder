package com.profresumebuilder.model;

import jakarta.validation.constraints.*;

/**
 * Embedded document — stored inside Resume.
 */
public class Signature {

    @NotNull(message = "Signature type is required (TYPED or IMAGE)")
    private SignatureType signatureType;

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(regexp = "^$|^[a-zA-Z\\s''\\-]+$",
             message = "Name must contain letters only")
    private String signatoryName;

    private String imageData;

    @Size(max = 50)
    private String dateLabel;

    private boolean showDate = true;

    public Signature() {}

    public SignatureType getSignatureType() { return signatureType; }
    public void setSignatureType(SignatureType signatureType) { this.signatureType = signatureType; }
    public String getSignatoryName() { return signatoryName; }
    public void setSignatoryName(String signatoryName) { this.signatoryName = signatoryName; }
    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }
    public String getDateLabel() { return dateLabel; }
    public void setDateLabel(String dateLabel) { this.dateLabel = dateLabel; }
    public boolean isShowDate() { return showDate; }
    public void setShowDate(boolean showDate) { this.showDate = showDate; }
}
