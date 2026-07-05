export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Review';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface MSMEApplication {
  applicationId: string;
  msmeId: string;
  companyName: string;
  gstIN: string;
  gstCompliance: number; // 0 - 100 (%)
  upiInflows: number; // monthly average in INR
  epfoContributions: number; // monthly average in INR
  industryType: string; // 'Manufacturing' | 'Services' | 'Retail'
  loanAmount: number; // requested amount in INR
  status: ApplicationStatus;
  score: number; // 300 - 900
  riskLevel: RiskLevel;
  recommendation: string;
  createdAt: string;
  analysis: {
    summary: string;
    gstScore: number;
    upiScore: number;
    epfoScore: number;
    gstAnalysis: string;
    upiAnalysis: string;
    epfoAnalysis: string;
    industryAnalysis: string;
  };
}

export interface ScoreParameters {
  gstCompliance: number;
  upiInflows: number;
  epfoContributions: number;
  loanAmount: number;
  industryType: string;
}

export interface ScoreOutput {
  score: number;
  riskLevel: RiskLevel;
  recommendation: string;
  analysis: {
    summary: string;
    gstScore: number;
    upiScore: number;
    epfoScore: number;
    gstAnalysis: string;
    upiAnalysis: string;
    epfoAnalysis: string;
    industryAnalysis: string;
  };
}
