// KISANMITRA GOVERNMENT SCHEMES & ADVISORY CATALOGUE

const SCHEMES_DATA = [
  {
    id: "pm_kisan",
    title: "PM-KISAN Samman Nidhi",
    category: "dbt",
    benefit: "₹6,000 / year in 3 equal installments",
    eligibility: "All small and marginal landholding farmer families across India.",
    description: "Direct bank transfer financial support provided by the Government of India directly into verified Aadhaar-linked bank accounts.",
    portal_url: "https://pmkisan.gov.in",
    helpline: "155261 / 011-24300606",
    status: "Active · 18th Installment Disbursed"
  },
  {
    id: "pmfby",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    category: "insurance",
    benefit: "Comprehensive crop loss risk cover at low premium (1.5% - 2%)",
    eligibility: "Farmers growing notified crops in notified areas (both loanee and non-loanee).",
    description: "Financial support to farmers suffering crop loss/damage arising out of unforeseen natural calamities like droughts, floods, hailstorms, and pests.",
    portal_url: "https://pmfby.gov.in",
    helpline: "1800-180-2117",
    status: "Active · Kharif & Rabi Coverage Open"
  },
  {
    id: "pm_kusum",
    title: "PM-KUSUM Solar Pump Scheme",
    category: "solar",
    benefit: "Up to 60% subsidy for installing solar agricultural pumps",
    eligibility: "Individual farmers, water user associations, and cooperatives.",
    description: "Enables farmers to install solar water pumps and grid-connected solar power plants on barren or cultivable agricultural lands, reducing diesel costs to zero.",
    portal_url: "https://pmkusum.mnre.gov.in",
    helpline: "1800-180-3333",
    status: "Active · Component A, B & C Available"
  },
  {
    id: "soil_health_card",
    title: "Soil Health Card Scheme",
    category: "subsidies",
    benefit: "Free comprehensive soil nutrient test & dosage recommendations",
    eligibility: "All farm owners across India (issued every 2 years).",
    description: "Provides soil health status on 12 nutrient parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) with tailored fertilizer advisory to cut input costs.",
    portal_url: "https://soilhealth.dac.gov.in",
    helpline: "011-23382012",
    status: "Active · Pan-India Testing Labs Online"
  },
  {
    id: "aif",
    title: "Agriculture Infrastructure Fund (AIF)",
    category: "subsidies",
    benefit: "3% interest subvention on bank loans up to ₹2 Crores",
    eligibility: "Farmers, FPOs, Agri-entrepreneurs, and Start-ups.",
    description: "Medium to long term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.",
    portal_url: "https://agriinfra.dac.gov.in",
    helpline: "1800-180-1551",
    status: "Active · Fast-Track Loan Approvals"
  },
  {
    id: "enam",
    title: "National Agriculture Market (e-NAM)",
    category: "dbt",
    benefit: "Online pan-India electronic trading portal for farm produce",
    eligibility: "Registered farmers with state APMC / Mandi trade licenses.",
    description: "Unifies existing APMC mandis across states into a single online market platform, enabling better price discovery through transparent bidding.",
    portal_url: "https://enam.gov.in",
    helpline: "1800-270-0224",
    status: "Active · 1,361+ Mandis Integrated"
  }
];

exports.getSchemes = (req, res) => {
  const { cat, q } = req.query;
  let result = [...SCHEMES_DATA];

  if (cat && cat !== 'all') {
    result = result.filter(s => s.category.toLowerCase() === cat.toLowerCase());
  }

  if (q) {
    const search = q.toLowerCase();
    result = result.filter(s => 
      s.title.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search) ||
      s.benefit.toLowerCase().includes(search)
    );
  }

  res.json({
    success: true,
    count: result.length,
    schemes: result
  });
};

exports.getSchemeById = (req, res) => {
  const scheme = SCHEMES_DATA.find(s => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found.' });
  }
  res.json({ success: true, scheme });
};
