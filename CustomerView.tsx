import React, { useState, useCallback } from 'react';
import type { UploadedFile } from '../types';
import { UploadIcon, FileTypeIcon, XCircleIcon, CheckCircleIcon, PaperPlaneIcon } from './Icons';

declare global {
  interface Window {
    confetti: any;
  }
}

interface CustomerViewProps {
  onFilesSubmit: (files: UploadedFile[]) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const CustomerView: React.FC<CustomerViewProps> = ({ onFilesSubmit }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sentFiles, setSentFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setError(null);
    const newFiles: File[] = Array.from(files);
    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      setError(`Error: Files must be under 50MB. The following files are too large: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to send.");
      return;
    }
    
    const filesToUpload: UploadedFile[] = selectedFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      blobUrl: URL.createObjectURL(file),
      timestamp: Date.now(),
      analysisState: 'idle',
    }));
    
    onFilesSubmit(filesToUpload);
    setSentFiles(prev => [...prev, ...filesToUpload]);
    setSelectedFiles([]);

    if (window.confetti) {
        window.confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            startVelocity: 40,
        });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-6 text-center">Sending Documents</h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-in-out ${isDragging ? 'border-primary-500 bg-primary-500/10 scale-105' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 bg-white/50 dark:bg-slate-900/50'}`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
          aria-label="File upload"
        />
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
            <UploadIcon className={`w-16 h-16 text-primary-500 transition-transform duration-300 ${isDragging ? 'scale-110 -translate-y-1' : ''}`} />
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                {isDragging ? "Drop files to upload!" : "Drag & drop files here"}
            </p>
             <span className="text-slate-500 dark:text-slate-400">or</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">Click to browse</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 pt-2">Maximum file size: 50MB</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200 rounded-r-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Files to Send</h3>
            <div className="space-y-3">
                {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-transparent dark:border-slate-700/50">
                        <div className="flex items-center space-x-4 overflow-hidden">
                            <FileTypeIcon fileType={file.type} className="w-10 h-10 text-primary-500 shrink-0" />
                            <div className="overflow-hidden">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.name}>{file.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</p>
                            </div>
                        </div>
                        <button onClick={() => removeFile(index)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-full transition-colors hover:bg-red-500/10">
                            <XCircleIcon className="w-7 h-7" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={handleSubmit}
                className="mt-6 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-100"
            >
                <PaperPlaneIcon className="w-6 h-6"/>
                <span className="text-lg">Send {selectedFiles.length} File(s) for Printing</span>
            </button>
        </div>
      )}

      {sentFiles.length > 0 && (
         <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-4">Your Sent Documents (This Session)</h3>
            <div className="space-y-3">
                {sentFiles.map((uploadedFile) => (
                    <div key={uploadedFile.id} className="flex items-center p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border-l-4 border-green-400">
                        <CheckCircleIcon className="w-8 h-8 text-green-500 mr-4 shrink-0" />
                        <div className="overflow-hidden">
                           <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={uploadedFile.file.name}>{uploadedFile.file.name}</p>
                           <p className="text-sm text-slate-500 dark:text-slate-400">{formatBytes(uploadedFile.file.size)}</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      )}
    </div>
  );
};