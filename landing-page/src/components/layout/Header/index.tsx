"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import MobileNav from './MobileNav';
import { Bars3Icon } from '@heroicons/react/24/outline';

// Simple NavItem component to avoid repetition
function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-blue-600">
      <span className="font-sans text-base font-bold tracking-[-0.019em]">
        {children}
      </span>
    </Link>
  );
}

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
  const logoSize = isMounted && atTop 
    ? 'w-12 h-12 md:w-24 md:h-24' 
    : 'w-12 h-12 md:w-12 md:h-12';
    
  const textSize = isMounted && atTop 
    ? 'text-[10px] md:text-lg' 
    : 'text-[10px] md:text-sm';

  const headerHeight = isMounted && atTop
    ? 'h-[102px]'
    : 'h-20';
    
  const logoPosition = isMounted && atTop
    ? 'absolute bottom-0 translate-y-1/2'
    : 'relative';

  return (
    <header
      className={`w-full bg-white sticky top-0 z-50 ${headerHeight} transition-all duration-300 ease-in-out`}
    >
      <div className="h-full px-4 md:px-8 lg:px-12 xl:px-16 grid grid-cols-[1fr_4fr_1fr]">
        {/* Logo column - right aligned */}
        <div className="flex items-center justify-end relative">
          <Link
            href="/"
            aria-label="Go to homepage"
            className={`${logoPosition} ${
              isMounted ? "transition-all duration-300 ease-in-out" : ""
            }`}
          >
            <div
              className={`bg-gray-100 rounded-full flex items-center justify-center ${
                isMounted ? "transition-all duration-300 ease-in-out" : ""
              } ${logoSize}`}
            >
              <span
                className={`text-gray-800 font-bold ${
                  isMounted ? "transition-all duration-300 ease-in-out" : ""
                } ${textSize}`}
              >
                LOGO
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links - centered in middle column */}
        <div className="hidden md:flex items-center justify-center w-full">
          <div className="flex justify-between w-full px-10 md:px-16 lg:px-24 xl:px-32">
            <NavItem href="#">Catalogue</NavItem>
            <NavItem href="#">Publish</NavItem>
            <NavItem href="#">Verify</NavItem>
            <NavItem href="#">Log</NavItem>
            <NavItem href="#">Ecosystem</NavItem>
            <NavItem href="#">Resources</NavItem>
          </div>
        </div>

        {/* Empty third column for symmetry (on desktop) / Mobile Nav (on mobile) */}
        <div className="flex items-center">
          <div className="md:hidden ml-auto">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
} 