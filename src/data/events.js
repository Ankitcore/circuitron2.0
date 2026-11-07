export const events = [
  {
    id: 1,
    title: "Project Exhibition",
    tagline: "Showcase Innovation",
    arenaNumber: "01",
    description:
      "Exhibit your innovative hardware and software projects. The flagship multi-category arena to present working engineering models before academic peers, professors, and industry juries.",
    category: "Exhibition",
    requirements: "Working hardware/software model or prototype",
    registrationLink: "https://forms.gle/mNU3damnJBMfnmSU7",
    prizePool: "₹54,000",
    prizeDetails: "Divided across 3 groups: Eklavya (Std 8-10), Lakshya (Std 11-12), and Arjuna (UG/Diploma)",
  },
  {
    id: 2,
    title: "Robo War",
    tagline: "May the Best Bot Wreck",
    arenaNumber: "03",
    description:
      "High-octane robot combat championship. Combat robots clash head-to-head in a reinforced arena. Weaponized bots, armor deflection, and tactical maneuvering decide the ultimate arena champion.",
    category: "Robotics",
    requirements: "Combat-ready robot matching weight and weapon safety specs",
    registrationLink: "https://forms.gle/EGqdueaPzzKsWuuBA",
    prizePool: "Pool ₹10,000",
    prizeDetails: "1st: ₹5,000 + Trophy • 2nd: ₹3,000 + Trophy • 3rd: ₹2,000 + Trophy",
  },
  {
    id: 3,
    title: "Robo Race",
    tagline: "Build a Fast, Controllable Bot",
    arenaNumber: "02",
    description:
      "Build a fast, controllable bot and race it across multi-terrain obstacles, steep ramps, sand pits, and tight chicanes. Navigate challenging courses to cross the finish line in record time.",
    category: "Robotics",
    requirements: "Custom-built racing bot with responsive telemetry/control",
    registrationLink: "https://forms.gle/EGqdueaPzzKsWuuBA",
    prizePool: "Pool ₹10,000",
    prizeDetails: "1st: ₹5,000 + Trophy • 2nd: ₹3,000 + Trophy • 3rd: ₹2,000 + Trophy",
  },
];

