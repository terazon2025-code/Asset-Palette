
import React, { useState } from 'react';
import { AggregatedHolding, Holding } from '../types';
import { ChevronRightIcon, PencilIcon, TrashIcon } from './icons';

interface HoldingsTableProps {
  aggregatedHoldings: AggregatedHolding[];
  onEdit: (holding: Holding) => void;
  onDelete: (holdingId: string) => void;
  isReadOnly: boolean;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ aggregatedHoldings, onEdit, onDelete, isReadOnly }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (name: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const calculateGainLossRate = (value: number, gainLoss: number): number => {
    const principal = value - gainLoss;
    if (principal === 0 || principal === -0) {
      return gainLoss > 0 ? 100.0 : 0;
    }
    return (gainLoss / principal) * 100;
  };

  const currencyFormat = (value: number) => new Intl.NumberFormat('ja-JP').format(value) + '円';
  const signedCurrencyFormat = (value: number) => new Intl.NumberFormat('ja-JP', { signDisplay: 'always' }).format(value) + '円';

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[600px] pr-2">
      <table className="w-full text-left text-base min-w-[700px]">
        <thead className="sticky top-0 bg-slate-850 z-10">
          <tr>
            <th className="p-2 font-semibold text-slate-400 whitespace-nowrap">銘柄名</th>
            <th className="p-2 font-semibold text-slate-400 whitespace-nowrap">種別</th>
            <th className="p-2 font-semibold text-slate-400 text-right whitespace-nowrap">評価額</th>
            <th className="p-2 font-semibold text-slate-400 text-right whitespace-nowrap">評価損益</th>
            <th className="p-2 font-semibold text-slate-400 text-right whitespace-nowrap">評価損益率(%)</th>
            <th className="p-2 font-semibold text-slate-400 text-right whitespace-nowrap"></th>
          </tr>
        </thead>
        <tbody>
          {aggregatedHoldings.map((aggHolding) => {
            const isExpanded = expandedRows.has(aggHolding.name);
            const gainLossRate = calculateGainLossRate(aggHolding.totalValue, aggHolding.totalGainLoss);
            const hasSubHoldings = aggHolding.subHoldings.length > 1;
            const isSingleManualEntry = aggHolding.subHoldings.length === 1 && aggHolding.subHoldings[0].account === '手入力';
            const canEditSingle = !isReadOnly && isSingleManualEntry;

            return (
              <React.Fragment key={aggHolding.name}>
                <tr 
                  className={`border-t border-slate-700/50 hover:bg-slate-800 ${hasSubHoldings ? 'cursor-pointer' : ''}`}
                  onClick={() => hasSubHoldings && toggleRow(aggHolding.name)}
                >
                  <td className="p-3 text-slate-200 font-medium whitespace-nowrap">
                    <div className="flex items-center">
                       {hasSubHoldings ? (
                         <ChevronRightIcon className={`w-4 h-4 mr-2 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                       ) : (
                         <div className="w-4 mr-2"></div>
                       )}
                      {aggHolding.name}
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">{aggHolding.type}</td>
                  <td className="p-3 text-slate-200 text-right font-medium whitespace-nowrap">
                    {currencyFormat(aggHolding.totalValue)}
                  </td>
                  <td className={`p-3 text-right font-medium whitespace-nowrap ${aggHolding.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {signedCurrencyFormat(aggHolding.totalGainLoss)}
                  </td>
                  <td className={`p-3 text-right font-medium whitespace-nowrap ${gainLossRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gainLossRate.toFixed(2)}%
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {canEditSingle && (
                      <div className="flex items-center justify-end space-x-2">
                         <button onClick={(e) => { e.stopPropagation(); onEdit(aggHolding.subHoldings[0]); }} className="text-slate-400 hover:text-sky-400"><PencilIcon className="w-4 h-4" /></button>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(aggHolding.subHoldings[0].id); }} className="text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
                {isExpanded && hasSubHoldings && aggHolding.subHoldings.map((subHolding) => {
                  const subGainLossRate = calculateGainLossRate(subHolding.value, subHolding.gainLoss);
                  const canEditSub = !isReadOnly && subHolding.account === '手入力';
                  return (
                    <tr key={subHolding.id} className="bg-slate-850/50">
                      <td className="p-3 pl-12 text-slate-300 whitespace-nowrap">{subHolding.account}</td>
                      <td className="p-3 text-slate-400 whitespace-nowrap"></td>
                      <td className="p-3 text-slate-300 text-right whitespace-nowrap">
                        {currencyFormat(subHolding.value)}
                      </td>
                       <td className={`p-3 text-right whitespace-nowrap ${subHolding.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {signedCurrencyFormat(subHolding.gainLoss)}
                      </td>
                      <td className={`p-3 text-right whitespace-nowrap ${subGainLossRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                         {subGainLossRate.toFixed(2)}%
                      </td>
                       <td className="p-3 text-right whitespace-nowrap">
                        {canEditSub && (
                           <div className="flex items-center justify-end space-x-2">
                             <button onClick={() => onEdit(subHolding)} className="text-slate-400 hover:text-sky-400"><PencilIcon className="w-4 h-4" /></button>
                             <button onClick={() => onDelete(subHolding.id)} className="text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                           </div>
                        )}
                       </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsTable;
