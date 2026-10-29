import {
  UserProfile,
  EmailThread,
  CannedResponse,
  Department,
} from "@/types/inbox/helpdesk";

export const USER_PROFILES: UserProfile[] = [
  {
    id: "usr_super_admin",
    name: "Ajit Pawar",
    email: "founder@photoos.in",
    role: "SUPER_ADMIN",
    roleTitle: "Super Admin (Full Access)",
    allowedDepartment: "all",
    avatar: "AP",
  },
  {
    id: "usr_marketing_specialist",
    name: "Pooja Sharma",
    email: "marketing@photoos.in",
    role: "MARKETING_AGENT",
    roleTitle: "Marketing Specialist",
    allowedDepartment: "marketing",
    avatar: "PS",
  },
  {
    id: "usr_support_agent",
    name: "Rohan Verma",
    email: "support@photoos.in",
    role: "SUPPORT_AGENT",
    roleTitle: "Support Engineer",
    allowedDepartment: "support",
    avatar: "RV",
  },
  {
    id: "usr_billing_agent",
    name: "Kavita Rao",
    email: "billing@photoos.in",
    role: "BILLING_AGENT",
    roleTitle: "Billing Operations",
    allowedDepartment: "billing",
    avatar: "KR",
  },
];

export const DEPARTMENT_CONFIG: Record<
  Exclude<Department, "all">,
  {
    label: string;
    email: string;
    badgeBg: string;
    badgeText: string;
    borderCol: string;
    description: string;
    accentColor: string;
  }
> = {
  support: {
    label: "Support",
    email: "support@photoos.in",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-400",
    borderCol: "border-blue-500/30",
    description: "Bug reports, upload stuck, face recognition & general studio setup.",
    accentColor: "#2563eb",
  },
  billing: {
    label: "Billing",
    email: "billing@photoos.in",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-400",
    borderCol: "border-amber-500/30",
    description: "Tax invoices, double debits, GST receipts & plan upgrades.",
    accentColor: "#d97706",
  },
  marketing: {
    label: "Marketing",
    email: "marketing@photoos.in",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-400",
    borderCol: "border-purple-500/30",
    description: "Creator partnerships, expo demos, webinar sponsorships & leads.",
    accentColor: "#9333ea",
  },
  founder_legal: {
    label: "Founder & Legal",
    email: "founder@photoos.in",
    badgeBg: "bg-slate-500/10 dark:bg-slate-500/20",
    badgeText: "text-slate-700 dark:text-slate-300",
    borderCol: "border-slate-500/30",
    description: "Enterprise studio networks (20+ branches), DPDP Act compliance & NDAs.",
    accentColor: "#475569",
  },
};

