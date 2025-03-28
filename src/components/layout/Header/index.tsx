"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import MobileNav from './MobileNav';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function Header() {
  // Use a simple boolean state with a default value
  const [atTop, setAtTop] = useState(true);
  // Add a state to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
    
    // Set initial scroll position
    setAtTop(window.scrollY === 0);
    
    // Handle scroll events
    const handleScroll = () => {
      const isAtTop = window.scrollY === 0;
      if (isAtTop !== atTop) {
        setAtTop(isAtTop);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [atTop]);

  // Only render dynamic content after mounting
  // Keep mobile logo position consistent regardless of scroll position
  const logoSize = isMounted && atTop 
    ? 'w-12 h-12 top-1/2 -translate-y-1/2 md:w-24 md:h-24 md:top-4 md:translate-y-0' 
    : 'w-12 h-12 top-1/2 -translate-y-1/2 md:w-12 md:h-12';
    
  const textSize = isMounted && atTop 
    ? 'text-[10px] md:text-lg' 
    : 'text-[10px] md:text-sm';

  return (
    <header className="w-full bg-white sticky top-0 z-50 py-3 md:py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo container with smooth transition */}
          <div className="flex items-center w-24 h-10 md:h-14 relative">
            <Link href="/" aria-label="Go to homepage">
              <div 
                className={`bg-gray-100 rounded-full flex items-center justify-center absolute ${
                  isMounted ? 'transition-all duration-300 ease-in-out' : ''
                } ${logoSize}`}
              >
                <span className={`text-gray-800 font-bold ${
                  isMounted ? 'transition-all duration-300 ease-in-out' : ''
                } ${textSize}`}>
                  LOGO
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation Links - hidden on mobile, centered on desktop */}
          <div className="hidden md:flex flex-grow justify-center">
            <div className="flex space-x-30 pt-1">
              <Link href="#" className="text-gray-800 hover:text-blue-600 font-bold">LINK 1</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600 font-bold">LINK 2</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600 font-bold">LINK 3</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600 font-bold">LINK 4</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600 font-bold">LINK 5</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600 font-bold">LINK 6</Link>
            </div>
          </div>
          
          {/* Mobile Navigation - only visible on mobile */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
} 