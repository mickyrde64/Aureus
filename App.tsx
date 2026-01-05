
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
  ChevronRight,
  Clock
} from 'lucide-react';
import { SimulationParams, SimulationResult, AIAnalysis, MonthlyData } from './types';
import { getAIAnalysis } from './services/geminiService';
import SimulationChart from './components/SimulationChart';

const App: React.FC = () => {
  const OZ_TO_KG = 32.1507;

  const [params, setParams] = useState<SimulationParams>({
    initialInvestment: 1000,
    monthlyInvestment: 500,
    monthlyDiscountRate: 0.02,
    durationMonths: 36,
    expectedAnnualGrowth: 0.08,
    spotPricePerOunce: 2350,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const calculateSimulation = useCallback(() => {
    const safeParams = {
      initial: Math.max(0, params.initialInvestment || 0),
      monthly: Math.max(0, params.monthlyInvestment || 0),
      discount: Math.max(0, params.monthlyDiscountRate || 0),
      duration: Math.max(1, params.durationMonths || 1),
      growth: params.expectedAnnualGrowth || 0,
      spot: Math.max(1, params.spotPricePerOunce || 2000),
    };

    const monthlyGrowth = safeParams.growth / 12;
    const monthlyData: MonthlyData[] = [];
    let cumulativeGold = 0;
    let cumulativeInvested = 0;

    for (let m = 0; m <= safeParams.duration; m++) {
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
    <div className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-amber-500/10 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={64} />
      </div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold mt-2 text-zinc-100">
        {prefix}{value}{suffix}
      </h3>
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 px-6 py-10 md:px-12 lg:px-16 selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-900 pb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Coins className="text-black" size={28} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter">
                AUREUS<span className="text-amber-500 font-normal">.AI</span>
              </h1>
            </div>
            <p className="text-zinc-400 text-lg font-medium">Gold Investment Intelligence & Simulation</p>
          </div>
          
          <button 
            onClick={handleAIAnalysis}
            disabled={loadingAnalysis}
            className="group relative flex items-center justify-center gap-4 bg-white hover:bg-zinc-200 text-black px-10 py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 overflow-hidden shadow-2xl"
          >
            {loadingAnalysis ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                <span>Analysing Market...</span>
              </div>
            ) : (
              <>
                <Sparkles size={20} className="text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Generate AI Analysis</span>
              </>
            )}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Inputs Section */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* Price Inputs */}
            <div className="glass-card p-8 rounded-3xl border-amber-500/10">
               <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                <Scale size={18} className="text-amber-500" />
                Spot Market Pricing
              </h2>
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-3 group-focus-within:text-amber-500 transition-colors">Spot Price (per oz)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="number"
                      value={params.spotPricePerOunce || ''}
                      onChange={(e) => setParams({ ...params, spotPricePerOunce: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-mono text-amber-500 text-xl font-bold"
                    />
                  </div>
                </div>
                <div className="group opacity-70 hover:opacity-100 transition-opacity">
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-3">Equivalent Price (per kg)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                    <input 
                      type="number"
                      value={((params.spotPricePerOunce || 0) * OZ_TO_KG).toFixed(2)}
                      readOnly
                      className="w-full bg-zinc-900/30 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 outline-none font-mono text-zinc-500 text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Inputs */}
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                <TrendingUp size={18} className="text-blue-500" />
                Investment Parameters
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-3">Initial Lump Sum ($)</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="number"
                      value={params.initialInvestment || ''}
                      onChange={(e) => setParams({...params, initialInvestment: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 focus:border-blue-500/50 outline-none transition-all font-mono text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase mb-3">Recurring Monthly DCA ($)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="number"
                      value={params.monthlyInvestment || ''}
                      onChange={(e) => setParams({...params, monthlyInvestment: Number(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-6 focus:border-blue-500/50 outline-none transition-all font-mono text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" />
                      Investment Horizon
                    </label>
                    <span className="text-base font-bold text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-lg border border-amber-500/20 font-mono">
                      {params.durationMonths} Months
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="60"
                    value={params.durationMonths}
                    onChange={(e) => setParams({...params, durationMonths: Number(e.target.value)})}
                    className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none transition-all"
                  />
                  <div className="flex justify-between text-xs font-black text-zinc-600 uppercase px-1">
                    <span>1m</span>
                    <span>12m</span>
                    <span>24m</span>
                    <span>36m</span>
                    <span>48m</span>
                    <span>60m</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 uppercase mb-3 leading-tight">Monthly Discount (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={params.monthlyDiscountRate * 100}
                      onChange={(e) => setParams({...params, monthlyDiscountRate: Number(e.target.value) / 100})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-6 focus:border-amber-500/50 outline-none transition-all font-mono text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 uppercase mb-3 leading-tight">Annual Growth (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={params.expectedAnnualGrowth * 100}
                      onChange={(e) => setParams({...params, expectedAnnualGrowth: Number(e.target.value) / 100})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-6 focus:border-emerald-500/50 outline-none transition-all font-mono text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Output Section */}
            {analysis && (
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-8 shadow-2xl ring-1 ring-amber-500/20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                  <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-3">
                    <Sparkles size={18} /> Performance Summary
                  </h3>
                  <p className="text-base text-zinc-300 leading-relaxed italic border-l-3 border-amber-500/40 pl-6">
                    "{analysis.summary}"
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Actionable Strategies</h3>
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 text-sm bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 text-zinc-300 items-start">
                      <ChevronRight size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                {analysis.sources.length > 0 && (
                  <div className="pt-6 border-t border-zinc-800">
                    <div className="flex flex-wrap gap-4">
                      {analysis.sources.map((src, i) => (
                        <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="text-xs font-bold text-zinc-500 hover:text-amber-500 transition-colors uppercase flex items-center gap-2">
                          <ExternalLink size={14} /> {src.title.substring(0, 20)}...
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Results Display */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard title="Portfolio Value" value={result?.finalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={Wallet} colorClass="text-amber-500" prefix="$" />
              <StatCard title="Projected Profit" value={result?.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={TrendingUp} colorClass="text-emerald-500" prefix="$" />
              <StatCard title="Total ROI" value={result?.roi.toFixed(1)} icon={ArrowUpRight} colorClass="text-blue-500" suffix="%" />
              <StatCard title="Gold Reserves" value={result?.totalGoldOunces.toFixed(2)} icon={Coins} colorClass="text-yellow-600" suffix=" oz" />
            </div>

            {/* Dynamic Chart */}
            <SimulationChart data={result?.monthlyData || []} />

            {/* Milestone Table */}
            <div className="glass-card rounded-3xl overflow-hidden border border-zinc-800">
              <div className="px-10 py-8 border-b border-zinc-900 bg-zinc-950/20 flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300">Strategy Ledger</h3>
                <div className="text-xs font-black bg-amber-500 text-black px-4 py-2 rounded-full shadow-lg">
                  Strategic Milestones
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950/60 text-zinc-500 text-xs uppercase font-black tracking-widest border-b border-zinc-900">
                    <tr>
                      <th className="px-10 py-6">Milestone</th>
                      <th className="px-10 py-6">Price Basis</th>
                      <th className="px-10 py-6">Weight Added</th>
                      <th className="px-10 py-6">Capital Invested</th>
                      <th className="px-10 py-6 text-right">Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {result?.monthlyData
                      .filter((row) => {
                        const milestones = [0, 6, 12, 24, 36, 48, 60];
                        return milestones.includes(row.month);
                      })
                      .map((row) => (
                      <tr key={row.month} className="hover:bg-zinc-900/20 transition-colors group">
                        <td className="px-10 py-7 font-bold text-sm text-zinc-400 group-hover:text-zinc-100">
                          {row.month === 0 ? 'START (ENTRY)' : `MONTH ${row.month}`}
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex flex-col">
                            <span className="text-zinc-600 line-through text-xs font-mono">${row.marketPrice.toFixed(0)}</span>
                            <span className="text-amber-500 font-mono text-base font-bold">${row.purchasePrice.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-sm font-mono text-zinc-300 font-medium">{row.goldOuncesPurchased.toFixed(3)} oz</td>
                        <td className="px-10 py-7 text-sm font-mono text-zinc-300 font-medium">${row.cumulativeInvested.toLocaleString()}</td>
                        <td className={`px-10 py-7 text-right font-bold font-mono text-lg ${row.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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

        <footer className="text-center pt-24 pb-12 border-t border-zinc-900">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
            Aureus Intelligence Engine &copy; {new Date().getFullYear()} &bull; Professional Financial Simulator &bull; Milestone Verification Enabled
          </p>
        </footer>

      </div>
    </div>
  );
};

export default App;
