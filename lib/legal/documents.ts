import { LEGAL_CONFIG } from "@/config/legal";

export type LegalDocumentType = "terms_of_service" | "privacy_policy" | "platform_agreement";
export type LegalLanguage = "en" | "mr";

export interface LegalDocumentMetadata {
  type: LegalDocumentType;
  titleEn: string;
  titleMr: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  summaryEn: string[];
  summaryMr: string[];
}

export const LEGAL_METADATA: Record<LegalDocumentType, LegalDocumentMetadata> = {
  terms_of_service: {
    type: "terms_of_service",
    titleEn: "Terms of Service",
    titleMr: "सेवा अटी आणि नियम",
    version: LEGAL_CONFIG.version,
    effectiveDate: LEGAL_CONFIG.effectiveDateFormattedEn,
    lastUpdated: LEGAL_CONFIG.lastUpdatedEn,
    summaryEn: [
      `PhotoOS is a photography studio software and marketplace technology intermediary operated by ${LEGAL_CONFIG.companyLegalName}.`,
      "You must be 18 years or older to register an account. Minors may use client features only under verifiable parental or guardian supervision.",
      "Studios and Photographers retain 100% intellectual property rights and copyright in their photographs and creative deliverables.",
      "We never store payment card, net banking, or UPI PIN credentials. All monetary transactions are processed through RBI-authorized payment gateways.",
      "PhotoOS provides the platform 'as is'. Disputes between Photographers and Clients must be resolved between those parties under the Platform Agreement.",
    ],
    summaryMr: [
      `PhotoOS हे फोटोग्राफी स्टुडिओ आणि मार्केटप्लेससाठी तंत्रज्ञान मध्यस्थ (Intermediary) व्यासपीठ आहे, ज्याचे संचालन ${LEGAL_CONFIG.companyLegalName} द्वारे केले जाते.`,
      "खाते नोंदणीसाठी तुमचे वय १८ वर्षे पूर्ण असणे आवश्यक आहे. अल्पवयीन व्यक्ती केवळ पालकांच्या देखरेखीखालीच सेवा वापरू शकतात.",
      "फोटोग्राफर्स आणि स्टुडिओज त्यांच्या मूळ फोटोंवर १००% कॉपीराइट अधिकार स्वतःकडे ठेवतात.",
      "आम्ही युझर्सचे बँक कार्ड, नेट बँकिंग किंवा UPI पिन तपशील कधीही साठवत नाही. सर्व व्यवहार RBI मान्यताप्राप्त पेमेंट गेटवेद्वारे होतात.",
      "फोटोग्राफर आणि ग्राहक यांच्यातील सेवा करारासाठी PhotoOS पक्षकार नाही; उभय पक्षांमधील वाद प्लॅटफॉर्म करारातील नियमांनुसार सोडवले जातील.",
    ],
  },
  privacy_policy: {
    type: "privacy_policy",
    titleEn: "Privacy Policy & Data Protection Notice",
    titleMr: "गोपनीयता धोरण आणि डेटा संरक्षण सूचना",
    version: LEGAL_CONFIG.version,
    effectiveDate: LEGAL_CONFIG.effectiveDateFormattedEn,
    lastUpdated: LEGAL_CONFIG.lastUpdatedEn,
    summaryEn: [
      `PhotoOS acts as a Data Fiduciary under India's Digital Personal Data Protection Act, 2023 (DPDP Act) for the platform services we deliver directly to you. Photographers act as independent Data Fiduciaries for data they collect during shoots.`,
      "We collect account details, booking metadata, and event photos. We never store debit/credit card numbers, CVVs, or UPI PINs.",
      "Facial Recognition / Vector Data is 100% Opt-In: Face-matching is an optional convenience tool to help event guests find their photos. Face vectors are stored temporarily, never sold, never used for behavioral advertising or public training, and can be deleted at any time with a single click.",
      "You have the statutory right under the DPDP Act 2023 to access, correct, erase your personal data, nominate a representative, or lodge a complaint with our Grievance Officer or the Data Protection Board of India.",
    ],
    summaryMr: [
      "PhotoOS हे भारताच्या डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (DPDP Act) अंतर्गत डेटा फिड्युशियरी (Data Fiduciary) म्हणून काम करते.",
      "आम्ही तुमचे नाव, संपर्क, बुकिंग तपशील आणि फोटो सुरक्षित ठेवतो. आम्ही कधीही बँक कार्ड क्रमांक, CVV किंवा UPI पिन साठवत नाही.",
      "फेस-सर्च (चेहऱ्यावरून फोटो शोधणे) १००% ऐच्छिक आहे. चेहऱ्याचे गणितीय निर्देशक तात्पुरते सेव्ह केले जातात, ते कोणालाही विकले जात नाहीत, जाहिरातींसाठी वापरले जात नाहीत आणि कधीही डिलीट करता येतात.",
      "DPDP कायदा २०२३ अंतर्गत तुम्हाला तुमचा डेटा पाहण्याचा, दुरुस्त करण्याचा, डिलीट करण्याचा, प्रतिनिधी नेमण्याचा आणि भारतीय डेटा संरक्षण मंडळाकडे तक्रार करण्याचा पूर्ण अधिकार आहे.",
    ],
  },
  platform_agreement: {
    type: "platform_agreement",
    titleEn: "Tripartite Platform Agreement",
    titleMr: "त्रिपक्षीय प्लॅटफॉर्म करार",
    version: LEGAL_CONFIG.version,
    effectiveDate: LEGAL_CONFIG.effectiveDateFormattedEn,
    lastUpdated: LEGAL_CONFIG.lastUpdatedEn,
    summaryEn: [
      "Intermediary Status: PhotoOS is solely a technology platform and marketplace intermediary within the meaning of Section 79 of the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020.",
      "Independent Direct Service Contract: The contract for photography services, event shoots, and creative deliverables is entered into directly and exclusively between the Client and the Photographer. PhotoOS is NOT a party to that service contract.",
      "No Liability for Service Failures: PhotoOS is not responsible or liable if a Photographer cancels, delivers late, produces poor quality images, or fails to perform. Photographers are solely responsible for their craft, deliverables, equipment, and statutory tax compliance.",
      "No Liability for Payment Defaults: PhotoOS is not responsible or liable if a Client defaults, delays payment, initiates an unjustified bank chargeback, or commits fraud against a Photographer.",
      "Payment Facilitation: Payments are processed through RBI-authorized payment aggregators. PhotoOS acts strictly as a commercial payment-facilitating intermediary and is not a bank, NBFC, or escrow guarantor.",
    ],
    summaryMr: [
      "तंत्रज्ञान मध्यस्थ: PhotoOS हे माहिती तंत्रज्ञान कायदा, २००० चे कलम ७९ आणि ग्राहक संरक्षण (ई-कॉमर्स) नियम, २०२० अंतर्गत केवळ एक तंत्रज्ञान मध्यस्थ व्यासपीठ आहे.",
      "स्वतंत्र थेट सेवा करार: फोटोग्राफी कव्हरेज आणि डिलिव्हरीचा करार हा थेट आणि केवळ ग्राहक (Client) आणि फोटोग्राफर (Photographer) यांच्यात होतो. PhotoOS त्या सेवा कराराचा पक्षकार नाही.",
      "सेवेतील त्रुटींसाठी जबाबदारी नाही: फोटोग्राफरने उशीर केल्यास, कमी दर्जाचे फोटो दिल्यास, शूट रद्द केल्यास किंवा गैरहजर राहिल्यास PhotoOS जबाबदार असणार नाही.",
      "पेमेंट बुडाल्यास जबाबदारी नाही: ग्राहकाने पैसे वेळेवर न दिल्यास, फसवणूक केल्यास किंवा बँकेत खोटा वाद उपस्थित केल्यास PhotoOS जबाबदार राहणार नाही.",
      "पेमेंट सुविधा: सर्व पेमेंट्स RBI मान्यताप्राप्त पेमेंट गेटवेद्वारे होतात. PhotoOS ही बँक किंवा एस्क्रो एजंट नाही.",
    ],
  },
};
