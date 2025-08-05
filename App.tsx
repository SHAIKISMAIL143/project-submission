import React, { useState, useEffect, useCallback } from 'react';
import { UploadedFile } from './types';
import useTheme from './hooks/useTheme';
import { AuthView } from './components/AuthView';
import { CustomerView } from './components/CustomerView';
import { ShopOwnerView } from './components/ShopOwnerView';
import { SunIcon, MoonIcon } from './components/Icons';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'customer' | 'login'>('customer');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      setUploadedFiles(currentFiles => {
        const freshFiles = currentFiles.filter(file => now - file.timestamp < twentyFourHours);
        const expiredFiles = currentFiles.filter(file => now - file.timestamp >= twentyFourHours);
        expiredFiles.forEach(file => URL.revokeObjectURL(file.blobUrl));
        return freshFiles;
      });
    }, 60 * 1000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setView('customer');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleFilesSubmit = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleClearAll = () => {
    uploadedFiles.forEach(file => URL.revokeObjectURL(file.blobUrl));
    setUploadedFiles([]);
  };
  
  const handleFileUpdate = useCallback((updatedFile: UploadedFile) => {
    setUploadedFiles(prevFiles => 
        prevFiles.map(f => f.id === updatedFile.id ? updatedFile : f)
    );
  }, []);

  const renderView = () => {
    if (isLoggedIn) {
      return (
        <ShopOwnerView
          files={uploadedFiles}
          onLogout={handleLogout}
          onClearAll={handleClearAll}
          onFileUpdate={handleFileUpdate}
        />
      );
    }
    switch (view) {
      case 'login':
        return <AuthView onLogin={handleLogin} onSwitchToCustomer={() => setView('customer')} />;
      case 'customer':
      default:
        return <CustomerView onFilesSubmit={handleFilesSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <header className="sticky top-0 z-10 py-3 px-4 sm:px-6 md:px-8 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 text-transparent bg-clip-text">Ismail's Digital Drop</h1>
        <div className="flex items-center gap-4">
           {!isLoggedIn && view === 'customer' && (
                <button 
                    onClick={() => setView('login')} 
                    className="text-lg font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Shop Owner Login
                </button>
            )}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-950 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;