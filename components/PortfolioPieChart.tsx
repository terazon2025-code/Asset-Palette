import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PIE_CHART_COLORS } from '../constants';

interface ChartData {
  name: string;
  value: number;
}

type ViewMode = 'assetClass' | 'account' | 'holdings';

interface PortfolioPieChartProps {
  byAccount: ChartData[];
  byAssetClass: ChartData[];
  byHolding: ChartData[];
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const formattedValue = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(data.value);
    return (
      <div className="bg-slate-950/80 p-3 rounded-md border border-slate-700 backdrop-blur-sm">
        <p className="text-slate-200">{`${data.name}`}</p>
        <p className="text-white font-semibold">{`${formattedValue}`}</p>
        <p className="text-xs text-slate-400">{`(${((data.value / payload[0].payload.total) * 100).toFixed(2)}%)`}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <text x={x} y={y} fill="#94a3b8" textAnchor={textAnchor} dominantBaseline="central" fontSize={12} style={{ whiteSpace: 'nowrap' }}>
        {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};


const PortfolioPieChart: React.FC<PortfolioPieChartProps> = ({ byAccount, byAssetClass, byHolding, activeView, onViewChange }) => {
  const data = activeView === 'assetClass' ? byAssetClass : activeView === 'account' ? byAccount : byHolding;
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const chartData = data.map(item => ({ ...item, total }));


  return (
    <div className="bg-slate-850 p-6 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-white">アセットアロケーション</h2>
        <div className="flex text-sm bg-slate-900 p-1 rounded-md">
          <button 
            onClick={() => onViewChange('assetClass')}
            className={`px-3 py-1 rounded transition-colors ${activeView === 'assetClass' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            資産クラス別
          </button>
          <button 
            onClick={() => onViewChange('account')}
            className={`px-3 py-1 rounded transition-colors ${activeView === 'account' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            口座別
          </button>
          <button 
            onClick={() => onViewChange('holdings')}
            className={`px-3 py-1 rounded transition-colors ${activeView === 'holdings' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            保有銘柄別
          </button>
        </div>
      </div>
      <div className="relative flex-grow w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 40, right: 50, bottom: 40, left: 50 }}>
            <Tooltip 
              content={<CustomTooltip />} 
              wrapperStyle={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              labelLine={{ stroke: '#64748b' }}
              label={renderCustomizedLabel}
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-slate-400">合計</p>
          <p className="text-2xl font-bold text-white tracking-tight">
             {new Intl.NumberFormat('ja-JP').format(total)}円
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPieChart;