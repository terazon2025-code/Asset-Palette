import React, { useState, useEffect } from 'react';
import { Holding } from '../types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Holding | Omit<Holding, 'id' | 'account'>) => void;
  assetToEdit?: Holding | null;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSave, assetToEdit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [gainLoss, setGainLoss] = useState('');
  const [error, setError] = useState('');

  const isEditMode = !!assetToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(assetToEdit.name);
        setType(assetToEdit.type);
        setValue(String(assetToEdit.value));
        setGainLoss(String(assetToEdit.gainLoss));
      } else {
        // Reset for new entry
        setName('');
        setType('');
        setValue('');
        setGainLoss('0');
      }
      setError('');
    }
  }, [isOpen, assetToEdit, isEditMode]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (!name || !type || !value) {
      setError('銘柄名、種別、評価額は必須です。');
      return;
    }
    const parsedValue = parseInt(value.replace(/,/g, ''), 10);
    const parsedGainLoss = parseInt((gainLoss || '0').replace(/,/g, ''), 10);

    if (isNaN(parsedValue) || isNaN(parsedGainLoss)) {
      setError('評価額と評価損益は有効な数値を入力してください。');
      return;
    }
    
    if (isEditMode) {
        onSave({
            ...assetToEdit,
            name,
            type,
            value: parsedValue,
            gainLoss: parsedGainLoss,
        });
    } else {
        onSave({
            name,
            type,
            value: parsedValue,
            gainLoss: parsedGainLoss,
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">
          {isEditMode ? '資産を編集' : '資産を手入力で追加'}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="asset-name" className="block text-sm font-medium text-slate-400 mb-1">銘柄名</label>
            <input
              type="text"
              id="asset-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：現金, ビットコイン"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="asset-type" className="block text-sm font-medium text-slate-400 mb-1">種別</label>
            <input
              type="text"
              id="asset-type"
              value={type}
              onChange={e => setType(e.target.value)}
              placeholder="例：現金, 仮想通貨"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="asset-value" className="block text-sm font-medium text-slate-400 mb-1">評価額 (円)</label>
            <input
              type="text"
              id="asset-value"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="1000000"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="asset-gainloss" className="block text-sm font-medium text-slate-400 mb-1">評価損益 (円)</label>
            <input
              type="text"
              id="asset-gainloss"
              value={gainLoss}
              onChange={e => setGainLoss(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-md hover:bg-sky-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssetModal;