/**
 * PhotoOS Legal Configuration & Placeholder Registry
 * 
 * Version: 0.0.1
 * Effective Date: 1 November 2026
 * 
 * All placeholders are enclosed in [SQUARE BRACKETS] and marked with [CONFIRM WITH LAWYER].
 * Update these central values to reflect your company's official corporate details.
 */

export const LEGAL_CONFIG = {
  // Versioning & Dates
  version: "0.0.1",
  effectiveDate: "2026-11-01",
  effectiveDateFormattedEn: "1 November 2026",
  effectiveDateFormattedMr: "१ नोव्हेंबर २०२६",
  lastUpdatedEn: "28 October 2026",
  lastUpdatedMr: "२८ ऑक्टोबर २०२६",

  // Corporate & Entity Placeholders [CONFIRM WITH LAWYER]
  companyLegalName: "[PHOTOOS TECHNOLOGIES PRIVATE LIMITED]", // [CONFIRM WITH LAWYER]
  brandName: "PhotoOS",
  registeredAddress: "[SHOP NO. 4, BUILDING 12, PHOENIX PARADISE, SENAPATI BAPAT MARG, MUMBAI, MAHARASHTRA 400013, INDIA]", // [CONFIRM WITH LAWYER]
  cin: "[U72900MH2026PTC123456]", // [CONFIRM WITH LAWYER] Corporate Identification Number
  gstin: "[27AAAAA0000A1Z5]", // [CONFIRM WITH LAWYER] GSTIN

  // Contact & Communication
  supportEmail: "[support@photoos.in]", // [CONFIRM WITH LAWYER]
  legalEmail: "[legal@photoos.in]", // [CONFIRM WITH LAWYER]
  privacyEmail: "[privacy@photoos.in]", // [CONFIRM WITH LAWYER]
  websiteUrl: "https://photoos.in",
  appUrl: "https://app.photoos.in",

  // Grievance Officer & Statutory Appointments (IT Rules 2021 & DPDP Act 2023)
  grievanceOfficerName: "[MR. ADITYA VERMA]", // [CONFIRM WITH LAWYER]
  grievanceOfficerDesignation: "Grievance Officer & Data Protection Lead",
  grievanceOfficerEmail: "[grievance@photoos.in]", // [CONFIRM WITH LAWYER]
  grievanceOfficerPhone: "[+91 22 4567 8900]", // [CONFIRM WITH LAWYER]
  grievanceAddress: "[Grievance Redressal Cell, PhotoOS Technologies, Senapati Bapat Marg, Mumbai, Maharashtra 400013, India]", // [CONFIRM WITH LAWYER]

  // Data Protection Officer (DPDP Act 2023 Section 8 & Rules)
  dpoName: "[DR. SANJAY KULKARNI]", // [CONFIRM WITH LAWYER]
  dpoEmail: "[dpo@photoos.in]", // [CONFIRM WITH LAWYER]

  // Jurisdictional & Dispute Terms
  governingCountry: "India",
  governingState: "Maharashtra",
  governingCity: "[MUMBAI]", // [CONFIRM WITH LAWYER]
  arbitrationSeat: "[MUMBAI, MAHARASHTRA]", // [CONFIRM WITH LAWYER]
  exclusiveCourts: "[MUMBAI, MAHARASHTRA]", // [CONFIRM WITH LAWYER]

  // Platform Operational Metrics & Caps
  liabilityCapMonths: 12, // [CONFIRM WITH LAWYER] Fees paid in preceding N months
  liabilityFixedCapINR: 10000, // [CONFIRM WITH LAWYER] Cap amount
  defaultPhotoRetentionDays: 90, // [CONFIRM WITH LAWYER] Free retention window
  dataRightsResponseDays: 30, // Statutory 30-day timeline under DPDP Act
  grievanceAckHours: 48, // Statutory 48-hour acknowledgement under IT Rules 2021
  grievanceResolutionDays: 30, // Statutory 1-month resolution window

  // Document Conflict Resolution Notice
  conflictNoticeEn: "In case of conflict between languages, the English version prevails.",
  conflictNoticeMr: "भाषांमध्ये तफावत आढळल्यास इंग्रजी आवृत्ती ग्राह्य धरली जाईल.",

  // Changelog
  changelog: [
    {
      version: "0.0.1",
      date: "2026-11-01",
      summaryEn: "Initial public legal release with full DPDP Act 2023 compliance, IT Intermediary Guidelines 2021 rules, bilingual English/Marathi support, and explicit facial vector biometric consents.",
      summaryMr: "डिजिटल वैयक्तिक डेटा संरक्षण कायदा (DPDP) २०२३, माहिती तंत्रज्ञान मध्यस्थ मार्गदर्शक तत्त्वे २०२१ आणि द्विभाषिक मराठी/इंग्रजी करारांसह पहिली अधिकृत आवृत्ती.",
    },
  ],
} as const;

export type LegalConfigType = typeof LEGAL_CONFIG;

