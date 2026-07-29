export type LegalSubsection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: LegalSubsection[];
};

export type LegalDocument = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  effectiveDate?: string;
  lastUpdated?: string;
  intro?: string[];
  sections: LegalSection[];
};

export const legalDocumentLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Subscription Terms", href: "/subscription-terms" },
  { label: "Returns & Exchanges", href: "/returns-exchanges" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Copyright & Trademark", href: "/copyright-trademark" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Legal Notices", href: "/legal-notices" },
  { label: "FAQ", href: "/faq" },
] as const;

export const legalDocuments = {
  terms: {
    slug: "terms",
    title: "Zelos Terms & Conditions",
    shortTitle: "Terms & Conditions",
    description:
      "The terms that apply when you use the Zelos website, purchase products, participate in programs, or use Zelos services.",
    effectiveDate: "July 30, 2026",
    sections: [
      {
        title: "1. Introduction",
        paragraphs: [
          "Welcome to Zelos. By accessing or using our website, purchasing products, participating in our programs, or engaging with any Zelos services, you agree to the following Terms & Conditions. Please read them carefully.",
          "These Terms apply to all visitors, customers, donors, members, and participants. If you do not agree, please discontinue use of our website and services.",
        ],
      },
      {
        title: "2. About Zelos",
        paragraphs: [
          "Zelos is a nonprofit organization dedicated to financial literacy, mentoring, leadership development, and youth empowerment. Our website, merchandise, programs, and digital content are provided to support this mission.",
        ],
      },
      {
        title: "3. Use of the Website",
        paragraphs: ["You agree to use the Zelos website only for lawful purposes. You may not:"],
        bullets: [
          "Attempt to interfere with website functionality.",
          "Use automated systems to access or collect data.",
          "Copy, distribute, or misuse Zelos content without permission.",
          "Engage in fraudulent, harmful, or disruptive behavior.",
        ],
        subsections: [
          {
            title: "Access",
            paragraphs: [
              "We reserve the right to restrict access to any user who violates these Terms.",
            ],
          },
        ],
      },
      {
        title: "4. Intellectual Property",
        paragraphs: [
          "All content on the Zelos website—including text, graphics, logos, images, videos, curriculum materials, and merchandise designs—is the property of Zelos or its partners.",
          "You may not reproduce, distribute, modify, or use Zelos intellectual property without written permission.",
        ],
      },
      {
        title: "5. Purchases and Custom Merchandise",
        paragraphs: [
          "All Zelos merchandise is custom made after your order is placed. By purchasing from our store, you acknowledge and agree to our Return & Exchange Policy, which includes:",
        ],
        bullets: [
          "No returns or exchanges for ordering errors.",
          "No cancellations once production begins.",
          "Review of damaged or incorrect orders within 30 days.",
          "Custom production timelines that may vary.",
        ],
        subsections: [
          {
            title: "Full Policy",
            paragraphs: [
              "Full details are available in our Return, Exchange & Satisfaction Policy.",
            ],
          },
        ],
      },
      {
        title: "6. Pricing and Payment",
        paragraphs: [
          "All prices listed on our website are in U.S. dollars unless otherwise stated. Zelos reserves the right to update pricing at any time.",
          "By completing a purchase, you authorize Zelos and its payment partners to process your transaction securely.",
        ],
      },
      {
        title: "7. Donations",
        paragraphs: [
          "Donations made to Zelos support scholarships, programming, and financial literacy initiatives.",
          "All donations are voluntary and non-refundable unless required by law.",
          "Donors will receive confirmation of their contribution and may request documentation for tax purposes.",
        ],
      },
      {
        title: "8. Accounts and Registration",
        paragraphs: ["If you create an account on our website, you agree to:"],
        bullets: [
          "Provide accurate information.",
          "Maintain the confidentiality of your login credentials.",
          "Notify us immediately of unauthorized access.",
        ],
        subsections: [
          {
            title: "Account Enforcement",
            paragraphs: [
              "Zelos reserves the right to suspend or terminate accounts that violate these Terms.",
            ],
          },
        ],
      },
      {
        title: "9. Third-Party Services",
        paragraphs: [
          "Zelos may use third-party platforms for payment processing, merchandise fulfillment, event registration, or communication.",
          "We are not responsible for the policies or actions of these third-party providers.",
        ],
      },
      {
        title: "10. Program Participation",
        paragraphs: [
          "By participating in Zelos events, mentoring programs, workshops, or forums, you agree to:",
        ],
        bullets: [
          "Engage respectfully with others.",
          "Follow all guidelines provided by Zelos.",
          "Allow Zelos to use non-sensitive photos or video clips from events for promotional purposes unless you opt out in writing.",
        ],
        subsections: [
          {
            title: "Program Enforcement",
            paragraphs: [
              "Zelos reserves the right to remove participants who violate program rules or disrupt the experience of others.",
            ],
          },
        ],
      },
      {
        title: "11. Limitation of Liability",
        paragraphs: ["Zelos is not liable for:"],
        bullets: [
          "Damages resulting from misuse of our website or services.",
          "Issues caused by third-party vendors or shipping partners.",
          "Losses resulting from inaccurate information provided by users.",
          "Interruptions, delays, or technical errors beyond our control.",
        ],
        subsections: [
          {
            title: "Use at Your Own Risk",
            paragraphs: ["Your use of Zelos services is at your own risk."],
          },
        ],
      },
      {
        title: "12. Privacy",
        paragraphs: [
          "Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.",
        ],
      },
      {
        title: "13. Policy Updates",
        paragraphs: [
          "Zelos may update these Terms & Conditions at any time. Changes will be posted on our website and will apply to future use of our services.",
          "Continued use of the website or participation in Zelos programs constitutes acceptance of updated Terms.",
        ],
      },
      {
        title: "14. Contact Information",
        paragraphs: [
          "For questions regarding these Terms & Conditions, please contact us:",
          "Email: support@zelos.org",
          "Website: www.zelos.org",
        ],
      },
      {
        title: "15. Thank You",
        paragraphs: [
          "Thank you for being part of the Zelos community.",
          "Your engagement supports financial literacy, mentorship, leadership development, and the next generation of future leaders.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Zelos Privacy Policy",
    shortTitle: "Privacy Policy",
    description:
      "How Zelos collects, uses, shares, and protects information from website visitors, customers, donors, members, and program participants.",
    effectiveDate: "July 30, 2026",
    sections: [
      {
        title: "1. Introduction",
        paragraphs: [
          "Zelos respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect information when you visit our website, purchase merchandise, make a donation, register for an event, or participate in a Zelos program.",
          "By using our website or services, you consent to the practices described in this policy.",
        ],
      },
      {
        title: "2. Information We Collect",
        subsections: [
          {
            title: "A. Personal Information You Provide",
            bullets: [
              "Name.",
              "Email address.",
              "Mailing or shipping address.",
              "Phone number.",
              "Payment information processed securely through third-party providers.",
              "Account login information.",
              "Information submitted through forms, applications, event registrations, or program participation.",
            ],
          },
          {
            title: "B. Information Collected Automatically",
            bullets: [
              "IP address.",
              "Browser type.",
              "Device information.",
              "Pages visited.",
              "Time spent on the website.",
              "Cookies and similar tracking technologies.",
            ],
          },
          {
            title: "C. Program and Participation Information",
            bullets: [
              "Program registration information.",
              "Attendance records.",
              "Feedback and survey responses.",
            ],
          },
        ],
      },
      {
        title: "3. How We Use Your Information",
        paragraphs: ["Zelos may use your information to:"],
        bullets: [
          "Process and fulfill orders.",
          "Provide customer support.",
          "Process donations and provide receipts.",
          "Register participants for events and programs.",
          "Improve our website and program performance.",
          "Send service-related communications and updates.",
          "Maintain platform safety and security.",
          "Meet legal and nonprofit compliance requirements.",
        ],
        subsections: [
          {
            title: "We Do Not Sell Personal Information",
            paragraphs: ["Zelos does not sell personal information."],
          },
        ],
      },
      {
        title: "4. Cookies and Tracking Technologies",
        paragraphs: [
          "We may use cookies and similar technologies to support website functionality, understand traffic, personalize experiences, and maintain secure login sessions.",
          "You may disable cookies through your browser settings, but some website features may not function properly.",
        ],
      },
      {
        title: "5. How We Share Information",
        paragraphs: [
          "Zelos may share information with trusted service providers that help us operate our website and programs, including payment processors, merchandise fulfillment partners, shipping carriers, event platforms, and email service providers.",
          "These providers are expected to protect the information and use it only to provide services to Zelos.",
          "Zelos does not sell or rent your personal information.",
        ],
      },
      {
        title: "6. Donations and Financial Information",
        paragraphs: [
          "Donation and payment transactions are processed by secure third-party providers. Zelos does not store full credit or debit card numbers.",
          "Donors may receive confirmation of their contributions and may request documentation for tax purposes.",
        ],
      },
      {
        title: "7. Data Security",
        paragraphs: [
          "We use reasonable safeguards designed to protect personal information, including secure servers, encrypted payment processing, access controls, and monitoring.",
          "No system can be guaranteed completely secure. You provide information and use our services at your own risk.",
        ],
      },
      {
        title: "8. Children’s Privacy",
        paragraphs: [
          "The Zelos website is not intended for unsupervised use by children under 13. We do not knowingly collect personal information from a child under 13 without appropriate parent or guardian consent.",
        ],
      },
      {
        title: "9. Your Privacy Choices",
        paragraphs: ["You may contact Zelos to request that we:"],
        bullets: [
          "Provide access to your personal information.",
          "Correct inaccurate information.",
          "Delete eligible personal information.",
          "Stop non-essential communications.",
        ],
        subsections: [
          {
            title: "Cookies",
            paragraphs: [
              "You may also disable cookies through your browser settings.",
            ],
          },
        ],
      },
      {
        title: "10. Third-Party Links",
        paragraphs: [
          "Our website may link to third-party websites or services. Zelos is not responsible for their privacy practices. Review the privacy policy of each third-party service you use.",
        ],
      },
      {
        title: "11. Policy Updates",
        paragraphs: [
          "Zelos may update this Privacy Policy at any time. Updates will be posted on our website and will apply to future use of our services.",
        ],
      },
      {
        title: "12. Contact Information",
        paragraphs: [
          "For privacy questions or requests, contact our Customer Experience Team:",
          "Email: support@zelos.org",
          "Website: www.zelos.org",
          "Business Hours: Monday–Friday, 9:00 AM–5:00 PM Eastern Time",
          "We strive to respond to inquiries within 48 hours.",
        ],
      },
      {
        title: "13. Thank You",
        paragraphs: [
          "Thank you for trusting Zelos. We are committed to respecting your privacy while advancing financial literacy, mentoring, leadership, and youth empowerment.",
        ],
      },
    ],
  },
  subscriptionTerms: {
    slug: "subscription-terms",
    title: "Terms of Service for Subscriptions",
    shortTitle: "Subscription Terms",
    description:
      "Terms governing Zelos subscriptions, youth accounts, billing, educational content, mentorship, and parent or guardian consent.",
    effectiveDate: "July 30, 2026",
    lastUpdated: "July 30, 2026",
    sections: [
      {
        title: "1. Overview",
        paragraphs: [
          "These Terms of Service (“Terms”) govern your access to and use of the Zelos Financial Literacy & Mentoring Platform (“Zelos,” “we,” “our,” or “the Platform”). By creating an account, subscribing, or accessing any Zelos content, you agree to these Terms.",
          "Zelos provides age-appropriate financial literacy education, mentorship resources, digital tools, and community programming for children (ages 8–12), teens (ages 13–17), and young adults (ages 18–24).",
          "If you do not agree to these Terms, do not use the Platform.",
        ],
      },
      {
        title: "2. Eligibility",
        subsections: [
          {
            title: "2.1 Children (Ages 8–12)",
            paragraphs: [
              "A parent or legal guardian must create and manage the child’s account.",
              "Children may access learning modules, videos, games, and challenges only through a supervised account.",
            ],
          },
          {
            title: "2.2 Teens (Ages 13–17)",
            paragraphs: [
              "Teens may create an account with verifiable parental or guardian consent.",
              "Parents or guardians may view progress, manage permissions, and control communication settings.",
            ],
          },
          {
            title: "2.3 Young Adults (Ages 18–24)",
            paragraphs: [
              "Young adults may create and manage their own accounts independently.",
              "Access includes advanced modules, mentorship opportunities, and financial planning tools.",
            ],
          },
        ],
      },
      {
        title: "3. Parent/Guardian Consent Requirement",
        paragraphs: ["For users under 18:"],
        bullets: [
          "Parents or guardians agree to these Terms on behalf of the minor.",
          "Parents or guardians are responsible for monitoring the minor’s activity and ensuring safe use.",
          "Zelos may require identity or age verification to comply with COPPA and other youth-protection laws.",
        ],
      },
      {
        title: "4. Subscription & Payment",
        subsections: [
          {
            title: "4.1 Subscription Plans",
            paragraphs: [
              "Zelos offers monthly and annual subscription plans. Plan details, pricing, and features are listed at the time of purchase.",
            ],
          },
          {
            title: "4.2 Billing",
            paragraphs: [
              "Subscriptions renew automatically unless canceled.",
              "You authorize Zelos or its payment processor to charge your payment method for recurring fees.",
              "Failed payments may result in suspension or termination of access.",
            ],
          },
          {
            title: "4.3 Cancellation & Refunds",
            paragraphs: [
              "You may cancel at any time through your account settings.",
              "Cancellations take effect at the end of the current billing cycle.",
              "Refunds are issued only where required by law or explicitly stated in Zelos policies.",
            ],
          },
        ],
      },
      {
        title: "5. User Accounts & Responsibilities",
        subsections: [
          {
            title: "5.1 Account Security",
            paragraphs: [
              "You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately of any unauthorized access.",
            ],
          },
          {
            title: "5.2 Appropriate Use",
            paragraphs: ["Users agree not to:"],
            bullets: [
              "Share accounts or login credentials.",
              "Attempt to bypass security features.",
              "Upload harmful, inappropriate, or misleading content.",
              "Engage in bullying, harassment, or unsafe communication.",
              "Misuse educational tools for commercial or fraudulent purposes.",
            ],
          },
          {
            title: "Enforcement",
            paragraphs: [
              "Zelos may suspend or terminate accounts for violations.",
            ],
          },
        ],
      },
      {
        title: "6. Educational Content & Mentorship",
        subsections: [
          {
            title: "6.1 Purpose",
            paragraphs: [
              "Zelos provides educational content for informational purposes only. It is not professional financial, legal, or investment advice.",
            ],
          },
          {
            title: "6.2 Mentorship",
            paragraphs: ["Mentorship interactions:"],
            bullets: [
              "Are educational and supportive.",
              "Do not constitute professional advisory services.",
              "Must follow Zelos safety and communication guidelines.",
              "May be monitored for safety and quality assurance.",
            ],
          },
        ],
      },
      {
        title: "7. Privacy & Data Protection",
        paragraphs: [
          "Zelos is committed to protecting user privacy, especially for minors.",
        ],
        subsections: [
          {
            title: "7.1 Data Collected",
            bullets: [
              "Account information.",
              "Learning progress.",
              "Activity logs.",
              "Parent or guardian contact information.",
              "Communication preferences.",
            ],
          },
          {
            title: "7.2 How Data Is Used",
            bullets: [
              "Deliver personalized learning experiences.",
              "Improve platform performance.",
              "Ensure safety and compliance.",
              "Communicate with parents, guardians, and users.",
            ],
          },
          {
            title: "7.3 Children’s Data",
            paragraphs: [
              "For users under 13, data collection and use comply with COPPA and other applicable laws.",
            ],
          },
          {
            title: "7.4 Third-Party Services",
            paragraphs: [
              "Zelos may use trusted third-party providers for payment processing, analytics, or communication. These providers must meet strict security standards.",
            ],
          },
        ],
      },
      {
        title: "8. Safety & Community Standards",
        paragraphs: ["Users agree to follow Zelos community guidelines, including:"],
        bullets: [
          "Respectful communication.",
          "No sharing of personal contact information.",
          "No solicitation or inappropriate messaging.",
          "Reporting unsafe behavior immediately.",
        ],
        subsections: [
          {
            title: "Safety Enforcement",
            paragraphs: [
              "Zelos may restrict features or remove content to maintain a safe environment.",
            ],
          },
        ],
      },
      {
        title: "9. Intellectual Property",
        paragraphs: [
          "All Zelos content—including videos, curriculum, graphics, tools, and branding—is owned by Zelos Financial Literacy & Mentoring Program. Users may not copy, distribute, modify, or reproduce content without written permission.",
        ],
      },
      {
        title: "10. Disclaimers",
        paragraphs: [
          "Zelos provides educational content “as is” without warranties of any kind. We do not guarantee financial outcomes, investment performance, or professional results.",
        ],
      },
      {
        title: "11. Limitation of Liability",
        paragraphs: ["To the fullest extent permitted by law, Zelos is not liable for:"],
        bullets: [
          "Losses resulting from misuse of the Platform.",
          "Decisions made based on educational content.",
          "Unauthorized access due to user negligence.",
          "Interruptions, errors, or technical issues.",
        ],
        subsections: [
          {
            title: "Responsibility for Minors",
            paragraphs: [
              "Parents or guardians assume responsibility for minors’ use of the Platform.",
            ],
          },
        ],
      },
      {
        title: "12. Termination",
        paragraphs: ["Zelos may suspend or terminate accounts for:"],
        bullets: [
          "Violations of these Terms.",
          "Unsafe or inappropriate behavior.",
          "Fraudulent activity.",
          "Nonpayment.",
        ],
        subsections: [
          {
            title: "User Termination",
            paragraphs: [
              "Users may terminate their account at any time through account settings.",
            ],
          },
        ],
      },
      {
        title: "13. Changes to Terms",
        paragraphs: [
          "Zelos may update these Terms periodically. Continued use of the Platform after changes constitutes acceptance of the updated Terms.",
        ],
      },
      {
        title: "14. Contact Information",
        paragraphs: [
          "For questions or concerns regarding these Terms or the Platform, contact:",
          "Zelos Financial Literacy & Mentoring Program",
          "Email: [Insert]",
          "Phone: [Insert]",
          "Address: [Insert]",
        ],
      },
      {
        title: "15. Parent/Guardian Consent Form",
        paragraphs: [
          "For users under the age of 18, Zelos requires verified parental or legal guardian consent before account creation, subscription activation, or participation in any educational or mentorship activities. By completing the Parent/Guardian Consent Form, you (“Parent/Guardian”) acknowledge and agree to the terms outlined below.",
        ],
        subsections: [
          {
            title: "15.2 Consent to Create and Manage a Minor’s Account",
            bullets: [
              "You are the parent or legal guardian of the minor.",
              "You authorize the minor to access and use the Zelos Financial Literacy Platform.",
              "You understand that minors may engage with educational content, gamified learning modules, and age-appropriate financial literacy tools.",
              "You agree to supervise the minor’s use of the Platform and ensure compliance with all Terms of Service.",
            ],
          },
          {
            title: "15.3 Consent to Data Collection and Use",
            paragraphs: [
              "You grant permission for Zelos to collect, store, and use the minor’s information as described in the Privacy Policy, including:",
            ],
            bullets: [
              "Account details.",
              "Learning progress and activity data.",
              "Communication preferences.",
              "Parent or guardian contact information.",
            ],
          },
          {
            title: "Youth Privacy Compliance",
            paragraphs: [
              "Zelos adheres to COPPA and other applicable youth-protection laws.",
            ],
          },
          {
            title: "15.4 Consent to Communication",
            paragraphs: ["You authorize Zelos to:"],
            bullets: [
              "Send notifications related to the minor’s progress.",
              "Provide updates on new content, features, or safety alerts.",
              "Contact you regarding account management, billing, or compliance matters.",
            ],
          },
          {
            title: "Marketing to Minors",
            paragraphs: [
              "Zelos will not contact minors directly for marketing purposes.",
            ],
          },
          {
            title: "15.5 Consent to Mentorship Participation",
            paragraphs: [
              "If the minor participates in mentorship programming, you acknowledge that:",
            ],
            bullets: [
              "Mentorship interactions are educational and supportive.",
              "Communications may be monitored for safety and quality.",
              "You may adjust or revoke mentorship permissions at any time.",
            ],
          },
          {
            title: "15.6 Consent to Subscription and Billing",
            paragraphs: ["If you purchase a subscription for a minor:"],
            bullets: [
              "You authorize recurring billing according to the selected plan.",
              "You understand that cancellations must be made through your account settings.",
              "You accept responsibility for all charges associated with the minor’s account.",
            ],
          },
          {
            title: "15.7 Right to Withdraw Consent",
            paragraphs: ["You may withdraw consent at any time by:"],
            bullets: [
              "Deleting the minor’s account.",
              "Adjusting parental controls.",
              "Contacting Zelos support.",
            ],
          },
          {
            title: "Effect of Withdrawal",
            paragraphs: [
              "Withdrawal of consent may limit or terminate the minor’s access to the Platform.",
            ],
          },
          {
            title: "15.8 Acknowledgment and Agreement",
            paragraphs: [
              "By submitting the Parent/Guardian Consent Form, you acknowledge that:",
            ],
            bullets: [
              "You have read and understood the Terms of Service.",
              "You agree to all policies governing minors’ use of the Platform.",
              "You accept responsibility for the minor’s activity within Zelos.",
              "You consent to the collection and use of the minor’s data as described.",
            ],
          },
          {
            title: "Electronic Consent",
            paragraphs: [
              "Your digital signature or electronic confirmation constitutes legally binding consent.",
            ],
          },
        ],
      },
    ],
  },
  returns: {
    slug: "returns-exchanges",
    title: "Zelos Return, Exchange & Satisfaction Policy",
    shortTitle: "Returns & Exchanges",
    description:
      "The policy for made-to-order Zelos products, damaged or incorrect orders, cancellations, refunds, and customer support.",
    effectiveDate: "July 30, 2026",
    sections: [
      {
        title: "Our Commitment",
        paragraphs: [
          "Thank you for supporting Zelos.",
          "Every purchase helps advance our mission of empowering individuals through financial literacy, mentoring, leadership, and personal development. We are committed to delivering premium-quality apparel and merchandise along with exceptional customer service.",
          "Because each Zelos product is custom made specifically for you, please review the following policy before placing your order.",
        ],
      },
      {
        title: "Zelos Satisfaction Promise",
        paragraphs: [
          "Your trust matters to us.",
          "If your order arrives damaged, defective, incorrect, or does not meet our quality standards, we will work diligently to make it right.",
          "Our goal is simple: We want every customer to be proud to wear the Zelos brand.",
          "While not every situation will qualify for a refund or replacement, we promise to review every legitimate concern promptly, fairly, and professionally.",
        ],
      },
      {
        title: "Custom-Made Products",
        paragraphs: [
          "Every Zelos item is produced specifically for you after your order is placed. This includes:",
        ],
        bullets: [
          "T-shirts.",
          "Premium polos.",
          "Hoodies.",
          "Sweatshirts.",
          "Hats.",
          "Jackets.",
          "Drinkware.",
          "Bags.",
          "Accessories.",
          "Other custom merchandise.",
        ],
        subsections: [
          {
            title: "Made to Order",
            paragraphs: [
              "Because these products are made to order, returned items cannot be restocked or resold.",
            ],
          },
        ],
      },
      {
        title: "Returns",
        paragraphs: ["We do not accept returns for:"],
        bullets: [
          "Ordering the wrong size.",
          "Ordering the wrong color.",
          "Ordering the wrong style.",
          "Changing your mind after purchase.",
          "Buyer’s remorse.",
          "Accidental duplicate orders placed by the customer.",
        ],
        subsections: [
          {
            title: "Before You Order",
            paragraphs: [
              "Please review all sizing charts, colors, and product descriptions carefully before completing your purchase.",
            ],
          },
        ],
      },
      {
        title: "Exchanges",
        paragraphs: [
          "We do not offer exchanges for customer ordering errors, including:",
        ],
        bullets: [
          "Selecting the wrong size.",
          "Selecting the wrong color.",
          "Preferring a different product after delivery.",
        ],
        subsections: [
          {
            title: "Product Questions",
            paragraphs: [
              "If you are unsure about sizing or product details, please contact us before placing your order.",
            ],
          },
        ],
      },
      {
        title: "Damaged, Defective, or Incorrect Orders",
        paragraphs: ["Please contact us within 30 days of delivery if your order arrives:"],
        bullets: [
          "Damaged.",
          "Defective.",
          "Misprinted.",
          "Poorly embroidered.",
          "Incorrectly manufactured.",
          "With the incorrect item shipped.",
          "With the incorrect size sent due to our fulfillment partner’s error.",
        ],
        subsections: [
          {
            title: "What to Include",
            bullets: [
              "Full name.",
              "Order number.",
              "Email address used for the purchase.",
              "Description of the issue.",
              "Clear photographs showing the problem.",
            ],
          },
          {
            title: "Possible Resolutions",
            paragraphs: [
              "After reviewing your submission, Zelos will determine the appropriate resolution, which may include:",
            ],
            bullets: ["Replacement item.", "Refund.", "Store credit."],
          },
          {
            title: "Review",
            paragraphs: [
              "Resolution will depend on the circumstances and the nature of the issue.",
            ],
          },
        ],
      },
      {
        title: "Lost or Missing Packages",
        paragraphs: [
          "If tracking information indicates your package was lost during shipment, contact us immediately.",
          "We will work with our fulfillment and shipping partners to investigate and determine the appropriate resolution.",
        ],
      },
      {
        title: "Incorrect Shipping Address",
        paragraphs: [
          "Customers are responsible for providing an accurate shipping address.",
          "Orders already in production cannot be changed.",
          "Orders returned due to an incorrect address may require additional shipping charges before being resent.",
        ],
      },
      {
        title: "Order Cancellations",
        paragraphs: [
          "Orders begin production shortly after they are placed. If you need to cancel an order, contact us immediately.",
          "If production has not begun, we will cancel the order. If production has started, cancellations are generally not possible.",
        ],
      },
      {
        title: "Refund Policy",
        paragraphs: [
          "Approved refunds will be issued to the original payment method.",
          "Refund processing times vary depending on your financial institution.",
          "Shipping charges are typically non-refundable unless the error was caused by Zelos or one of our fulfillment partners.",
        ],
      },
      {
        title: "Quality Guarantee",
        paragraphs: [
          "Every Zelos order is reviewed to ensure it meets our quality expectations.",
          "If a product fails to meet those standards due to a manufacturing or printing error, we will make every reasonable effort to resolve the issue promptly.",
          "We stand behind the quality of the Zelos brand.",
        ],
      },
      {
        title: "Customer Service",
        paragraphs: [
          "Our Customer Experience Team is here to help.",
          "Email: support@zelos.org",
          "Website: www.zelos.org",
          "Business Hours: Monday–Friday, 9:00 AM–5:00 PM Eastern Time",
          "We strive to respond to all inquiries within 48 hours.",
        ],
      },
      {
        title: "Policy Updates",
        paragraphs: [
          "Zelos reserves the right to modify this Return, Exchange & Satisfaction Policy at any time. Any updates will be posted on our website and will apply to future purchases.",
        ],
      },
      {
        title: "Thank You",
        paragraphs: [
          "Thank you for supporting Zelos.",
          "Your purchase represents more than apparel or merchandise. It represents an investment in financial literacy, mentoring, leadership, and the next generation of future leaders.",
          "We are honored to have you as part of the Zelos community.",
        ],
      },
    ],
  },
  shipping: {
    slug: "shipping-policy",
    title: "Zelos Shipping Policy",
    shortTitle: "Shipping Policy",
    description:
      "Production, shipping, tracking, address, international delivery, and delivery-issue information for Zelos orders.",
    effectiveDate: "July 30, 2026",
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "All Zelos products are custom made after your order is placed. This allows us to offer premium products while minimizing waste. Please review the production and shipping timelines below before completing your purchase.",
        ],
      },
      {
        title: "Production Time",
        paragraphs: [
          "Most orders are produced within 3–7 business days. During holidays, special promotions, or peak periods, production may take up to 10 business days.",
          "Production begins shortly after an order is placed. Changes or cancellations are generally not possible once production begins.",
        ],
      },
      {
        title: "Shipping Time",
        paragraphs: ["Shipping time is in addition to production time."],
        bullets: [
          "Standard U.S. shipping: approximately 3–7 business days.",
          "Expedited U.S. shipping: approximately 2–4 business days.",
          "International shipping: delivery times vary by destination.",
        ],
        subsections: [
          {
            title: "Carrier Delays",
            paragraphs: [
              "Shipping carriers may experience delays outside the control of Zelos.",
            ],
          },
        ],
      },
      {
        title: "Shipping Rates",
        paragraphs: [
          "Shipping rates are calculated based on destination, carrier, package weight, and selected delivery speed.",
          "Shipping charges are non-refundable unless an error was caused by Zelos or a fulfillment partner.",
        ],
      },
      {
        title: "Tracking Information",
        paragraphs: [
          "When your order ships, you will receive an email with tracking information.",
          "If tracking has not updated within 48–72 hours, please contact our Customer Experience Team.",
        ],
      },
      {
        title: "Lost or Missing Packages",
        paragraphs: [
          "If your tracking information indicates that your package was lost during shipment, contact us immediately. We will work with our fulfillment and shipping partners to investigate and determine the appropriate resolution, which may include a replacement or store credit.",
          "Zelos is not responsible for packages marked delivered by the carrier.",
        ],
      },
      {
        title: "Incorrect Shipping Address",
        paragraphs: [
          "Customers are responsible for providing an accurate shipping address.",
          "An address cannot be changed after an order enters production.",
          "Orders returned because of an incorrect address may require additional shipping charges before being resent.",
        ],
      },
      {
        title: "Multiple Shipments",
        paragraphs: [
          "Some orders may arrive in multiple packages because products can be produced or fulfilled at different facilities. Separate tracking information may be provided for each shipment.",
        ],
      },
      {
        title: "International Orders",
        paragraphs: [
          "International customers are responsible for customs duties, taxes, import fees, and other charges required by the destination country. These charges are not included in product or shipping prices.",
          "Customs processing may cause delays outside the control of Zelos.",
        ],
      },
      {
        title: "Delivery Issues",
        paragraphs: [
          "Contact us within 30 days of delivery regarding a damaged, missing, or incorrect shipment.",
          "Please include your full name, order number, email address used for the purchase, a description of the issue, and clear photographs when applicable.",
        ],
      },
      {
        title: "Customer Support",
        paragraphs: [
          "Email: support@zelos.org",
          "Website: www.zelos.org",
          "Business Hours: Monday–Friday, 9:00 AM–5:00 PM Eastern Time",
          "We strive to respond to all inquiries within 48 hours.",
        ],
      },
      {
        title: "Policy Updates",
        paragraphs: [
          "Zelos may update this Shipping Policy at any time. Updates will be posted on our website and will apply to future purchases.",
        ],
      },
      {
        title: "Thank You",
        paragraphs: [
          "Thank you for supporting Zelos. Every purchase helps advance financial literacy, mentoring, leadership, and youth empowerment.",
        ],
      },
    ],
  },
  copyright: {
    slug: "copyright-trademark",
    title: "Zelos Copyright & Trademark Notice",
    shortTitle: "Copyright & Trademark",
    description:
      "Ownership and permitted use of Zelos content, curriculum, branding, designs, media, trademarks, and other intellectual property.",
    effectiveDate: "July 30, 2026",
    sections: [
      {
        title: "Intellectual Property Rights",
        paragraphs: [
          "All content available through the Zelos website, programs, platforms, and services is the exclusive property of Zelos unless otherwise stated. This includes:",
        ],
        bullets: [
          "Text, articles, curriculum, and educational materials.",
          "Logos, trademarks, and brand identifiers.",
          "Images, graphics, icons, and design elements.",
          "Videos, audio, and multimedia content.",
          "Product designs, apparel artwork, and merchandise concepts.",
          "Website layout, structure, and functionality.",
        ],
        subsections: [
          {
            title: "Legal Protection",
            paragraphs: [
              "Zelos intellectual property is protected by United States and international copyright, trademark, and other intellectual property laws.",
            ],
          },
        ],
      },
      {
        title: "Copyright Notice",
        paragraphs: [
          "© Zelos. All rights reserved.",
          "No Zelos content may be copied, reproduced, distributed, modified, republished, uploaded, posted, transmitted, or used without prior written permission from Zelos.",
          "Unauthorized use is strictly prohibited.",
        ],
      },
      {
        title: "Trademark Notice",
        paragraphs: [
          "The Zelos name, logo, brand identifiers, program names, and related marks are trademarks or registered trademarks of Zelos.",
          "Zelos marks may not be used:",
        ],
        bullets: [
          "In connection with any unrelated product or service.",
          "In a manner likely to cause confusion.",
          "To misrepresent sponsorship, partnership, or endorsement.",
          "Without prior written authorization.",
        ],
        subsections: [
          {
            title: "Misuse",
            paragraphs: [
              "Misuse of Zelos trademarks may result in legal action.",
            ],
          },
        ],
      },
      {
        title: "Use of Zelos Materials",
        paragraphs: ["Without written permission, you may not:"],
        bullets: [
          "Copy Zelos merchandise designs.",
          "Use Zelos branding for personal or commercial projects.",
          "Reproduce curriculum or educational content.",
          "Create derivative works based on Zelos materials.",
        ],
        subsections: [
          {
            title: "Limited Use",
            paragraphs: [
              "Limited educational or nonprofit use may be permitted only with written approval from Zelos.",
            ],
          },
        ],
      },
      {
        title: "Reporting Intellectual Property Concerns",
        paragraphs: [
          "If you believe Zelos content or intellectual property has been used improperly, contact us:",
          "Email: support@zelos.org",
          "Website: www.zelos.org",
          "We strive to respond to inquiries within 48 hours.",
        ],
      },
      {
        title: "Policy Updates",
        paragraphs: [
          "Zelos may update this Copyright & Trademark Notice at any time. Updates will be posted on our website.",
        ],
      },
      {
        title: "Thank You",
        paragraphs: [
          "Thank you for respecting the Zelos brand, mission, and intellectual property.",
        ],
      },
    ],
  },
  disclaimer: {
    slug: "disclaimer",
    title: "Zelos Disclaimer",
    shortTitle: "Disclaimer",
    description:
      "Important limitations concerning Zelos educational information, third-party services, merchandise, outcomes, and liability.",
    effectiveDate: "July 30, 2026",
    sections: [
      {
        title: "General Information",
        paragraphs: [
          "The information provided through the Zelos website, programs, events, mentoring activities, curriculum, and digital content is for general educational and informational purposes only.",
          "Zelos makes no guarantees regarding the completeness, reliability, or suitability of this information for any particular purpose.",
        ],
      },
      {
        title: "Not Financial, Legal, or Professional Advice",
        paragraphs: [
          "Zelos provides education related to financial literacy, mentoring, leadership, personal growth, and youth empowerment. Zelos content does not constitute personalized financial, legal, tax, investment, medical, psychological, or other professional advice.",
          "Consult a qualified professional before making decisions related to investments, financial planning, legal matters, taxes, medical care, or psychological care.",
          "Use of Zelos information is at your own discretion and risk.",
        ],
      },
      {
        title: "No Guarantees of Outcomes",
        paragraphs: [
          "Participation in Zelos programs, mentoring, workshops, or educational content does not guarantee financial, academic, career, or personal development outcomes.",
          "Individual performance and success depend on many factors beyond the control of Zelos.",
        ],
      },
      {
        title: "Accuracy and Availability",
        paragraphs: [
          "Zelos does not warrant that website content will be error-free or always current, that third-party information will be accurate, or that the website and services will always be available without interruption.",
          "We may correct or update information at any time.",
        ],
      },
      {
        title: "Third-Party Links and Services",
        paragraphs: [
          "Zelos may use or link to third-party services for payment processing, merchandise fulfillment, event registration, communication, or other platform functions.",
          "Zelos is not responsible for the availability, content, actions, policies, or security practices of third-party providers. Review their terms and policies before use.",
        ],
      },
      {
        title: "Merchandise Disclaimer",
        paragraphs: [
          "Zelos merchandise is custom made. Product colors, sizing, and appearance may vary slightly due to screen settings, manufacturing, or material differences.",
          "Minor variations are not considered defects.",
        ],
      },
      {
        title: "Limitation of Liability",
        paragraphs: [
          "To the fullest extent permitted by law, Zelos is not liable for direct, indirect, incidental, special, or consequential damages arising from the use of our website, programs, products, or services.",
          "Zelos is not responsible for losses caused by third parties, shipping carriers, fulfillment partners, user-provided information, or circumstances beyond our reasonable control.",
          "Participation in Zelos programs and use of Zelos services is voluntary and at your own risk.",
        ],
      },
      {
        title: "Contact Information",
        paragraphs: [
          "For questions about this Disclaimer, contact our Customer Experience Team:",
          "Email: support@zelos.org",
          "Website: www.zelos.org",
          "Business Hours: Monday–Friday, 9:00 AM–5:00 PM Eastern Time",
          "We strive to respond to inquiries within 48 hours.",
        ],
      },
      {
        title: "Policy Updates",
        paragraphs: [
          "Zelos may update this Disclaimer at any time. Updates will be posted on our website and will apply to future use of our services.",
        ],
      },
      {
        title: "Thank You",
        paragraphs: [
          "Thank you for being part of the Zelos community and for using our educational resources responsibly.",
        ],
      },
    ],
  },
  notices: {
    slug: "legal-notices",
    title: "Zelos Legal Notices",
    shortTitle: "Legal Notices",
    description:
      "A convenient overview of the principal legal policies governing the Zelos website, merchandise, programs, and services.",
    effectiveDate: "July 30, 2026",
    sections: [
      {
        title: "1. Overview",
        paragraphs: [
          "These Legal Notices govern the use of the Zelos website, merchandise, programs, and services. By using Zelos services, you acknowledge and agree to the policies summarized here and to the complete policies linked throughout the website.",
        ],
      },
      {
        title: "2. Terms & Conditions",
        paragraphs: ["When using Zelos services, you agree to:"],
        bullets: [
          "Use the website only for lawful purposes.",
          "Not copy or misuse Zelos content.",
          "Follow program and community guidelines.",
          "Review product details before purchasing.",
          "Accept the applicable Return & Exchange Policy.",
        ],
        subsections: [
          {
            title: "Updates",
            paragraphs: [
              "Zelos may update its Terms & Conditions at any time.",
            ],
          },
        ],
      },
      {
        title: "3. Privacy Policy",
        paragraphs: ["Zelos may collect:"],
        bullets: [
          "Contact information.",
          "Shipping and billing information.",
          "Payment information processed securely by third parties.",
          "Website usage information.",
          "Program and event registration information.",
        ],
        subsections: [
          {
            title: "Personal Information",
            paragraphs: [
              "Zelos does not sell personal information.",
            ],
          },
        ],
      },
      {
        title: "4. Copyright & Trademark",
        paragraphs: ["Zelos intellectual property includes:"],
        bullets: [
          "Logos and brand identifiers.",
          "Curriculum and educational content.",
          "Merchandise designs.",
          "Website text, graphics, videos, and media.",
        ],
        subsections: [
          {
            title: "Permission",
            paragraphs: [
              "Zelos intellectual property may not be copied, modified, reproduced, distributed, or used without written permission.",
            ],
          },
        ],
      },
      {
        title: "5. Return & Exchange Policy",
        paragraphs: [
          "Because Zelos products are custom made, we do not accept returns or exchanges for the wrong size, color, or style; a change of mind; buyer’s remorse; or accidental duplicate orders.",
          "For damaged, defective, or incorrect orders, contact Zelos within 30 days of delivery.",
        ],
      },
      {
        title: "6. Shipping Policy",
        bullets: [
          "Production usually takes 3–7 business days.",
          "Standard U.S. shipping usually takes 3–7 business days after production.",
          "International delivery times vary.",
          "Customers are responsible for providing a correct shipping address.",
          "Shipping charges are non-refundable unless Zelos or its fulfillment partner caused the error.",
        ],
        subsections: [
          {
            title: "Lost Shipments",
            paragraphs: [
              "Contact Zelos promptly regarding a shipment that appears lost.",
            ],
          },
        ],
      },
      {
        title: "7. Disclaimer",
        paragraphs: [
          "Zelos content is provided for educational and informational purposes only. It is not personalized financial, legal, tax, investment, medical, psychological, or other professional advice.",
          "Zelos does not guarantee specific financial, academic, career, or personal outcomes.",
          "Participation in Zelos programs and use of Zelos services is voluntary and at your own risk.",
        ],
      },
      {
        title: "8. Limitation of Liability",
        paragraphs: [
          "To the fullest extent permitted by law, Zelos is not liable for losses or damages arising from the misuse of our website or services, third-party providers or shipping carriers, inaccurate user information, or interruptions and delays beyond our control.",
        ],
      },
      {
        title: "9. Policy Updates",
        paragraphs: [
          "Zelos may update these policies at any time. Updates will be posted on the website and will apply to future use, purchases, or participation.",
        ],
      },
      {
        title: "10. Contact Information",
        paragraphs: [
          "Email: support@zelos.org",
          "Website: www.zelos.org",
          "Business Hours: Monday–Friday, 9:00 AM–5:00 PM Eastern Time",
          "We strive to respond to inquiries within 48 hours.",
        ],
      },
      {
        title: "11. Thank You",
        paragraphs: [
          "Thank you for supporting Zelos and our mission of financial literacy, mentoring, leadership, and youth empowerment.",
        ],
      },
    ],
  },
  faq: {
    slug: "faq",
    title: "Frequently Asked Questions",
    shortTitle: "FAQ",
    description:
      "Plain-language answers about Zelos terms, custom products, returns, shipping, cancellations, privacy, content, and third-party services.",
    sections: [
      {
        title: "What is Zelos?",
        paragraphs: [
          "Zelos is a nonprofit organization focused on financial literacy, mentoring, leadership development, and youth empowerment. Our website, programs, products, and digital resources support this mission.",
        ],
      },
      {
        title: "What does using the Zelos website mean?",
        paragraphs: [
          "By visiting our website, creating an account, purchasing a product, making a donation, or participating in a Zelos program, you agree to our Terms & Conditions and the policies linked on this website.",
        ],
      },
      {
        title: "Are Zelos products custom made?",
        paragraphs: [
          "Yes. Zelos merchandise is made after an order is placed. Because each product is custom made, returned items cannot be restocked or resold.",
        ],
      },
      {
        title: "Can I return or exchange an item?",
        paragraphs: [
          "We do not accept returns or exchanges for ordering the wrong size, color, or style; changing your mind; buyer’s remorse; or accidental duplicate orders. Review all sizing charts and product details before completing your purchase.",
        ],
      },
      {
        title: "What if my order is damaged, defective, or incorrect?",
        paragraphs: [
          "Contact Zelos within 30 days of delivery. Include your full name, order number, purchase email address, a description of the issue, and clear photographs. Depending on the circumstances, the resolution may include a replacement, refund, or store credit.",
        ],
      },
      {
        title: "What if my package is lost?",
        paragraphs: [
          "Contact us immediately if tracking indicates your package was lost. We will work with our fulfillment and shipping partners to investigate and determine the appropriate resolution.",
        ],
      },
      {
        title: "What if I entered the wrong shipping address?",
        paragraphs: [
          "Customers are responsible for providing an accurate shipping address. An address usually cannot be changed after an order enters production. If an order is returned because of an incorrect address, additional shipping charges may be required.",
        ],
      },
      {
        title: "Can I cancel an order?",
        paragraphs: [
          "Contact us immediately. If production has not begun, the order may be canceled. Once production starts, cancellation is generally not possible.",
        ],
      },
      {
        title: "How do refunds work?",
        paragraphs: [
          "Approved refunds are issued to the original payment method. Processing time depends on your financial institution. Shipping charges are generally non-refundable unless Zelos or a fulfillment partner caused the error.",
        ],
      },
      {
        title: "Is Zelos content protected?",
        paragraphs: [
          "Yes. Zelos logos, branding, curriculum, educational content, product designs, website text, images, videos, and other materials are protected intellectual property and may not be used without written permission.",
        ],
      },
      {
        title: "Does Zelos use third-party services?",
        paragraphs: [
          "Yes. Zelos may use third-party providers for payment processing, merchandise fulfillment, event registration, shipping, or communication. Review the terms and privacy practices of those providers.",
        ],
      },
      {
        title: "How does Zelos protect my privacy?",
        paragraphs: [
          "Our Privacy Policy explains the information we collect, how it is used, when it may be shared with service providers, and the choices available to you. Zelos does not sell personal information.",
        ],
      },
      {
        title: "Can Zelos update its policies?",
        paragraphs: [
          "Yes. Zelos may update its policies at any time. Changes will be posted on the website and will apply to future use, purchases, and participation.",
        ],
      },
      {
        title: "How can I contact Zelos?",
        paragraphs: [
          "Email: support@zelos.org",
          "Website: www.zelos.org",
          "Business Hours: Monday–Friday, 9:00 AM–5:00 PM Eastern Time",
          "We strive to respond to inquiries within 48 hours.",
        ],
      },
      {
        title: "Thank You",
        paragraphs: [
          "Thank you for supporting Zelos and our work in financial literacy, mentoring, leadership, and youth empowerment.",
        ],
      },
    ],
  },
} satisfies Record<string, LegalDocument>;
