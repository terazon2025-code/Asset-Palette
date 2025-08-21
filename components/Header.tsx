
import React from 'react';
import { ArrowLeftIcon, DownloadIcon, PlusIcon } from './icons';

interface HeaderProps {
    onReset: () => void;
    onExport: () => void;
    onAddAsset: () => void;
    isAddDisabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, onExport, onAddAsset, isAddDisabled }) => {
    return (
        <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Asset Palette</h1>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={onReset}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>戻る</span>
                </button>
                 <button 
                    onClick={onAddAsset}
                    disabled={isAddDisabled}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>資産を追加</span>
                </button>
                <button 
                    onClick={onExport}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-sky-500 rounded-md hover:bg-sky-600 transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>PNGで保存</span>
                </button>
            </div>
        </header>
    );
}

export default Header;
