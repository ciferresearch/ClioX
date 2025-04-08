"use client";

import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setIsAnimating(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 transition-colors hover:text-blue-600"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XMarkIcon className="h-8 w-8" />
        ) : (
          <Bars3Icon className="h-8 w-8" />
        )}
      </button>

      {(isOpen || isAnimating) && (
        <div 
          className={`absolute top-full left-0 right-0 bg-white shadow-lg transform transition-all duration-300 ease-out ${
            isOpen 
              ? "opacity-100 translate-y-0 max-h-[500px]" 
              : "opacity-0 -translate-y-2 max-h-0 overflow-hidden"
          }`}
          onTransitionEnd={handleAnimationEnd}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link href="/link1" className="hover:text-blue-600 transition-colors duration-200 font-bold" onClick={() => setIsOpen(false)}>
              LINK 1
            </Link>
            <Link href="/link2" className="hover:text-blue-600 transition-colors duration-200 font-bold" onClick={() => setIsOpen(false)}>
              LINK 2
            </Link>
            <Link href="/link3" className="hover:text-blue-600 transition-colors duration-200 font-bold" onClick={() => setIsOpen(false)}>
              LINK 3
            </Link>
            <Link href="/link4" className="hover:text-blue-600 transition-colors duration-200 font-bold" onClick={() => setIsOpen(false)}>
              LINK 4
            </Link>
            <Link href="/link5" className="hover:text-blue-600 transition-colors duration-200 font-bold" onClick={() => setIsOpen(false)}>
              LINK 5
            </Link>
            <Link href="/link6" className="hover:text-blue-600 transition-colors duration-200 font-bold" onClick={() => setIsOpen(false)}>
              LINK 6
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
} 