import React from 'react';

const Input = ({ 
  label,
  error,
  className = '',
  type = 'text',
  icon = null,
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">{icon}</span>
          </div>
        )}
        <input
          type={type}
          className={`
            block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-white
            ring-1 ring-inset ring-gray-300 dark:ring-gray-600
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:focus:ring-primary-500
            bg-white dark:bg-gray-700
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'ring-error-500 focus:ring-error-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