export const INITIAL_THREADS: EmailThread[] = [
  // -------------------------------------------------------------------------
  // 1. SUPPORT THREAD 1
  // -------------------------------------------------------------------------
  {
    id: "th_sup_01",
    department: "support",
    departmentEmail: "support@photoos.in",
    subject: "Gallery upload stuck at 90% during wedding export (650 photos)",
    snippet: "Hello PhotoOS team, we are uploading a 650-photo high-res set from a destination wedding in Goa...",
    customerName: "Vikram Jagtap",
    customerEmail: "vikram@pixelcanvaspune.com",
    customerPhone: "+91 98220 11442",
    customerAvatar: "VJ",
    customerPlan: "Pro Studio",
    status: "open",
    priority: "urgent",
    unread: true,
    assignedTo: "Rohan Verma",
    createdAt: "2026-10-29T13:45:00.000Z",
    lastUpdated: "12m ago",
    messages: [
      {
        id: "msg_sup_01_1",
        threadId: "th_sup_01",
        senderType: "customer",
        senderName: "Vikram Jagtap",
        senderEmail: "vikram@pixelcanvaspune.com",
        departmentEmail: "support@photoos.in",
        timestamp: "12 minutes ago (Today 1:45 PM)",
        body: `Hello PhotoOS Support Team,

We are trying to deliver a 650-photo wedding set to the bride's family today. The batch uploader runs smoothly until 90% (around photo 585), and then the browser network panel shows an intermittent timeout on chunk uploads.

Could you please check if our storage quota limit was reached or if there is a chunk size issue with RAW/large JPEG files over 25MB?

Bride's wedding date was 24th October. Need to deliver link by this evening.

Best regards,
Vikram Jagtap
Pixel Canvas Studio, Pune`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. SUPPORT THREAD 2
  // -------------------------------------------------------------------------
  {
    id: "th_sup_02",
    department: "support",
    departmentEmail: "support@photoos.in",
    subject: "Face recognition index error on low-light reception portraits",
    snippet: "Guests are scanning the QR code at the event hall but about 15% of night portraits are missing from their selfie match...",
    customerName: "Amitabh Shelar",
    customerEmail: "amitabh@royalcandid.in",
    customerPhone: "+91 98200 44910",
    customerAvatar: "AS",
    customerPlan: "Growth Studio",
    status: "pending",
    priority: "high",
    unread: false,
    assignedTo: "Rohan Verma",
    createdAt: "2026-10-29T10:15:00.000Z",
    lastUpdated: "3h ago",
    messages: [
      {
        id: "msg_sup_02_1",
        threadId: "th_sup_02",
        senderType: "customer",
        senderName: "Amitabh Shelar",
        senderEmail: "amitabh@royalcandid.in",
        departmentEmail: "support@photoos.in",
        timestamp: "5 hours ago",
        body: `Hi Support,

Last night during our banquet hall reception event, around 80 guests used the QR code selfie scanner. The facial indexing matched daytime shots with 99% accuracy, but on warm-tinted low light reception shots, several guests reported 'No photos found yet'.

Can we trigger a re-index with an adjusted face-matching tolerance for this specific project?`,
      },
      {
        id: "msg_sup_02_2",
        threadId: "th_sup_02",
        senderType: "agent",
        senderName: "Rohan Verma (Support)",
        senderEmail: "support@photoos.in",
        departmentEmail: "support@photoos.in",
        timestamp: "3 hours ago",
        body: `Hello Amitabh,

Thanks for reaching out! We've examined the event's embedding vector index. Because the reception photos had high warm amber lighting (3000K), the contrast threshold caused lower confidence scores on side-angle faces.

We have re-run the backend embedding pipeline with adaptive low-light gamma correction for project #EVT-4819. Could you ask the affected guests to refresh their gallery link?

Let us know if you need any further help!
Rohan Verma, PhotoOS Support`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. BILLING THREAD 1
  // -------------------------------------------------------------------------
  {
    id: "th_bil_01",
    department: "billing",
    departmentEmail: "billing@photoos.in",
    subject: "Need GST Tax Invoice with Corporate GSTIN for October 2026",
    snippet: "Dear Accounts, we upgraded to the Pro Studio Annual plan on 26th October. Please update our GSTIN 27AAACR1234F1Z5...",
    customerName: "Omkar Kulkarni",
    customerEmail: "omkar@omkardigital.com",
    customerPhone: "+91 94220 98112",
    customerAvatar: "OK",
    customerPlan: "Pro Studio",
    status: "open",
    priority: "normal",
    unread: true,
    assignedTo: "Kavita Rao",
    createdAt: "2026-10-29T11:20:00.000Z",
    lastUpdated: "2h ago",
    messages: [
      {
        id: "msg_bil_01_1",
        threadId: "th_bil_01",
        senderType: "customer",
        senderName: "Omkar Kulkarni",
        senderEmail: "omkar@omkardigital.com",
        departmentEmail: "billing@photoos.in",
        timestamp: "2 hours ago",
        body: `Dear PhotoOS Billing Team,

We recently paid ₹24,990 + 18% GST for the Pro Studio Annual subscription renewal on 26th Oct. The automated receipt generated in the dashboard doesn't show our registered business GSTIN number.

Our business details for the revised Tax Invoice:
- Legal Trade Name: Omkar Digital Creations Private Limited
- GSTIN: 27AAACR1234F1Z5
- Address: 4th Floor, Rajarampuri 3rd Lane, Kolhapur, Maharashtra 416008

Please send the official B2B GST tax invoice so we can file input tax credit before month end.

Regards,
Omkar Kulkarni`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. BILLING THREAD 2
  // -------------------------------------------------------------------------
  {
    id: "th_bil_02",
    department: "billing",
    departmentEmail: "billing@photoos.in",
    subject: "Payment debited twice via UPI during annual renewal checkout",
    snippet: "Hi, yesterday my bank account was charged ₹29,488 twice due to a payment gateway gateway gateway timeout...",
    customerName: "Sanjay Deshpande",
    customerEmail: "sanjay@vidarbhamoments.com",
    customerPhone: "+91 99231 55670",
    customerAvatar: "SD",
    customerPlan: "Pro Studio",
    status: "resolved",
    priority: "urgent",
    unread: false,
    assignedTo: "Kavita Rao",
    createdAt: "2026-10-28T16:00:00.000Z",
    lastUpdated: "Yesterday",
    messages: [
      {
        id: "msg_bil_02_1",
        threadId: "th_bil_02",
        senderType: "customer",
        senderName: "Sanjay Deshpande",
        senderEmail: "sanjay@vidarbhamoments.com",
        departmentEmail: "billing@photoos.in",
        timestamp: "Yesterday at 4:00 PM",
        body: `Hi Billing Team,

While renewing our annual subscription yesterday, the UPI app showed a timeout, so I retried. However, my HDFC bank statement reflects two debit deductions of ₹29,488 each (UTR: 629810334812 & 629810334819).

Please verify and initiate a refund for the duplicate transaction.`,
      },
      {
        id: "msg_bil_02_2",
        threadId: "th_bil_02",
        senderType: "agent",
        senderName: "Kavita Rao (Billing)",
        senderEmail: "billing@photoos.in",
        departmentEmail: "billing@photoos.in",
        timestamp: "Yesterday at 5:15 PM",
        body: `Dear Sanjay,

We checked the Razorpay/Cashfree gateway logs. The second charge (UTR: 629810334819) has indeed been captured twice due to the gateway retry window.

We have processed a direct reversal refund of ₹29,488. Refund Reference ID: #RFND-2026-98124. The amount will reflect in your HDFC account within 24 to 48 banking hours.

Your Pro Studio subscription is successfully extended until October 2027.

Warm regards,
Kavita Rao, PhotoOS Billing Operations`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. MARKETING THREAD 1
  // -------------------------------------------------------------------------
  {
    id: "th_mkt_01",
    department: "marketing",
    departmentEmail: "marketing@photoos.in",
    subject: "Influencer partnership & YouTube software review proposal",
    snippet: "Hello PhotoOS marketing team, I run 'ShutterCraft India' with 145K wedding photographer subscribers on YouTube...",
    customerName: "Aakash Mehta",
    customerEmail: "aakash@shuttercraftindia.com",
    customerPhone: "+91 97110 33890",
    customerAvatar: "AM",
    customerPlan: "Prospective Partner",
    status: "open",
    priority: "high",
    unread: true,
    assignedTo: "Pooja Sharma",
    createdAt: "2026-10-29T09:30:00.000Z",
    lastUpdated: "4h ago",
    messages: [
      {
        id: "msg_mkt_01_1",
        threadId: "th_mkt_01",
        senderType: "customer",
        senderName: "Aakash Mehta",
        senderEmail: "aakash@shuttercraftindia.com",
        departmentEmail: "marketing@photoos.in",
        timestamp: "4 hours ago (Today 9:30 AM)",
        body: `Hey PhotoOS Marketing Team,

I'm Aakash from ShutterCraft India (145,000 subscribers on YouTube, 65K on Instagram). We produce honest tech breakdowns and workflow software reviews for wedding and event photographers across India.

We've been seeing multiple studios in Pune and Mumbai adopt PhotoOS for QR selfie guest delivery and offline client selection. We would love to feature an end-to-end tutorial: "How Modern Studios Deliver 2,000 Photos in 5 Minutes with AI".

Could you share your partnership media kit or demo account access for our video production team?

Channel link: youtube.com/@shuttercraftindia
Best,
Aakash Mehta`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 6. MARKETING THREAD 2
  // -------------------------------------------------------------------------
  {
    id: "th_mkt_02",
    department: "marketing",
    departmentEmail: "marketing@photoos.in",
    subject: "Pricing and Title Sponsorship for Western India Photo Expo 2026",
    snippet: "Dear Marketing Lead, the Western India Photographers Guild cordially invites PhotoOS as our official AI Technology Partner...",
    customerName: "Rajendra Chavan",
    customerEmail: "president@wipg-association.org",
    customerPhone: "+91 98211 77301",
    customerAvatar: "RC",
    customerPlan: "Prospective Partner",
    status: "pending",
    priority: "normal",
    unread: false,
    assignedTo: "Pooja Sharma",
    createdAt: "2026-10-28T12:00:00.000Z",
    lastUpdated: "Yesterday",
    messages: [
      {
        id: "msg_mkt_02_1",
        threadId: "th_mkt_02",
        senderType: "customer",
        senderName: "Rajendra Chavan",
        senderEmail: "president@wipg-association.org",
        departmentEmail: "marketing@photoos.in",
        timestamp: "Yesterday at 12:00 PM",
        body: `Dear PhotoOS Leadership,

The Western India Photographers Guild (WIPG) is organizing the 12th annual Photo & Cine Expo in Pune on December 18-20, 2026, expecting over 6,000 studio owners, cinematographers, and album manufacturers.

We have reserved Stall A-12 (Prime Main Entrance Hall) and would like to propose PhotoOS as our official 'AI Technology Partner'.

Included benefits:
1. 20-minute masterclass slot on AI face tagging for attendees
2. Logo branding on 10,000 visitor badges
3. Dedicated live demo kiosk booth

Please let us know your availability for a brief Google Meet this week to discuss sponsorship tiers.

Cordially,
Rajendra Chavan, President WIPG`,
      },
      {
        id: "msg_mkt_02_2",
        threadId: "th_mkt_02",
        senderType: "agent",
        senderName: "Pooja Sharma (Marketing)",
        senderEmail: "marketing@photoos.in",
        departmentEmail: "marketing@photoos.in",
        timestamp: "Yesterday at 3:45 PM",
        body: `Dear Mr. Chavan,

Thank you for the prestigious invitation! We hold WIPG in high regard and are very interested in Stall A-12 and the live AI face delivery masterclass demonstration.

We are reviewing the sponsorship deck with our founding team and will confirm a 15-minute sync for Thursday afternoon.

Warm regards,
Pooja Sharma, Head of Growth & Marketing`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 7. FOUNDER & LEGAL THREAD 1
  // -------------------------------------------------------------------------
  {
    id: "th_fnd_01",
    department: "founder_legal",
    departmentEmail: "founder@photoos.in",
    subject: "Enterprise contract inquiry for 25 studio branches in Gujarat & MP",
    snippet: "Dear Founders, Heritage Media operates 25 premium wedding film studios. We are evaluating an enterprise multi-tenant rollout...",
    customerName: "Harshvardhan Parekh",
    customerEmail: "harsh@heritagemedianetwork.com",
    customerPhone: "+91 98790 88200",
    customerAvatar: "HP",
    customerPlan: "Enterprise",
    status: "open",
    priority: "urgent",
    unread: true,
    assignedTo: "Ajit Pawar",
    createdAt: "2026-10-29T08:00:00.000Z",
    lastUpdated: "5h ago",
    messages: [
      {
        id: "msg_fnd_01_1",
        threadId: "th_fnd_01",
        senderType: "customer",
        senderName: "Harshvardhan Parekh",
        senderEmail: "harsh@heritagemedianetwork.com",
        departmentEmail: "founder@photoos.in",
        timestamp: "5 hours ago (Today 8:00 AM)",
        body: `Dear Founder & Executive Team,

Heritage Media Network operates 25 luxury wedding photography and film branches across Ahmedabad, Surat, Vadodara, and Indore, shooting approximately 1,200 weddings annually.

We are actively seeking to replace our fragmented storage and photo delivery stack with a unified, white-labeled AI platform.

Key enterprise requirements:
1. Multi-branch master admin with centralized analytics and branch-wise billing
2. Custom CNAME subdomains for all 25 studios (e.g. photos.heritagestudio.com)
3. Dedicated S3/Wasabi storage vault with guaranteed 99.9% uptime SLA
4. Master SLA agreement and direct enterprise onboarding

Could we schedule a founder-level discussion with your technical architects this week?

Sincerely,
Harshvardhan Parekh
Managing Director, Heritage Media Network`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. FOUNDER & LEGAL THREAD 2
  // -------------------------------------------------------------------------
  {
    id: "th_fnd_02",
    department: "founder_legal",
    departmentEmail: "legal@photoos.in",
    subject: "DPDP Act 2023 compliance & guest biometric facial consent policy",
    snippet: "To PhotoOS Legal Counsel, in reference to the Digital Personal Data Protection Act, please confirm biometric retention schedules...",
    customerName: "Adv. Sneha Deshpande",
    customerEmail: "sneha@apexlegaladvisors.in",
    customerPhone: "+91 98230 66100",
    customerAvatar: "SD",
    customerPlan: "Pro Studio",
    status: "open",
    priority: "high",
    unread: false,
    assignedTo: "Ajit Pawar",
    createdAt: "2026-10-27T14:20:00.000Z",
    lastUpdated: "2 days ago",
    messages: [
      {
        id: "msg_fnd_02_1",
        threadId: "th_fnd_02",
        senderType: "customer",
        senderName: "Adv. Sneha Deshpande",
        senderEmail: "sneha@apexlegaladvisors.in",
        departmentEmail: "legal@photoos.in",
        timestamp: "2 days ago",
        body: `To the Legal & Compliance Officer, PhotoOS India,

Our client (a premier wedding photography group in Mumbai) utilizes PhotoOS's AI facial recognition feature for wedding guest distribution.

In light of India's Digital Personal Data Protection (DPDP) Act 2023 regulations concerning biometric facial vector data:
1. Please confirm that guest facial embeddings are salted and stored in an encrypted vector database.
2. What is the automated data purging cycle once the 90-day wedding gallery expires?
3. Do you provide a Data Processing Addendum (DPA) signed on company letterhead?

Kindly share your Data Protection Officer (DPO) contact information and formal privacy whitepaper.

Regards,
Adv. Sneha Deshpande
Apex Legal Advisors, High Court of Bombay`,
      },
    ],
  },
];

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: "can_01",
    title: "GST Invoice Details Requested",
    department: "billing",
    content: `Dear Customer,\n\nThank you for providing your registered GST details. We have updated your account profile with GSTIN and regenerated your B2B tax invoice. You can download the signed tax invoice directly from your Studio Dashboard > Billing & Invoices section, or reply to this email if you need us to attach a PDF copy.\n\nWarm regards,\nPhotoOS Billing Operations`,
  },
  {
    id: "can_02",
    title: "Upload Speed & Quota Troubleshooting",
    department: "support",
    content: `Hello Studio Team,\n\nWe looked into the upload stream for your project. Please verify that individual JPEG/RAW files do not exceed 45MB each. If you are uploading via Wi-Fi with occasional packet drops, we recommend enabling 'Chunked Safe Upload' in your Studio Settings > Gallery Upload Preferences.\n\nOur system also provides auto-resume so you won't lose progress on uploaded images.\n\nBest regards,\nPhotoOS Technical Support`,
  },
  {
    id: "can_03",
    title: "Creator Partnership Media Kit",
    department: "marketing",
    content: `Hi there!\n\nThank you for your interest in partnering with PhotoOS. We love collaborating with passionate creators and educators who empower wedding and portrait photographers.\n\nWe have activated a 30-day Pro Studio sandbox account for your review and attached our media kit with official branding assets, key talking points, and affiliate program details.\n\nLet's schedule a 15-minute walkthrough whenever convenient!\n\nWarm regards,\nPhotoOS Growth & Marketing`,
  },
  {
    id: "can_04",
    title: "Enterprise Custom SLA & Multi-Studio Plan",
    department: "founder_legal",
    content: `Dear Enterprise Partner,\n\nThank you for your inquiry. PhotoOS Enterprise is specifically engineered for multi-branch studio networks and large event production companies requiring dedicated storage vaults, custom domains, 99.9% uptime SLAs, and centralized management.\n\nOur executive team would be delighted to host a private architecture demo and review contract terms with you. What day and time work best this week?\n\nSincerely,\nAjit Pawar, Founder & CEO\nPhotoOS Enterprise`,
  },
];