export const exhibitionGroups = [
  {
    id: "eklavya",
    group: "GROUP 1",
    name: "Eklavya",
    badge: "School Category",
    audience: "Std. 8 to 10",
    topic: "Any working model related to science and technology.",
    firstPrize: "₹5,000",
    secondPrize: "₹3,000",
    thirdPrize: "₹2,000",
    totalPool: "₹10,000",
    themeColor: "emerald",
    borderColor: "border-emerald-500/40",
    bgGradient: "from-emerald-500/10 via-darkNavy to-darkNavy",
    accentColor: "text-emerald-400",
    btnColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    id: "lakshya",
    group: "GROUP 2",
    name: "Lakshya",
    badge: "Higher Secondary",
    audience: "Std. 11 & 12",
    topic: "Real-time working model related to science and engineering.",
    firstPrize: "₹10,000",
    secondPrize: "₹6,000",
    thirdPrize: "₹4,000",
    totalPool: "₹20,000",
    themeColor: "cyan",
    borderColor: "border-cyan-500/40",
    bgGradient: "from-cyan-500/10 via-darkNavy to-darkNavy",
    accentColor: "text-cyan-400",
    btnColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  {
    id: "arjuna",
    group: "GROUP 3",
    name: "Arjuna",
    badge: "UG & Diploma",
    audience: "Undergraduate & Diploma",
    topic: "Real-life problem-solving working model related to engineering and technology.",
    firstPrize: "₹12,000",
    secondPrize: "₹7,000",
    thirdPrize: "₹5,000",
    totalPool: "₹24,000",
    themeColor: "amber",
    borderColor: "border-amber-500/40",
    bgGradient: "from-amber-500/10 via-darkNavy to-darkNavy",
    accentColor: "text-amber-400",
    btnColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
];

export const prizePoolDistribution = {
  grandTotal: "₹1,00,000",
  registration: "FREE Registration",
  date: "30 November 2026",
  venue: "RVSCET, Jamshedpur",
  projectExhibition: {
    title: "Project Exhibition",
    subtotal: "₹54,000",
    groups: [
      {
        name: "Eklavya (Std. 8–10)",
        prizes: [
          { rank: "1st", amount: "₹5,000" },
          { rank: "2nd", amount: "₹3,000" },
          { rank: "3rd", amount: "₹2,000" },
        ],
      },
      {
        name: "Lakshya (Std. 11 & 12)",
        prizes: [
          { rank: "1st", amount: "₹10,000" },
          { rank: "2nd", amount: "₹6,000" },
          { rank: "3rd", amount: "₹4,000" },
        ],
      },
      {
        name: "Arjuna (UG & Diploma)",
        prizes: [
          { rank: "1st", amount: "₹12,000" },
          { rank: "2nd", amount: "₹7,000" },
          { rank: "3rd", amount: "₹5,000" },
        ],
      },
    ],
  },
  robotics: [
    {
      name: "Robo War",
      pool: "₹10,000",
      prizes: [
        { rank: "1st", amount: "₹5,000", perk: "Cash + Trophy" },
        { rank: "2nd", amount: "₹3,000", perk: "Cash + Trophy" },
        { rank: "3rd", amount: "₹2,000", perk: "Cash + Trophy" },
      ],
    },
    {
      name: "Robo Race",
      pool: "₹10,000",
      prizes: [
        { rank: "1st", amount: "₹5,000", perk: "Cash + Trophy" },
        { rank: "2nd", amount: "₹3,000", perk: "Cash + Trophy" },
        { rank: "3rd", amount: "₹2,000", perk: "Cash + Trophy" },
      ],
    },
  ],
  participantPerks: [
    {
      title: "Verified Certificates",
      desc: "Official participation certificates for all valid team registrations",
      icon: "Award",
    },
    {
      title: "Exclusive Swag",
      desc: "TechXpo badges, stickers, and Circuitron IoT merchandise",
      icon: "Gift",
    },
    {
      title: "Free Tool Credits",
      desc: "Development software vouchers, cloud credits, and prototyping tools",
      icon: "Wrench",
    },
    {
      title: "Hiring Pool Access",
      desc: "Direct access to partner tech companies, mentors, and hackathons",
      icon: "Users",
    },
  ],
};

export const rulesAndGuidelines = {
  teamRules: [
    { num: "01", text: "2 to 4 members per team. Solo participation is not allowed." },
    { num: "02", text: "Inter-college and inter-school teams are welcome." },
    { num: "03", text: "Every team needs a unique name and a designated team leader." },
    { num: "04", text: "All team members must be registered before the deadline." },
  ],
  bringOnDay: [
    { title: "ID Proof", desc: "Your college/school ID card and a valid Aadhaar card." },
    {
      title: "Consent Form",
      desc: "Signed by your institution. Downloadable from the official portal.",
      link: "https://drive.google.com/file/d/1JFCu9FgjKEwbq1IvaDAJ1vKGnCU7nd3I/view?usp=drive_link",
      linkText: "Download Consent Form (PDF)",
      localPdf: "/assets/techxpo-2.0-consent-form.pdf",
    },
    { title: "Your Own Kit", desc: "Laptop, software, extensions, and tools for the exhibition." },
  ],
  fairPlay: [
    "Show respect towards competitors, judges and staff. Unsportsmanlike behaviour will not be tolerated.",
    "Tampering with or damaging another team's equipment leads to immediate disqualification.",
    "Personal belongings (laptops, phones, kits, etc.) are your own responsibility.",
    "Judges' and coordinators' decisions are final and binding.",
  ],
};

export const BROCHURE_CONFIG = {
  driveUrl: "https://drive.google.com/file/d/1BnXjrzGn_Y86PqJAFMarpxXRjEKq6CjT/view?usp=sharing",
  pdfPath: "/assets/techxpo-2.0-brochure.pdf",
  downloadName: "TechXpo_2.0_Official_Brochure.pdf",
  title: "TechXpo 2.O Official Brochure",
  size: "4.9 MB",
  pages: 8,
};

export const CONSENT_FORM_CONFIG = {
  driveUrl: "https://drive.google.com/file/d/1JFCu9FgjKEwbq1IvaDAJ1vKGnCU7nd3I/view?usp=drive_link",
  pdfPath: "/assets/techxpo-2.0-consent-form.pdf",
  downloadName: "TechXpo_2.0_Institutional_Consent_Form.pdf",
  title: "TechXpo 2.O Institutional Consent Form",
};
