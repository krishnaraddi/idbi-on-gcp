import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { MSMEApplication, ScoreOutput, ScoreParameters, ApplicationStatus, RiskLevel } from "./src/types.js";

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Database file path for local persistence
const DB_FILE = path.join(process.cwd(), "data", "applications.json");

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Seed mock applications if file doesn't exist
const initialApplications: MSMEApplication[] = [
  {
    applicationId: "APP-408912",
    msmeId: "UDYAM-MH-12-0048291",
    companyName: "TechCraft Solutions Pvt Ltd",
    gstIN: "27AADCT1245G1Z9",
    gstCompliance: 98,
    upiInflows: 1500000,
    epfoContributions: 180000,
    industryType: "Services",
    loanAmount: 3000000,
    status: "Approved",
    score: 815,
    riskLevel: "Low",
    recommendation: "Approved (Pre-approved under India Stack Fast-Track Scheme)",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    analysis: {
      summary: "TechCraft Solutions displays exemplary compliance and excellent digital cashflow margins relative to the requested credit facility. Highly recommended for premium low-interest MSME loan pricing.",
      gstScore: 196,
      upiScore: 300,
      epfoScore: 200,
      gstAnalysis: "Outstanding GST filing compliance rate of 98%. System confirms consistent invoice uploads and minimal deviations between GSTR-1 and GSTR-3B filings over the past 12 months.",
      upiAnalysis: "Robust monthly UPI inflow of ₹15.00 Lakhs represents 50% of the total loan amount requested. Digital ledger records over 450 unique business transactions monthly, showing highly diversified customer risk.",
      epfoAnalysis: "Active EPFO enrollment with regular monthly payroll contributions of ₹1.80 Lakhs. Indicates stable formal employment base (~15-18 employees) and steady corporate expansion.",
      industryAnalysis: "Operating in the fast-growing tech services industry with low fixed capital overhead. The cashflow-to-debt capability is exceptionally strong."
    }
  },
  {
    applicationId: "APP-209843",
    msmeId: "UDYAM-GJ-24-0012938",
    companyName: "Karan Garments & Textiles",
    gstIN: "24AAECG8752D1Z5",
    gstCompliance: 90,
    upiInflows: 450000,
    epfoContributions: 40000,
    industryType: "Manufacturing",
    loanAmount: 1500000,
    status: "Review",
    score: 665,
    riskLevel: "Medium",
    recommendation: "Review (Recommended for manual verification of seasonal invoice receipts)",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    analysis: {
      summary: "Karan Garments exhibits steady manufacturing volume but tighter working capital coverage. Moderate credit rating suggests manual collateral appraisal or CGTMSE guarantee backing.",
      gstScore: 180,
      upiScore: 250,
      epfoScore: 150,
      gstAnalysis: "Strong GST filing rate of 90%. Consistent filing history but shows slight variations in seasonal tax liability, typical of the apparel industry.",
      upiAnalysis: "Monthly digital cashflows average ₹4.50 Lakhs, covering roughly 30% of the requested ₹15 Lakhs loan amount. Transactions are concentrated around 10-12 wholesale distributors.",
      epfoAnalysis: " EPFO contributions of ₹40,000 monthly denote a micro manufacturing team (~4-6 formal employees). Contributions are mostly regular but have shown a 2-week lag in previous quarters.",
      industryAnalysis: "Manufacturing sector typically bears higher inventory carriage costs. Working capital rotation matches credit cycle requirements, but warrants closer bank scrutiny of peak-season receipts."
    }
  },
  {
    applicationId: "APP-891043",
    msmeId: "UDYAM-UP-48-0092837",
    companyName: "Om Sai Kirana Store",
    gstIN: "09AAHPB4291A1ZA",
    gstCompliance: 62,
    upiInflows: 85000,
    epfoContributions: 0,
    industryType: "Retail",
    loanAmount: 800000,
    status: "Rejected",
    score: 410,
    riskLevel: "High",
    recommendation: "Rejected (Inadequate cashflow coverage and low tax compliance)",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    analysis: {
      summary: "Om Sai Kirana Store shows significant financial distress indicators including irregular tax filings, inadequate digital inflows relative to the requested ₹8 Lakhs loan, and absent formal payroll data.",
      gstScore: 124,
      upiScore: 100,
      epfoScore: 50,
      gstAnalysis: "Sub-par GST compliance at 62% filing frequency. Multiple delays in tax declarations raise severe transparency and credit audit concerns.",
      upiAnalysis: "Average monthly UPI inflow of ₹85,000 is extremely low compared to the ₹8.00 Lakh requested facility. Debt-service coverage ratio is highly strained, indicating high default risk.",
      epfoAnalysis: "Zero active EPFO registration. No formal employee payroll registered. Highly reliant on temporary, informal workforce, typical of unorganized retail but unfavorable for structured bank lending.",
      industryAnalysis: "Hyper-local retail grocery faces intensive pricing competition. Without verifiable digital banking trails, standard credit facilities cannot be extended."
    }
  }
];

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialApplications, null, 2));
}

