import React from 'react';
import type { UploadedFile } from '../types';
import { analyzeFileWithGemini } from '../services/geminiService';
import { SparklesIcon, Spinner, LogoutIcon, TrashIcon, EmptyBoxIcon, FileTypeIcon, PageIcon, PaletteIcon, CheckBadgeIcon, TagIcon, DocumentTextIcon } from './Icons';

interface ShopOwnerViewProps {
  files: UploadedFile[];
  onLogout: () => void;
  onClearAll: () => void;
  onFileUpdate: (file: UploadedFile) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AnalysisInfo: React.FC<{ file: UploadedFile }> = ({ file }) => {
    if (file.analysisState === 'error') {
        return (
            <div className="text-base text-red-500 dark:text-red-400 mt-2" title={file.analysisError}>
                Analysis failed. Hover for details.
            </div>
        );
    }

    if (file.analysisState === 'success' && file.analysis) {
        const { pageCount, hasColor, imageQuality, documentType, documentContentSummary, fileExtension } = file.analysis;
        return (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-4 text-lg text-slate-600 dark:text-slate-300">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2" title="Document Type">
                    <TagIcon className="w-6 h-6 text-primary-500 shrink-0" />
                    <span className="font-semibold">{documentType ?? 'N/A'}</span>
                    {fileExtension && (
                        <span className="text-xs font-mono tracking-wider uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">{fileExtension}</span>
                    )}
                </div>
                 <div className="flex items-start gap-3" title="Content Summary">
                    <DocumentTextIcon className="w-6 h-6 text-primary-500 shrink-0 mt-0.5" />
                    <p className="text-base">{documentContentSummary ?? 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 pt-2 text-base">
                    <div className="flex items-center gap-2" title="Page Count">
                        <PageIcon className="w-5 h-5 text-slate-500" />
                        <span className="font-medium">{pageCount ?? '?'} pages</span>
                    </div>
                    <div className="flex items-center gap-2" title="Has Color">
                        <PaletteIcon className="w-5 h-5 text-slate-500" />
                        <span className="font-medium">{hasColor === undefined ? '?' : hasColor ? 'Color' : 'B&W'}</span>
                    </div>
                    <div className="flex items-center gap-2" title="Image Quality">
                        <CheckBadgeIcon className="w-5 h-5 text-slate-500" />
                        <span className="font-medium">{imageQuality ?? 'N/A'}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


const AnalyzeButton: React.FC<{ file: UploadedFile; onFileUpdate: (file: UploadedFile) => void }> = ({ file, onFileUpdate }) => {
  const isAnalyzable = file.file.type.startsWith('image/') || file.file.type === 'application/pdf';

  const handleAnalyze = async () => {
    if (!isAnalyzable || !process.env.API_KEY) return;
    onFileUpdate({ ...file, analysisState: 'loading' });
    try {
      const result = await analyzeFileWithGemini(file.file);
      onFileUpdate({ ...file, analysisState: 'success', analysis: result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      onFileUpdate({ ...file, analysisState: 'error', analysisError: errorMessage });
    }
  };
  
  if (file.analysisState === 'loading') {
      return <div className="flex items-center justify-center gap-2 text-base text-slate-500 w-full px-3 py-2"><Spinner className="w-5 h-5 text-primary-500" /> Analyzing...</div>;
  }
  
  if (file.analysisState === 'success') {
      return <div className="text-base font-semibold text-green-500 text-center w-full px-3 py-2">Analysis Complete</div>;
  }
  
  if (isAnalyzable && process.env.API_KEY) {
      return (
          <button
            onClick={handleAnalyze}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-base font-semibold text-primary-600 dark:text-primary-400 bg-primary-500/10 dark:bg-primary-500/20 rounded-lg hover:bg-primary-500/20 dark:hover:bg-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>AI Analysis</span>
          </button>
      );
  }
  
  return null;
};

export const ShopOwnerView: React.FC<ShopOwnerViewProps> = ({ files, onLogout, onClearAll, onFileUpdate }) => {
  const sortedFiles = [...files].sort((a, b) => b.timestamp - a.timestamp);
  const todayFilesCount = files.filter(f => new Date(f.timestamp).toDateString() === new Date().toDateString()).length;

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Received Documents</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            disabled={files.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <TrashIcon className="w-4 h-4"/> Clear All
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-950 transition-colors"
          >
             <LogoutIcon className="w-4 h-4"/> Logout
          </button>
        </div>
      </div>
      
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">Total Files in Queue</h3>
                <p className="text-6xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{files.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-medium text-slate-500 dark:text-slate-400">Uploads Today</h3>
                <p className="text-6xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{todayFilesCount.toLocaleString()}</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Daily Capacity: 100,000,000,000. Queue auto-clears files older than 24 hours.</p>
            </div>
        </div>

      <div className="space-y-5">
        {sortedFiles.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
            <EmptyBoxIcon className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="mt-6 text-2xl font-bold text-slate-600 dark:text-slate-300">The queue is empty</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Waiting for customers to send their documents...</p>
          </div>
        ) : (
          sortedFiles.map(file => (
            <div key={file.id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02] border border-slate-200/50 dark:border-slate-800/50 hover:border-primary-500/50">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl">
                    <FileTypeIcon fileType={file.file.type} className="w-12 h-12 text-primary-500" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate" title={file.file.name}>{file.file.name}</h3>
                      <p className="text-base text-slate-500 dark:text-slate-400">
                        {formatBytes(file.file.size)} &middot; Received at {new Date(file.timestamp).toLocaleTimeString()}
                      </p>
                      <AnalysisInfo file={file} />
                  </div>
                   <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
                      <a
                        href={file.blobUrl}
                        download={file.file.name}
                        className="text-center w-full sm:w-auto px-5 py-2.5 text-base font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        Download
                      </a>
                       <AnalyzeButton file={file} onFileUpdate={onFileUpdate} />
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!process.env.API_KEY && (
          <div className="mt-8 p-4 text-sm bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-r-lg">
            <strong>Notice:</strong> The AI Analysis feature is disabled because the Gemini API key is not configured.
          </div>
        )}
    </div>
  );
};