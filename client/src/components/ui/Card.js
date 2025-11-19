import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'p-6',
  shadow = 'soft',
  ...props 
}) => {
  const shadowClass = {
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
    none: 'shadow-none'
  }[shadow];

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        ${shadowClass}
        rounded-xl 
        border border-gray-100 dark:border-gray-700
        ${hover ? 'hover:shadow-medium hover:scale-[1.02] transition-all duration-200' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
