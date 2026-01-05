
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { SimulationParams, SimulationResult, AIAnalysis, MonthlyData } from './types';
import { getAIAnalysis } from './services/geminiService';
import SimulationChart from './components/SimulationChart';

const App: React.FC = () => {
  const FIXED_DURATION = 36;
  const OZ_TO_KG = 32.1507;

  const [params, setParams] = useState<SimulationParams>({
    initialInvestment: 1000,
    monthlyInvestment: 500,
    monthlyDiscountRate: 0.02,
    durationMonths: FIXED_DURATION,
    expectedAnnualGrowth: 0.08,
    spotPricePerOunce: 2350,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const calculateSimulation = useCallback(() => {
    // Safety check for invalid/empty inputs
    const safeParams = {
      initial: Math.max(0, params.initialInvestment || 0),
      monthly: Math.max(0, params.monthlyInvestment || 0),
      discount: Math.max(0, params.monthlyDiscountRate || 0),
      growth: params.expectedAnnualGrowth || 0,
      spot: Math.max(1, params.spotPricePerOunce || 2000),
    };

    const monthlyGrowth = safeParams.growth / 12;
    const monthlyData: MonthlyData[] = [];
    let cumulativeGold = 0;
    let cumulativeInvested = 0;

    for (let m = 0; m <= FIXED_DURATION; m++) {
      const marketPrice = safeParams.spot * Math.pow(1 + monthlyGrowth, m);
      const purchasePrice = marketPrice * (1 - safeParams.discount);
      
      const amountInvested = (m === 0) ? safeParams.initial : safeParams.monthly;
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
      averageCostPerOunce: cumulativeGold > 0 ? cumulativeInvested / cumulativeGold : safeParams.spot,
      totalProfit: final.profit,
      roi: cumulativeInvested > 0 ? (final.profit / cumulativeInvested) * 100 : 0
    });
  }, [params]);

  useEffect(() => {
    calculateSimulation();
  }, [calculateSimulation]);

  const handleAIAnalysis = async () => {
    if (!result || loadingAnalysis) return;
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

  const StatCard = useMemo(() => ({ title, value, icon: Icon, colorClass, prefix = "", suffix = "" }: any) => (
    <div className="glass-card p-5 rounded-2xl shadow-xl hover:shadow-amber-500/5 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={48} />
      </div>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-xl font-bold mt-0.5 text-zinc-100">
        {prefix}{value}{suffix}
      </h3>
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 px-4 py-8 md:px-8 lg:px-12 selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-900 pb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Coins className="text-black" size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">
                AUREUS<span className="text-amber-500 font-light">.AI</span>
              </h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Professional Dollar Cost Averaging Intelligence</p>
          </div>
          
          <button 
            onClick={handleAIAnalysis}
            disabled={loadingAnalysis}
            className="group relative flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black px-8 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 overflow-hidden shadow-2xl"
          >
            {loadingAnalysis ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                <span>Analysing Market...</span>
              </div>
            ) : (
              <>
                <Sparkles size={18} className="text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Generate Analysis</span>
              </>
            )}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Inputs Section */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Price Inputs */}
            <div className="glass-card p-6 rounded-3xl border-amber-500/10">
               <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Scale size={14} className="text-amber-500" />
                Spot Pricing
              </h2>
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2 group-focus-within:text-amber-500 transition-colors">Spot Price (oz)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                    <input 
                      type="number"
                      value={params.spotPricePerOunce || ''}
                      onChange={(e) => setParams({ ...params, spotPricePerOunce: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 pl-10 pr-4 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-mono text-amber-500 text-lg"
                    />
                  </div>
                </div>
                <div className="group opacity-60 hover:opacity-100 transition-opacity">
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Equivalent (kg)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                    <input 
                      type="number"
                      value={((params.spotPricePerOunce || 0) * OZ_TO_KG).toFixed(2)}
                      readOnly
                      className="w-full bg-zinc-900/30 border border-zinc-800 rounded-xl py-3.5 pl-10 pr-4 outline-none font-mono text-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Inputs */}
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-500" />
                Simulation Config
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Initial Entry ($)</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                    <input 
                      type="number"
                      value={params.initialInvestment || ''}
                      onChange={(e) => setParams({...params, initialInvestment: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:border-blue-500/50 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Monthly DCA ($)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                    <input 
                      type="number"
                      value={params.monthlyInvestment || ''}
                      onChange={(e) => setParams({...params, monthlyInvestment: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:border-blue-500/50 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Discount (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={params.monthlyDiscountRate * 100}
                      onChange={(e) => setParams({...params, monthlyDiscountRate: Number(e.target.value) / 100})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:border-amber-500/50 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Growth (% p.a)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={params.expectedAnnualGrowth * 100}
                      onChange={(e) => setParams({...params, expectedAnnualGrowth: Number(e.target.value) / 100})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:border-emerald-500/50 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Output (Refined) */}
            {analysis && (
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6 shadow-2xl ring-1 ring-amber-500/20 animate-in fade-in zoom-in-95 duration-500">
                <div>
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={14} /> Summary
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-zinc-800 pl-4">
                    "{analysis.summary}"
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Strategies</h3>
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 text-xs bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 text-zinc-300">
                      <ChevronRight size={14} className="text-amber-500 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>

                {analysis.sources.length > 0 && (
                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex flex-wrap gap-2">
                      {analysis.sources.map((src, i) => (
                        <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-zinc-600 hover:text-amber-500 transition-colors uppercase flex items-center gap-1">
                          <ExternalLink size={10} /> {src.title.substring(0, 15)}...
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Results Display */}
          <main className="lg:col-span-8 space-y-10">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard title="Total Value" value={result?.finalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={Wallet} colorClass="text-amber-500" prefix="$" />
              <StatCard title="Net Profit" value={result?.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={TrendingUp} colorClass="text-emerald-500" prefix="$" />
              <StatCard title="ROI Performance" value={result?.roi.toFixed(1)} icon={ArrowUpRight} colorClass="text-blue-500" suffix="%" />
              <StatCard title="Gold Reserves" value={result?.totalGoldOunces.toFixed(2)} icon={Coins} colorClass="text-yellow-600" suffix=" oz" />
            </div>

            {/* Dynamic Chart */}
            <SimulationChart data={result?.monthlyData || []} />

            {/* Ledger Table */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-900 bg-zinc-950/20 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Transaction Ledger</h3>
                <div className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full ring-1 ring-amber-500/20">
                  36 Month Sequence
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950/40 text-zinc-600 text-[9px] uppercase font-black tracking-widest border-b border-zinc-900">
                    <tr>
                      <th className="px-8 py-4">Timeline</th>
                      <th className="px-8 py-4">Spot (Disc.)</th>
                      <th className="px-8 py-4">Acquisition</th>
                      <th className="px-8 py-4">Total Cost</th>
                      <th className="px-8 py-4 text-right">Current Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {result?.monthlyData
                      .filter((_, i) => i % 6 === 0 || i === result.monthlyData.length - 1)
                      .map((row) => (
                      <tr key={row.month} className="hover:bg-zinc-900/10 transition-colors group">
                        <td className="px-8 py-5 font-bold text-xs text-zinc-500 group-hover:text-zinc-300">
                          {row.month === 0 ? 'ENTRY' : `MONTH ${row.month}`}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-zinc-600 line-through text-[10px] font-mono">${row.marketPrice.toFixed(0)}</span>
                            <span className="text-amber-500 font-mono text-xs font-bold">${row.purchasePrice.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-mono text-zinc-400">{row.goldOuncesPurchased.toFixed(3)} oz</td>
                        <td className="px-8 py-5 text-xs font-mono text-zinc-400">${row.cumulativeInvested.toLocaleString()}</td>
                        <td className={`px-8 py-5 text-right font-black font-mono text-sm ${row.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          ${row.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

        <footer className="text-center pt-20 pb-10 border-t border-zinc-950">
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
            Aureus Intelligence &copy; {new Date().getFullYear()} &bull; Professional Financial Simulator &bull; Vercel Optimized Build
          </p>
        </footer>

      </div>
    </div>
  );
};

export default App;
