# Real Production Configuration Checklist (`TODO_REAL_DATA.md`)

In accordance with our **Zero Mock Data Policy**, placeholder and fake records have been completely eradicated from the code. All features now query real Supabase tables and Cloudflare R2 vaults or present honest empty states.

To enable full end-to-end processing in live production, the following real external service keys and legal entity values must be provided in your production environment (`.env.production` or Vercel Environment Variables):

---

## 1. Payment Gateway (Subscription Billing & Client Invoices)
Configure real API credentials for live payment collection:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your live Razorpay Key ID (e.g., `rzp_live_...`)
- `RAZORPAY_KEY_SECRET`: Your live Razorpay Key Secret
- *Alternative:* Cashfree / Stripe credentials if transitioning payment aggregator.

> Note: Zero-rupee plans (e.g. 7-Day Free Trial) process automatically without gateway charges.

---

## 2. Email Delivery (Transactional & Admin Notifications)
Configure Resend credentials for automated guest check-in leads, 2FA OTPs, and welcome emails:
- `RESEND_API_KEY`: Live Resend API key (starts with `re_...`)
- Verified Sender Domains: Ensure SPF, DKIM, and DMARC are active in Cloudflare DNS for `photoos.in`.

---

## 3. Object Storage (Cloudflare R2 Private Photo Vault)
Configure private Cloudflare R2 credentials for high-resolution galleries and signed upload URLs:
- `R2_ACCOUNT_ID`: Cloudflare Account ID
- `R2_ACCESS_KEY_ID`: Cloudflare S3 Access Key ID
- `R2_SECRET_ACCESS_KEY`: Cloudflare S3 Secret Access Key
- `R2_BUCKET_NAME`: Production bucket name (e.g. `photoos-vault-prod`)
- `R2_PUBLIC_DOMAIN`: Optional public CDN custom domain (e.g. `cdn.photoos.in`)

---

## 4. Legal Compliance & DPDP Act 2023 Details
Update the bracketed placeholders in `lib/legal/raw-content.ts`:
- **Legal Entity Name**: e.g. `PhotoOS Technologies Private Limited`
- **Corporate Identification Number (CIN)**: e.g. `U72900MH2026PTC...`
- **Registered Office Address**: Full registered address in Maharashtra, India.
- **Grievance Officer**: Name, official email (`grievance@photoos.in`), and phone number as mandated by the Information Technology (Intermediary Guidelines) Rules, 2021.
- **Support & Billing Contact**: `support@photoos.in` / `billing@photoos.in`.

---

## 5. Production Subdomain & Database Sync
- Verify Supabase Auth redirect URLs in the Supabase Dashboard:
  - Allowed Redirect URLs: `https://app.photoos.in/**`, `https://photoos.in/**`
- Run the new availability migration in your Supabase project:
  - `supabase/migrations/202610300001000_studio_marketplace_availability.sql`

