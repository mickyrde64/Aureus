
export interface SimulationParams {
  initialInvestment: number;
  monthlyInvestment: number;
  monthlyDiscountRate: number; // 2% expressed as 0.02
  durationMonths: number;
  expectedAnnualGrowth: number;
  spotPricePerOunce: number;
}

export interface MonthlyData {
  month: number;
  date: string;
  marketPrice: number;
  purchasePrice: number;
  amountInvested: number;
  goldOuncesPurchased: number;
  cumulativeGold: number;
  cumulativeInvested: number;
  portfolioValue: number;
  profit: number;
}

export interface SimulationResult {
  monthlyData: MonthlyData[];
  totalInvested: number;
  totalGoldOunces: number;
  finalPortfolioValue: number;
  averageCostPerOunce: number;
  totalProfit: number;
  roi: number;
}

export interface AIAnalysis {
  summary: string;
  recommendations: string[];
  marketContext: string;
  sources: { title: string; uri: string }[];
}
