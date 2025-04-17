import React from 'react';
import { NavText } from './Typography';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  size = 'md',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-block font-semibold rounded transition-colors';
  
  const getButtonStyle = () => {
    const baseStyle = {
      ...(size === 'lg' ? { 
        width: '204px', 
        height: '73px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
      } : {})
    };

    switch(variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#282939',
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#F2F2F2',
          color: '#282939',
        };
      case 'outline':
        return {
          ...baseStyle,
          border: '1px solid #282939',
          color: '#282939',
        };
      default:
        return baseStyle;
    }
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: '',
  };
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${className || ''}`}
      style={getButtonStyle()}
      {...props}
    >
      <NavText>{children}</NavText>
    </button>
  );
} 