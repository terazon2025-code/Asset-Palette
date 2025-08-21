
import React from 'react';

interface SummaryCardProps {
  totalValue: number;
  totalGainLoss: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ totalValue, totalGainLoss }) => {
  const formattedValue = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(totalValue);
  
  const formattedGainLoss = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    signDisplay: 'always'
  }).format(totalGainLoss);

  const gainLossColor = totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="bg-slate-850 p-6 rounded-lg text-center">
      <p className="text-sm font-medium text-slate-400">総資産額</p>
      <p className="text-5xl md:text-6xl font-bold text-sky-400 mt-2 tracking-tight">
        {formattedValue}
      </p>
      <div className={`mt-2 text-xl font-semibold ${gainLossColor}`}>
        <span>{formattedGainLoss}</span>
      </div>
    </div>
  );
};

export default SummaryCard;