// Read database helper
function readDb(): MSMEApplication[] {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB file, returning empty array", err);
    return [];
  }
}

// Write database helper
function writeDb(data: MSMEApplication[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to DB file", err);
  }
}

// Lazy Initialize Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to rule-based scoring engine.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Local deterministic ML/heuristic credit scoring engine
function calculateCreditScore(params: ScoreParameters): ScoreOutput {
  const { gstCompliance, upiInflows, epfoContributions, loanAmount, industryType } = params;

  // 1. GST compliance points (Max 200)
  const gstScore = Math.round((gstCompliance / 100) * 200);

  // 2. UPI cashflow margin ratio points (Max 350)
  // Ratio of monthly cashflow to total loan requested
  const cashflowRatio = upiInflows / loanAmount;
  let upiScore = 100;
  if (cashflowRatio >= 1.0) {
    upiScore = 350;
  } else if (cashflowRatio >= 0.5) {
    upiScore = 300;
  } else if (cashflowRatio >= 0.2) {
    upiScore = 250;
  } else if (cashflowRatio >= 0.1) {
    upiScore = 200;
  } else if (cashflowRatio >= 0.05) {
    upiScore = 150;
  }

  // 3. EPFO Employee size and consistency points (Max 250)
  let epfoScore = 50;
  if (epfoContributions >= 500000) {
    epfoScore = 250;
  } else if (epfoContributions >= 200000) {
    epfoScore = 220;
  } else if (epfoContributions >= 80000) {
    epfoScore = 180;
  } else if (epfoContributions >= 30000) {
    epfoScore = 140;
  } else if (epfoContributions > 0) {
    epfoScore = 100;
  }

  // 4. Base Score (100)
  const basePoints = 100;

  // Total credit score (Clamped between 300 and 900)
  const totalScore = Math.max(300, Math.min(900, gstScore + upiScore + epfoScore + basePoints));

  // Determine Risk Level & Primary Recommendation
  let riskLevel: RiskLevel = "High";
  let recommendation = "Rejected";
  let summary = "";

  if (totalScore >= 750) {
    riskLevel = "Low";
    recommendation = "Approved (Recommended for immediate sanction)";
    summary = "MSME displays exceptional digital trail compliance, superior monthly cashflow liquidity and high operational stability. Approved under IDBI automated credit-decision standards.";
  } else if (totalScore >= 600) {
    riskLevel = "Medium";
    recommendation = "Review (Recommended for manual verification)";
    summary = "MSME demonstrates healthy business volumes, but features higher leverage ratios or micro-employment records. Recommended for standard underwriting review with CGTMSE guarantee consideration.";
  } else {
    riskLevel = "High";
    recommendation = "Rejected (Insufficient risk buffers)";
    summary = "MSME presents elevated default probabilities. Critical shortfalls in digital banking transaction volumes, combined with tax compliance irregularities, preclude automated lending facilities.";
  }

  // Fallback localized analysis texts (if Gemini is unavailable)
  const gstAnalysis = gstCompliance >= 90
    ? `Strong tax discipline with GST filing rate of ${gstCompliance}%. Verifiable invoice history indicates reliable sales accounting and zero structural reporting delays.`
    : gstCompliance >= 75
    ? `Moderate GST filing rate at ${gstCompliance}%. Operational reporting is steady but exhibits occasional delays in filing monthly GSTR-3B tax returns.`
    : `Irregular GST compliance at ${gstCompliance}%. Highlights risk of inaccurate revenue bookkeeping, potential penalties, and lack of transaction transparency.`;

  const upiAnalysis = upiInflows >= loanAmount * 0.5
    ? `Excellent digital footprint. Average monthly UPI cash inflows of ₹${(upiInflows / 100000).toFixed(2)} Lakhs represents a robust ${(cashflowRatio * 100).toFixed(0)}% monthly coverage of the requested loan amount.`
    : upiInflows >= loanAmount * 0.1
    ? `Moderate transaction volume. Monthly UPI inflows of ₹${(upiInflows / 100000).toFixed(2)} Lakhs cover ${(cashflowRatio * 100).toFixed(0)}% of the requested loan. Suggests tighter cash reserves.`
    : `Inadequate digital velocity. Monthly UPI cash inflows of ₹${(upiInflows / 100000).toFixed(2)} Lakhs cover only ${(cashflowRatio * 100).toFixed(0)}% of the requested amount. High risk of debt-service strain.`;

  const epfoAnalysis = epfoContributions >= 100000
    ? `Substantial formal payroll. Active monthly employee fund deposits of ₹${(epfoContributions / 100000).toFixed(2)} Lakhs indicate a professional, stable, and growing workforce base.`
    : epfoContributions > 0
    ? `Micro-enterprise payroll scale. EPFO monthly deposits of ₹${(epfoContributions / 100000).toFixed(2)} Lakhs confirm a small core of formal personnel, indicating modest operational scale.`
    : `No formal employee payroll records. Highly reliant on manual or informal contract resources. Limits operational scalability verification in standard banking audits.`;

  const industryAnalysis = `Operating as a ${industryType} enterprise. Industry averages for working capital cycle are aligned with proposed facility, but risk metrics must be normalized for specific cashflow seasonality.`;

  return {
    score: totalScore,
    riskLevel,
    recommendation,
    analysis: {
      summary,
      gstScore,
      upiScore,
      epfoScore,
      gstAnalysis,
      upiAnalysis,
      epfoAnalysis,
      industryAnalysis
    }
  };
}

