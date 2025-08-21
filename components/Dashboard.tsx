import React, { useRef, useCallback, useState } from 'react';
import { PortfolioData, Holding, NamedPortfolioData } from '../types';
import Header from './Header';
import SummaryCard from './SummaryCard';
import PortfolioPieChart from './PortfolioPieChart';
import HoldingsTable from './HoldingsTable';
import AddAssetModal from './AddAssetModal';

interface SummaryTableProps {
    data: { name: string; value: number }[];
    totalValue: number;
    headers: [string, string, string];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data, totalValue, headers }) => {
    const currencyFormat = (value: number) => new Intl.NumberFormat('ja-JP').format(value) + '円';

    return (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] pr-2">
            <table className="w-full text-left text-base min-w-[400px]">
                <thead className="sticky top-0 bg-slate-850 z-10">
                    <tr>
                        <th className="p-2 font-semibold text-slate-400 whitespace-nowrap">{headers[0]}</th>
                        <th className="p-2 font-semibold text-slate-400 text-right whitespace-nowrap">{headers[1]}</th>
                        <th className="p-2 font-semibold text-slate-400 text-right whitespace-nowrap">{headers[2]}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.name} className="border-t border-slate-700/50">
                            <td className="p-3 text-slate-200 font-medium whitespace-nowrap">{item.name}</td>
                            <td className="p-3 text-slate-200 text-right font-medium whitespace-nowrap">{currencyFormat(item.value)}</td>
                            <td className="p-3 text-slate-300 text-right whitespace-nowrap">
                                {totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(2) : '0.00'}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface DashboardProps {
  individualPortfolios: NamedPortfolioData[];
  combinedPortfolio: PortfolioData;
  onReset: () => void;
  onManualAdd: (portfolioIndex: number, asset: Omit<Holding, 'id' | 'account'>) => void;
  onUpdateAsset: (portfolioIndex: number, asset: Holding) => void;
  onDeleteAsset: (portfolioIndex: number, assetId: string) => void;
}

type ViewMode = 'holdings' | 'assetClass' | 'account';

const Dashboard: React.FC<DashboardProps> = ({ individualPortfolios, combinedPortfolio, onReset, onManualAdd, onUpdateAsset, onDeleteAsset }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Holding | null>(null);
  const [activeView, setActiveView] = useState<'combined' | number>('combined');
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('assetClass');

  const handleExport = useCallback(() => {
    if (!dashboardRef.current || !(window as any).htmlToImage) return;

    (window as any).htmlToImage.toPng(dashboardRef.current, { 
      backgroundColor: '#0f172a',
      pixelRatio: 2,
      style: {
        fontFamily: 'Inter, Noto Sans JP, sans-serif'
      }
    })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = 'asset-palette.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err: any) => {
        console.error('oops, something went wrong!', err);
        alert('画像の書き出しに失敗しました。');
      });
  }, []);

  const isCombinedView = activeView === 'combined';
  const currentData = isCombinedView ? combinedPortfolio : individualPortfolios[activeView as number].data;
  const currentPortfolioIndex = isCombinedView ? -1 : activeView as number;

  const handleOpenAddModal = () => {
    if (isCombinedView) return;
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: Holding) => {
    if (isCombinedView) return;
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = (assetId: string) => {
    if (isCombinedView) return;
    if (window.confirm('この資産を削除してもよろしいですか？')) {
      onDeleteAsset(currentPortfolioIndex, assetId);
    }
  };

  const handleSaveAsset = (assetData: Holding | Omit<Holding, 'id' | 'account'>) => {
    if (isCombinedView) return;
    if ('id' in assetData) {
      onUpdateAsset(currentPortfolioIndex, assetData);
    } else {
      onManualAdd(currentPortfolioIndex, assetData);
    }
    setIsModalOpen(false);
  }

  const getTabClass = (isActive: boolean) => 
    `px-4 py-2 text-sm font-medium rounded-t-md transition-colors focus:outline-none ${
      isActive
        ? 'bg-slate-900 text-white border-slate-700 border-b-0'
        : 'text-slate-400 border-transparent hover:bg-slate-800/50'
    }`;

  const getTableTabClass = (isActive: boolean) => 
    `px-3 py-1 rounded transition-colors ${
      isActive
        ? 'bg-sky-500 text-white'
        : 'text-slate-400 hover:bg-slate-800'
    }`;


  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 bg-slate-950 min-h-screen">
        <div>
          <Header 
            onReset={onReset} 
            onExport={handleExport} 
            onAddAsset={handleOpenAddModal} 
            isAddDisabled={isCombinedView}
          />
          
          <div className="mt-6 border-b border-slate-700 flex space-x-2">
            <button className={getTabClass(isCombinedView)} onClick={() => setActiveView('combined')}>
              合算ポートフォリオ
            </button>
            {individualPortfolios.map((p, index) => (
              <button key={p.name} className={getTabClass(activeView === index)} onClick={() => setActiveView(index)}>
                {p.name}
              </button>
            ))}
          </div>

          <div ref={dashboardRef} className="p-4 sm:p-6 md:p-8 bg-slate-900 rounded-b-xl rounded-tr-xl">
            <SummaryCard totalValue={currentData.totalValue} totalGainLoss={currentData.totalGainLoss} />
            <div className="flex flex-col gap-8 mt-8">
              <div>
                <PortfolioPieChart 
                  byAccount={currentData.byAccount} 
                  byAssetClass={currentData.byAssetClass}
                  byHolding={currentData.byHolding}
                  activeView={activeViewMode}
                  onViewChange={setActiveViewMode}
                />
              </div>
              <div className="bg-slate-850 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-bold text-white">
                        {activeViewMode === 'holdings' ? '保有銘柄一覧' : activeViewMode === 'assetClass' ? '資産クラス別一覧' : '口座別一覧'}
                    </h2>
                    <div className="flex text-sm bg-slate-900 p-1 rounded-md">
                        <button onClick={() => setActiveViewMode('assetClass')} className={getTableTabClass(activeViewMode === 'assetClass')}>
                            資産クラス別
                        </button>
                        <button onClick={() => setActiveViewMode('account')} className={getTableTabClass(activeViewMode === 'account')}>
                            口座別
                        </button>
                        <button onClick={() => setActiveViewMode('holdings')} className={getTableTabClass(activeViewMode === 'holdings')}>
                            保有銘柄別
                        </button>
                    </div>
                </div>

                {activeViewMode === 'holdings' && (
                    <HoldingsTable 
                        aggregatedHoldings={currentData.aggregatedHoldings} 
                        onEdit={handleOpenEditModal}
                        onDelete={handleDelete}
                        isReadOnly={isCombinedView}
                    />
                )}
                {activeViewMode === 'assetClass' && (
                    <SummaryTable 
                        data={currentData.byAssetClass} 
                        totalValue={currentData.totalValue} 
                        headers={['資産クラス', '評価額', '構成比']} 
                    />
                )}
                {activeViewMode === 'account' && (
                    <SummaryTable 
                        data={currentData.byAccount} 
                        totalValue={currentData.totalValue} 
                        headers={['口座', '評価額', '構成比']} 
                    />
                )}
              </div>
            </div>
          </div>
        </div>
        <footer className="text-center py-8 text-slate-600 text-sm">
          <p>Generated by Asset Palette</p>
        </footer>
      </div>
      <AddAssetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
        assetToEdit={editingAsset}
      />
    </>
  );
};

export default Dashboard;