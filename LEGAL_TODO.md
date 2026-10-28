# PhotoOS Legal Implementation & Lawyer Review Checklist

**Version:** 0.0.1  
**Effective Date:** 1 November 2026 (प्रभावी दिनांक: १ नोव्हेंबर २०२६)  
**Applicable Statutes:**
- The Digital Personal Data Protection Act, 2023 (DPDP Act) & Rules
- The Information Technology Act, 2000 (Section 79 Intermediary Safe Harbor)
- The Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
- The Consumer Protection (E-Commerce) Rules, 2020
- The Arbitration and Conciliation Act, 1996
- The Indian Copyright Act, 1957

---

## 1. Central Configuration Placeholders (`/config/legal.ts`)
The following placeholders are formatted in `[SQUARE BRACKETS]` across the codebase and must be verified and filled by the company's legal counsel:

| Placeholder Variable | Current Value in Code | Lawyer Action Required |
| :--- | :--- | :--- |
| `companyLegalName` | `[PHOTOOS TECHNOLOGIES PRIVATE LIMITED]` | Confirm exact incorporated entity name as per MCA certificate. |
| `registeredAddress` | `[SHOP NO. 4, BUILDING 12, PHOENIX PARADISE, SENAPATI BAPAT MARG, MUMBAI, MAHARASHTRA 400013, INDIA]` | Confirm official registered office address for statutory notices. |
| `cin` | `[U72900MH2026PTC123456]` | Insert official Corporate Identification Number from MCA. |
| `gstin` | `[27AAAAA0000A1Z5]` | Insert official 15-digit Goods and Services Tax Identification Number. |
| `supportEmail` | `[support@photoos.in]` | Confirm monitored operational support mailbox. |
| `legalEmail` | `[legal@photoos.in]` | Confirm mailbox for copyright infringement and takedown notices under IT Rules 2021. |
| `privacyEmail` | `[privacy@photoos.in]` | Confirm mailbox for DPDP Act Section 11/12 data rights requests. |
| `grievanceOfficerName` | `[MR. ADITYA VERMA]` | Formally appoint Grievance Officer under Rule 3(2) of IT Rules 2021. |
| `grievanceOfficerEmail`| `[grievance@photoos.in]` | Publish dedicated grievance redressal address. |
| `grievanceOfficerPhone`| `[+91 22 4567 8900]` | Provide working contact telephone number as required by IT Rules 2021. |
| `dpoName` | `[DR. SANJAY KULKARNI]` | Confirm appointment of Data Protection Officer under Section 8 of DPDP Act 2023. |
| `dpoEmail` | `[dpo@photoos.in]` | Dedicated DPO contact email. |
| `governingCity` | `[MUMBAI]` | Confirm commercial court territorial jurisdiction. |
| `arbitrationSeat` | `[MUMBAI, MAHARASHTRA]` | Confirm legal seat and venue of arbitration. |
| `liabilityCapMonths` | `12` | Review if aggregate liability cap of 12 months fees is enforceable. |
| `liabilityFixedCapINR` | `10000` | Review default monetary liability ceiling. |
| `defaultPhotoRetentionDays` | `90` | Confirm free cloud tier auto-purge retention window for Cloudflare R2 storage. |

---

## 2. Regulatory & Contractual Review Items for Lawyer

### A. Digital Personal Data Protection Act, 2023 (DPDP Act)
- [ ] **Data Fiduciary Dual-Role Separation:** Confirm the legal validity of PhotoOS acting as a Data Fiduciary for SaaS platform operations while independent Photographers act as independent Data Fiduciaries for event photos captured on the ground.
- [ ] **Facial Biometric Vector Notice (Section 6):** Confirm that mathematical 128/512-dimension face vectors/embeddings are treated with explicit, opt-in, withdrawable consent.
- [ ] **Children's Data Processing (Section 9):** Confirm the protocol requiring photographers to obtain verifiable parental/guardian consent for minor photography, and our immediate takedown procedure upon parent notice.
- [ ] **30-Day Statutory SLA (Section 13):** Confirm the internal operational workflow to respond to data access, correction, erasure, and nomination requests within 30 days.
- [ ] **Data Breach Notification (Section 8(6)):** Confirm legal protocol for notifying the Data Protection Board of India (DPBI) and affected users in the event of an unauthorized personal data exposure.

### B. Information Technology Act, 2000 & Intermediary Guidelines, 2021
- [ ] **Section 79 Safe Harbor:** Confirm that PhotoOS's tripartite terms adequately position the company as an intermediary entitled to immunity for third-party photography content.
- [ ] **Grievance Redressal Mechanism:** Ensure the 48-hour acknowledgement and 30-day resolution timeline is adhered to by the support team.
- [ ] **Takedown Process (Rule 3(1)(d)):** Confirm the procedure to disable access to unlawful or infringing content within statutory timelines upon receipt of a court order or authorized notice.

### C. Consumer Protection (E-Commerce) Rules, 2020 & Marketplace Rules
- [ ] **No Liability for Photographer Failure:** Confirm the enforceability of clauses stating PhotoOS is not liable for poor shoot quality, equipment breakdown, cancellations, or missed wedding moments.
- [ ] **No Liability for Client Payment Default:** Confirm the enforceability of clauses protecting PhotoOS if a client defaults or initiates a fraudulent bank chargeback against a photographer.
- [ ] **Payment Facilitation Disclosures:** Confirm that PhotoOS's role is strictly as a technological payment-facilitating intermediary and does not attract RBI payment aggregator licensing requirements or escrow regulations.

### D. Bilingual Execution & Conflict of Language Rule
- [ ] **English Prevails Clause:** Confirm enforceability under Indian jurisprudence of the clause: *"In case of conflict between languages, the English version prevails / भाषांमध्ये तफावत आढळल्यास इंग्रजी आवृत्ती ग्राह्य धरली जाईल."*

---

## 3. How to Bump Legal Versions in Future
When terms are amended in the future:
1. Update `LEGAL_CONFIG.version` in `/config/legal.ts` (e.g. from `"0.0.1"` to `"0.0.2"`).
2. Update `LEGAL_CONFIG.effectiveDate` and `LEGAL_CONFIG.lastUpdated`.
3. Add a concise summary entry in `LEGAL_CONFIG.changelog`.
4. The system's `<ReconsentModal />` will automatically detect the version mismatch and prompt all active authenticated users to review changes and re-consent upon their next session.
