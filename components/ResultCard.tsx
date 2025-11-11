import React, { useState, useRef } from 'react';
import { FactCheckResult, Verdict } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, LinkIcon, ClipboardIcon, ClipboardCheckIcon, ShareIcon } from './icons';

declare var html2canvas: any;

interface ResultCardProps {
  result: FactCheckResult;
  originalClaim: string;
}

const verdictConfig = {
  [Verdict.TRUE]: {
    text: 'True',
    icon: <CheckCircleIcon className="w-7 h-7" />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  [Verdict.FALSE]: {
    text: 'False',
    icon: <XCircleIcon className="w-7 h-7" />,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
  },
  [Verdict.MIXED]: {
    text: 'Mixed / Nuanced',
    icon: <ExclamationTriangleIcon className="w-7 h-7" />,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
  },
};

const ResultCard: React.FC<ResultCardProps> = ({ result, originalClaim }) => {
  const config = verdictConfig[result.verdict] || verdictConfig[Verdict.MIXED];
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessingShare, setIsProcessingShare] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    const textToCopy = `Verdict: ${verdictConfig[result.verdict].text}\n\n${result.explanation}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleShare = async () => {
    if (!cardRef.current || isProcessingShare) return;
    setIsProcessingShare(true);

    try {
        const canvas = await html2canvas(cardRef.current, { 
          useCORS: true,
          logging: false,
          backgroundColor: null, // Use element's background
        });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

        if (!blob) {
            throw new Error('Could not create image blob.');
        }

        const file = new File([blob], 'veritas-ai-fact-check.png', { type: 'image/png' });
        const shareData = {
            title: 'Veritas AI: Fact-Check Result',
            text: `Veritas AI fact-check for the claim: "${originalClaim}"`,
            files: [file],
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'veritas-ai-fact-check.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    } catch (err) {
        console.error('Sharing failed:', err);
        alert('Could not share or download result image.');
    } finally {
        setIsProcessingShare(false);
    }
  };

  return (
    <div ref={cardRef} className={`bg-white rounded-xl shadow-lg border ${config.borderColor} overflow-hidden animate-fade-in`}>
      <header className={`flex items-center gap-3 p-4 ${config.bgColor} border-b ${config.borderColor}`}>
        <span className={config.textColor}>{config.icon}</span>
        <h2 className={`text-xl font-bold ${config.textColor}`}>{config.text}</h2>
      </header>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Explanation</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
                onClick={handleShare}
                disabled={isProcessingShare}
                className="flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-1 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Share result"
            >
              {isProcessingShare ? 'Preparing...' : (
                <>
                  <ShareIcon className="w-4 h-4" />
                  {navigator.share ? 'Share' : 'Download'}
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-1 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="Copy explanation"
              >
              {isCopied ? (
                  <>
                  <ClipboardCheckIcon className="w-4 h-4 text-green-600" />
                  Copied!
                  </>
              ) : (
                  <>
                  <ClipboardIcon className="w-4 h-4" />
                  Copy
                  </>
              )}
            </button>
          </div>
        </div>
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
          {result.explanation}
        </p>

        {result.sources && result.sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Sources</h3>
            <ul className="space-y-2">
              {result.sources.map((source, index) => (
                <li key={index} className="flex items-start gap-3">
                  <LinkIcon className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline hover:text-blue-700 transition-colors break-all"
                  >
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;

// Simple fade-in animation using CSS keyframes injected via a style tag.
// This is a workaround since we can't use a separate CSS file or modify tailwind.config.js.
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);