// Gemini AI-driven MSME analysis generator
async function generateAiScoringAnalysis(
  companyName: string,
  industryType: string,
  loanAmount: number,
  scoreOutput: ScoreOutput,
  inputs: ScoreParameters
): Promise<ScoreOutput> {
  const ai = getGemini();
  if (!ai) {
    return scoreOutput; // return fallback if API key not available
  }

  try {
    const prompt = `
      You are an expert Credit Underwriter and Risk Analyst for IDBI Bank, specializing in MSME Lending.
      You are evaluating a loan application under the automated "India Stack Digital Lending Scheme".
      
      Here are the MSME's operational parameters retrieved from public digital infrastructure integrations:
      - Company Name: "${companyName}"
      - Industry Sector: "${industryType}"
      - Requested Loan Amount: ₹${inputs.loanAmount.toLocaleString("en-IN")}
      - GST Filing Compliance Rate: ${inputs.gstCompliance}% (GSTR-3B filings)
      - Monthly UPI Cash Inflows: ₹${inputs.upiInflows.toLocaleString("en-IN")}
      - Monthly EPFO Payroll Contributions: ₹${inputs.epfoContributions.toLocaleString("en-IN")}
      
      The rule-based decision algorithm has computed the following ratings:
      - Credit Score: ${scoreOutput.score} / 900 (CIBIL equivalent risk rank)
      - Risk Category: "${scoreOutput.riskLevel}"
      - Preliminary Recommendation: "${scoreOutput.recommendation}"
      
      Please generate a highly professional, realistic, and objective bank credit appraisal memorandum.
      Keep your analysis strictly factual, avoiding generic fluff. Use formal banking terms (e.g., debt-serviceability, working capital velocity, tax transparency, digital trail audits).
      
      Respond STRICTLY with a valid JSON object matching this structure:
      {
        "summary": "Detailed overall credit appraisal summary, providing credit rating rationale, specific strengths, weaknesses, and a recommended credit action.",
        "gstAnalysis": "Technical critique of the GST compliance of ${inputs.gstCompliance}%. Address GSTR transparency and transaction visibility.",
        "upiAnalysis": "Evaluation of the UPI cash inflows (₹${inputs.upiInflows.toLocaleString("en-IN")}) relative to the loan amount. Calculate debt service capability and cashflow velocity.",
        "epfoAnalysis": "Critique of EPFO payroll (₹${inputs.epfoContributions.toLocaleString("en-IN")}). Assess workforce size, stability, and growth indicators.",
        "industryAnalysis": "Assess sector-specific risks and capital rotation cycles for a ${industryType} MSME seeking ₹${inputs.loanAmount.toLocaleString("en-IN")}."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            gstAnalysis: { type: Type.STRING },
            upiAnalysis: { type: Type.STRING },
            epfoAnalysis: { type: Type.STRING },
            industryAnalysis: { type: Type.STRING }
          },
          required: ["summary", "gstAnalysis", "upiAnalysis", "epfoAnalysis", "industryAnalysis"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return {
      ...scoreOutput,
      analysis: {
        summary: parsed.summary,
        gstScore: scoreOutput.analysis.gstScore,
        upiScore: scoreOutput.analysis.upiScore,
        epfoScore: scoreOutput.analysis.epfoScore,
        gstAnalysis: parsed.gstAnalysis,
        upiAnalysis: parsed.upiAnalysis,
        epfoAnalysis: parsed.epfoAnalysis,
        industryAnalysis: parsed.industryAnalysis
      }
    };
  } catch (error) {
    console.error("Error generating Gemini AI analysis, using local scoring heuristics.", error);
    return scoreOutput;
  }
}

// API Endpoints

// 1. Apply Endpoint (POST /api/apply)
app.post("/api/apply", async (req, res) => {
  try {
    const { msme_id, company_name, gstin, gst_compliance, upi_inflows, epfo_contributions, industry_type, loan_amount } = req.body;

    // Validation
    if (!msme_id || !company_name || !gst_compliance === undefined || upi_inflows === undefined || epfo_contributions === undefined) {
      return res.status(400).json({ error: "Missing required fields in application payload." });
    }

    const gstCompNum = Number(gst_compliance);
    const upiNum = Number(upi_inflows);
    const epfoNum = Number(epfo_contributions);
    const loanAmtNum = Number(loan_amount || 1000000);
    const industry = industry_type || "Services";

    // Generate unique Application ID
    const applicationId = "APP-" + Math.floor(100000 + Math.random() * 900000);

    // Run credit scoring engine (Rule-based first)
    const scoringInput: ScoreParameters = {
      gstCompliance: gstCompNum,
      upiInflows: upiNum,
      epfoContributions: epfoNum,
      loanAmount: loanAmtNum,
      industryType: industry
    };

    let result = calculateCreditScore(scoringInput);

    // Attempt Gemini refinement asynchronously to prevent API latency from hanging clients, or run it in line.
    // For a crisp demo experience, we run it in line, keeping response within 1.5-2 seconds, with fallback.
    result = await generateAiScoringAnalysis(company_name, industry, loanAmtNum, result, scoringInput);

    // Save Application
    const newApplication: MSMEApplication = {
      applicationId,
      msmeId: msme_id,
      companyName: company_name,
      gstIN: gstin || "N/A",
      gstCompliance: gstCompNum,
      upiInflows: upiNum,
      epfoContributions: epfoNum,
      industryType: industry,
      loanAmount: loanAmtNum,
      status: result.score >= 750 ? "Approved" : result.score >= 600 ? "Review" : "Rejected",
      score: result.score,
      riskLevel: result.riskLevel,
      recommendation: result.recommendation,
      createdAt: new Date().toISOString(),
      analysis: result.analysis
    };

    const apps = readDb();
    apps.unshift(newApplication); // Add to beginning
    writeDb(apps);

    return res.status(201).json(newApplication);
  } catch (error: any) {
    console.error("Error creating application", error);
    return res.status(500).json({ error: "Server error occurred during credit appraisal evaluation." });
  }
});

// 2. Status Endpoint (GET /api/status/:application_id)
app.get("/api/status/:application_id", (req, res) => {
  const { application_id } = req.params;
  const apps = readDb();
  const found = apps.find(a => a.applicationId.toLowerCase() === application_id.toLowerCase() || a.msmeId.toLowerCase() === application_id.toLowerCase());

  if (!found) {
    return res.status(404).json({ error: `Application not found for ID: ${application_id}` });
  }

  return res.json(found);
});

// 3. Admin Applications List Endpoint (GET /api/admin/applications)
app.get("/api/admin/applications", (req, res) => {
  const { status, risk_level, search } = req.query;
  let apps = readDb();

  if (status && status !== "All") {
    apps = apps.filter(a => a.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (risk_level && risk_level !== "All") {
    apps = apps.filter(a => a.riskLevel.toLowerCase() === (risk_level as string).toLowerCase());
  }

  if (search) {
    const s = (search as string).toLowerCase();
    apps = apps.filter(a =>
      a.companyName.toLowerCase().includes(s) ||
      a.applicationId.toLowerCase().includes(s) ||
      a.msmeId.toLowerCase().includes(s)
    );
  }

  return res.json(apps);
});

// 4. Admin Update Status Override Endpoint (POST /api/admin/applications/:application_id/status)
app.post("/api/admin/applications/:application_id/status", (req, res) => {
  const { application_id } = req.params;
  const { status } = req.body;

  if (!status || !["Pending", "Approved", "Rejected", "Review"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value. Must be Pending, Approved, Rejected, or Review." });
  }

  const apps = readDb();
  const index = apps.findIndex(a => a.applicationId.toLowerCase() === application_id.toLowerCase());

  if (index === -1) {
    return res.status(404).json({ error: `Application not found for ID: ${application_id}` });
  }

  apps[index].status = status as ApplicationStatus;
  writeDb(apps);

  return res.json(apps[index]);
});

// 5. Applet Development & Production Assets Routing
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupViteOrStatic().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT} with environment: ${process.env.NODE_ENV || "development"}`);
  });
});
