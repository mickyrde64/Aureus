
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Wallet, 
  Calendar, 
  Percent, 
  ArrowUpRight, 
  Sparkles,
  Info,
  ExternalLink,
  Scale,
  DollarSign
} from 'lucide-react';
import { SimulationParams, SimulationResult, AIAnalysis, MonthlyData } from './types';
import { getAIAnalysis } from './services/geminiService';
import SimulationChart from './components/SimulationChart';

const App: React.FC = () => {
  // Hardcoded duration set to 36 months as per request
  const FIXED_DURATION = 36;
  const OZ_TO_KG = 32.1507; // 1 kg = 32.1507 troy ounces

  const [params, setParams] = useState<SimulationParams>({
    initialInvestment: 1000,
    monthlyInvestment: 1000,
    monthlyDiscountRate: 0.02,
    durationMonths: FIXED_DURATION,
    expectedAnnualGrowth: 0.08,
    spotPricePerOunce: 2100,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const calculateSimulation = useCallback(() => {
    const { initialInvestment, monthlyInvestment, monthlyDiscountRate, expectedAnnualGrowth, spotPricePerOunce } = params;
    
    // Starting spot price from user input
    const basePrice = spotPricePerOunce;
    const monthlyGrowth = expectedAnnualGrowth / 12;
    
    const monthlyData: MonthlyData[] = [];
    let cumulativeGold = 0;
    let cumulativeInvested = 0;

    for (let m = 0; m <= FIXED_DURATION; m++) {
      // Market price grows monthly based on expected growth rate
      const marketPrice = basePrice * Math.pow(1 + monthlyGrowth, m);
      
      let amountInvested = 0;
      // APPLY DISCOUNT TO ALL PURCHASES (Initial and Monthly)
      const purchasePrice = marketPrice * (1 - monthlyDiscountRate);

      if (m === 0) {
        // Initial investment
        amountInvested = initialInvestment;
      } else {
        // Recurring monthly investment
        amountInvested = monthlyInvestment;
      }

      const goldOuncesPurchased = amountInvested / purchasePrice;
      cumulativeGold += goldOuncesPurchased;
      cumulativeInvested += amountInvested;
      
      const portfolioValue = cumulativeGold * marketPrice;
      const profit = portfolioValue - cumulativeInvested;

      monthlyData.push({
        month: m,
        date: `Month ${m}`,
        marketPrice,
        purchasePrice,
        amountInvested,
        goldOuncesPurchased,
        cumulativeGold,
        cumulativeInvested,
        portfolioValue,
        profit
      });
    }

    const final = monthlyData[monthlyData.length - 1];
    setResult({
      monthlyData,
      totalInvested: cumulativeInvested,
      totalGoldOunces: cumulativeGold,
      finalPortfolioValue: final.portfolioValue,
      averageCostPerOunce: cumulativeInvested / cumulativeGold,
      totalProfit: final.profit,
      roi: (final.profit / cumulativeInvested) * 100
    });
  }, [params]);

  useEffect(() => {
    calculateSimulation();
  }, [calculateSimulation]);

  const handleAIAnalysis = async () => {
    if (!result) return;
    setLoadingAnalysis(true);
    try {
      const data = await getAIAnalysis(result);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleOzChange = (val: number) => {
    setParams({ ...params, spotPricePerOunce: val });
  };

  const handleKgChange = (val: number) => {
    setParams({ ...params, spotPricePerOunce: val / OZ_TO_KG });
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, prefix = "", suffix = "" }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl hover:border-zinc-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-zinc-800 ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
          <Info size={16} />
        </div>
      </div>
      <p className="text-zinc-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-zinc-100">
        {prefix}{value}{suffix}
      </h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">AUREUS</span>
              <Coins className="text-amber-500" size={32} />
            </h1>
            <p className="text-zinc-500 mt-2 max-w-xl">
              Professional Gold DCA Simulator. Fixed 36-month modeling with universal discount tracking applied to all investment tranches.
            </p>
          </div>
          <button 
            onClick={handleAIAnalysis}
            disabled={loadingAnalysis}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loadingAnalysis ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
            ) : <Sparkles size={18} />}
            Ask AI Market Insight
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Panel */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Market Spot Price Input */}
            <div className="bg-zinc-900 border border-amber-500/20 p-6 rounded-2xl shadow-xl">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Scale size={20} className="text-amber-500" />
                Current Spot Price (USD)
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Price per Ounce (oz)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                      type="number"
                      value={params.spotPricePerOunce.toFixed(2)}
                      onChange={(e) => handleOzChange(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Price per Kilogram (kg)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                      type="number"
                      value={(params.spotPricePerOunce * OZ_TO_KG).toFixed(2)}
                      onChange={(e) => handleKgChange(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-zinc-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-500" />
                Investment Inputs
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Initial Purchase Amount ($)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      type="number"
                      value={params.initialInvestment}
                      onChange={(e) => setParams({...params, initialInvestment: Number(e.target.value)})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="e.g. 1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Monthly Investment Amount ($)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      type="number"
                      value={params.monthlyInvestment}
                      onChange={(e) => setParams({...params, monthlyInvestment: Number(e.target.value)})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="e.g. 1000"
                    />
                  </div>
                </div>

                {/* Duration info */}
                <div className="pt-2">
                  <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 shadow-inner">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Plan Duration</span>
                    <span className="text-amber-500 font-bold">36 Months</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Global Discount Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      type="number"
                      step="0.1"
                      value={params.monthlyDiscountRate * 100}
                      onChange={(e) => setParams({...params, monthlyDiscountRate: Number(e.target.value) / 100})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-amber-500/80 mt-1 font-medium italic">Applied to BOTH initial and monthly purchases.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Expected Gold Annual Growth (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={params.expectedAnnualGrowth * 100}
                    onChange={(e) => setParams({...params, expectedAnnualGrowth: Number(e.target.value) / 100})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* AI Analysis Result */}
            {analysis && (
              <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={18} />
                  Gemini Market Insights
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                  {analysis.summary}
                </p>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Strategy Recommendations</p>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 text-sm text-zinc-400 italic">
                        <ArrowUpRight size={14} className="text-amber-600 flex-shrink-0 mt-1" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                {analysis.sources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Verified Data Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.sources.map((src, i) => (
                        <a 
                          key={i} 
                          href={src.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] bg-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded border border-zinc-700 flex items-center gap-1 transition-colors"
                        >
                          {src.title} <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Results Main Content */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard 
                title="Portfolio Value" 
                value={result?.finalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                icon={Wallet} 
                colorClass="text-amber-500" 
                prefix="$" 
              />
              <StatCard 
                title="Accumulated Profit" 
                value={result?.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                icon={TrendingUp} 
                colorClass="text-emerald-500" 
                prefix="$" 
              />
              <StatCard 
                title="Return on Investment" 
                value={result?.roi.toFixed(1)} 
                icon={ArrowUpRight} 
                colorClass="text-blue-500" 
                suffix="%" 
              />
              <StatCard 
                title="Gold Reserves" 
                value={result?.totalGoldOunces.toFixed(2)} 
                icon={Coins} 
                colorClass="text-yellow-600" 
                suffix=" oz" 
              />
            </div>

            {/* Chart Area */}
            {result && <SimulationChart data={result.monthlyData} />}

            {/* Table Detail */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-amber-500">36-Month Accumulation Ledger</h3>
                <span className="text-xs text-zinc-500 italic">Universal {(params.monthlyDiscountRate * 100).toFixed(1)}% Discount Applied</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Month</th>
                      <th className="px-6 py-4 font-semibold">Price (Market vs Disc.)</th>
                      <th className="px-6 py-4 font-semibold">Gold Added</th>
                      <th className="px-6 py-4 font-semibold">Total Cost</th>
                      <th className="px-6 py-4 font-semibold">Current Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {result?.monthlyData
                      .filter((_, i) => i % 6 === 0 || i === result.monthlyData.length - 1)
                      .map((row) => (
                      <tr key={row.month} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-300">
                          {row.month === 0 ? 'Initial' : `Month ${row.month}`}
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          <span className="line-through text-zinc-600 mr-2 text-xs">${row.marketPrice.toFixed(2)}</span>
                          <span className="text-amber-500 font-medium">${row.purchasePrice.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">{row.goldOuncesPurchased.toFixed(3)} oz</td>
                        <td className="px-6 py-4 text-zinc-400">${row.cumulativeInvested.toLocaleString()}</td>
                        <td className={`px-6 py-4 font-bold ${row.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          ${row.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-zinc-800/20 text-center text-zinc-500 text-[10px] uppercase tracking-widest">
                Data projected for a fixed {FIXED_DURATION} month duration with universal discount logic.
              </div>
            </div>
          </main>

        </div>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-zinc-800">
          <p className="text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} Aureus Intelligence Systems. Fixed 36-month gold simulation. Not financial advice.
          </p>
        </footer>

      </div>
    </div>
  );
};

export default App;
