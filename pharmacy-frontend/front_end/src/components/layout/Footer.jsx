import React from 'react';
import { Heart, RefreshCw } from 'lucide-react';

const Footer = () => {
  const currentTime = new Date().toLocaleTimeString();
  
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-3 px-6">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <p className="animate-fade-in">© 2024 PharmaFlow. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>Version 2.0.0</p>
          <p className="flex items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Made with <Heart className="w-3 h-3 mx-1 text-red-500 fill-current animate-pulse" /> for Pharmacy
          </p>
          <p className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <RefreshCw className="w-3 h-3" />
            Last sync: {currentTime}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

