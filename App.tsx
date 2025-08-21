
import React, { useState, useCallback } from 'react';
import { PortfolioData, Holding, NamedPortfolioData, AggregatedHolding } from './types';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

const recalculatePortfolio = (allHoldings: Holding[]): PortfolioData => {
  const totalValue = allHoldings.reduce((sum, h) => sum + h.value, 0);
  const totalGainLoss = allHoldings.reduce((sum, h) => sum + h.gainLoss, 0);

  const holdingGroups = new Map<string, { totalValue: number, totalGainLoss: number, type: string, subHoldings: Holding[] }>();
  for (const holding of allHoldings) {
      if (!holdingGroups.has(holding.name)) {
          holdingGroups.set(holding.name, {
              totalValue: 0,
              totalGainLoss: 0,
              type: holding.type,
              subHoldings: []
          });
      }
      const group = holdingGroups.get(holding.name)!;
      group.totalValue += holding.value;
      group.totalGainLoss += holding.gainLoss;
      group.subHoldings.push(holding);
  }
  
  const assetTypeOrder: { [key: string]: number } = {
    '国内株式': 1, '米国株式': 2, '中国株式': 3, 'アセアン株式': 4,
    '投資信託': 5, '金・プラチナ': 6, '国内債券': 7, '外国債券': 8,
    '現金': 98, '仮想通貨': 99,
  };

  const aggregatedHoldings: AggregatedHolding[] = Array.from(holdingGroups.entries()).map(([name, group]) => ({
      name,
      ...group
  })).sort((a, b) => {
    const typeOrderA = assetTypeOrder[a.type] || 90;
    const typeOrderB = assetTypeOrder[b.type] || 90;
    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB;
    }
    return b.totalValue - a.totalValue;
  });

  const byHoldingRaw = aggregatedHoldings.map(h => ({ name: h.name, value: h.totalValue }));
  let byHolding: { name: string; value: number }[];
  const MAX_PIE_SLICES = 10;
  if (byHoldingRaw.length > MAX_PIE_SLICES) {
    const topHoldings = byHoldingRaw.slice(0, MAX_PIE_SLICES - 1);
    const otherValue = byHoldingRaw.slice(MAX_PIE_SLICES - 1).reduce((acc, h) => acc + h.value, 0);
    byHolding = [...topHoldings, { name: 'その他', value: otherValue }];
  } else {
    byHolding = byHoldingRaw;
  }
  
  const byAssetClassMap = new Map<string, number>();
  allHoldings.forEach(h => {
    byAssetClassMap.set(h.type, (byAssetClassMap.get(h.type) || 0) + h.value);
  });
  const byAssetClass = Array.from(byAssetClassMap, ([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const byAccountMap = new Map<string, number>();
  allHoldings.forEach(h => {
    const key = h.account === '手入力' ? h.type : h.account;
    byAccountMap.set(key, (byAccountMap.get(key) || 0) + h.value);
  });
  const byAccount = Array.from(byAccountMap, ([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  return { totalValue, totalGainLoss, aggregatedHoldings, byAccount, byAssetClass, byHolding, holdings: allHoldings };
};

interface AppState {
  individual: NamedPortfolioData[];
  combined: PortfolioData;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);

  const handleDataLoaded = useCallback((portfolios: NamedPortfolioData[]) => {
    const allHoldings = portfolios.flatMap(p => p.data.holdings);
    const combinedData = recalculatePortfolio(allHoldings);
    setAppState({ individual: portfolios, combined: combinedData });
  }, []);

  const handleReset = useCallback(() => {
    setAppState(null);
  }, []);

  const handleManualAdd = useCallback((portfolioIndex: number, newAssetData: Omit<Holding, 'id' | 'account'>) => {
    setAppState(prevState => {
      if (!prevState) return null;
      const newAsset: Holding = {
        ...newAssetData,
        id: `manual_${Date.now()}`,
        account: '手入力',
      };
      
      const updatedIndividual = [...prevState.individual];
      const targetPortfolio = updatedIndividual[portfolioIndex];
      const updatedHoldings = [...targetPortfolio.data.holdings, newAsset];
      updatedIndividual[portfolioIndex] = {
        ...targetPortfolio,
        data: recalculatePortfolio(updatedHoldings),
      };
      
      const allHoldings = updatedIndividual.flatMap(p => p.data.holdings);
      const combinedData = recalculatePortfolio(allHoldings);
      return { individual: updatedIndividual, combined: combinedData };
    });
  }, []);

  const handleUpdateAsset = useCallback((portfolioIndex: number, updatedAsset: Holding) => {
    setAppState(prevState => {
      if (!prevState) return null;
      const updatedIndividual = [...prevState.individual];
      const targetPortfolio = updatedIndividual[portfolioIndex];
      const updatedHoldings = targetPortfolio.data.holdings.map(h => h.id === updatedAsset.id ? updatedAsset : h);
      updatedIndividual[portfolioIndex] = {
        ...targetPortfolio,
        data: recalculatePortfolio(updatedHoldings),
      };
      
      const allHoldings = updatedIndividual.flatMap(p => p.data.holdings);
      const combinedData = recalculatePortfolio(allHoldings);
      return { individual: updatedIndividual, combined: combinedData };
    });
  }, []);

  const handleDeleteAsset = useCallback((portfolioIndex: number, assetId: string) => {
    setAppState(prevState => {
      if (!prevState) return null;
      const updatedIndividual = [...prevState.individual];
      const targetPortfolio = updatedIndividual[portfolioIndex];
      const updatedHoldings = targetPortfolio.data.holdings.filter(h => h.id !== assetId);
      updatedIndividual[portfolioIndex] = {
        ...targetPortfolio,
        data: recalculatePortfolio(updatedHoldings),
      };
      
      const allHoldings = updatedIndividual.flatMap(p => p.data.holdings);
      const combinedData = recalculatePortfolio(allHoldings);
      return { individual: updatedIndividual, combined: combinedData };
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      {!appState ? (
        <FileUpload onDataLoaded={handleDataLoaded} />
      ) : (
        <Dashboard 
          individualPortfolios={appState.individual}
          combinedPortfolio={appState.combined}
          onReset={handleReset} 
          onManualAdd={handleManualAdd}
          onUpdateAsset={handleUpdateAsset}
          onDeleteAsset={handleDeleteAsset}
        />
      )}
    </div>
  );
};

export default App;
