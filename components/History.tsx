import React from 'react';
import { FactCheckResult, Verdict } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, TrashIcon, HistoryIcon } from './icons';

interface HistoryItemData {
  originalClaim: string;
  result: FactCheckResult;
}

interface HistoryProps {
  history: HistoryItemData[];
  onItemClick: (item: HistoryItemData) => void;
  onClear: () => void;
}

const verdictIcons = {
  [Verdict.TRUE]: <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />,
  [Verdict.FALSE]: <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />,
  [Verdict.MIXED]: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
};

const History: React.FC<HistoryProps> = ({ history, onItemClick, onClear }) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-200">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <HistoryIcon className="w-6 h-6 text-slate-500" />
            Recent Checks
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            aria-label="Clear history"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <div className="bg-slate-200 p-3 rounded-full mb-4">
                <HistoryIcon className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-600 font-semibold">No history yet</p>
            <p className="text-sm text-slate-500">Your past checks will appear here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {history.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => onItemClick(item)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-slate-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {verdictIcons[item.result.verdict]}
                  <p className="text-slate-700 text-sm leading-snug break-word">
                    {item.originalClaim}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default History;