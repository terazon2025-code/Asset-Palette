
export interface Holding {
  id: string; // Unique identifier for each holding
  type: string;
  name: string;
  account: string;
  value: number;
  gainLoss: number;
}

//同一銘柄を合算して管理するための新しいデータ型
export interface AggregatedHolding {
  name: string;
  type: string;
  totalValue: number;
  totalGainLoss: number;
  subHoldings: Holding[]; // 口座ごとの内訳
}

export interface PortfolioData {
  totalValue: number;
  totalGainLoss: number;
  aggregatedHoldings: AggregatedHolding[]; // 従来の holdings から変更
  byAccount: { name: string; value: number }[];
  byAssetClass: { name: string; value: number }[];
  byHolding: { name: string; value: number }[];
  holdings: Holding[]; // Keep the raw holdings list for easier updates
}

export interface NamedPortfolioData {
  name: string;
  data: PortfolioData;
}
