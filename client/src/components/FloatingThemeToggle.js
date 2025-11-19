import React from 'react';
import { useTheme } from '../context/ThemeContext';

const FloatingThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleTheme}
        className={`group relative inline-flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 hover:scale-110 shadow-xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500/50 focus:ring-offset-gray-900' 
            : 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 focus:ring-orange-500/50 focus:ring-offset-white'
        }`}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="sr-only">Toggle theme</span>
        
        {/* Animated background effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100' 
            : 'bg-gradient-to-br from-amber-400 to-red-500 opacity-0 group-hover:opacity-100'
        }`}></div>
        
        {/* Icon container */}
        <div className="relative transition-transform duration-300 group-hover:rotate-12">
          {isDarkMode ? (
            <svg className="h-6 w-6 text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-white transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className={`px-3 py-1 text-xs font-medium rounded-lg shadow-lg whitespace-nowrap ${
            isDarkMode 
              ? 'bg-gray-800 text-white border border-gray-600' 
              : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            <div className={`absolute top-full right-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent ${
              isDarkMode ? 'border-t-gray-800' : 'border-t-white'
            }`}></div>
          </div>
        </div>
        
        {/* Pulse animation */}
        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
          isDarkMode 
            ? 'bg-purple-400' 
            : 'bg-orange-400'
        }`}></div>
      </button>
    </div>
  );
};

export default FloatingThemeToggle;
