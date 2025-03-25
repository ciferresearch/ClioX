"use client";

import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

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
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {(isOpen || isAnimating) && (
        <div 
          className={`absolute top-full left-0 right-0 bg-white border-b shadow-lg transform transition-all duration-800 ease-out ${
            isOpen 
              ? "opacity-100 translate-y-0 max-h-[500px]" 
              : "opacity-0 -translate-y-2 max-h-0 overflow-hidden"
          }`}
          onTransitionEnd={handleAnimationEnd}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a href="#ecosystem" className="hover:text-blue-600 transition-colors duration-200" onClick={() => setIsOpen(false)}>
              Ecosystem
            </a>
            <a href="#portals" className="hover:text-blue-600 transition-colors duration-200" onClick={() => setIsOpen(false)}>
              Portals
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors duration-200" onClick={() => setIsOpen(false)}>
              Features
            </a>
            <a href="#resources" className="hover:text-blue-600 transition-colors duration-200" onClick={() => setIsOpen(false)}>
              Resources
            </a>
            <a href="#cases" className="hover:text-blue-600 transition-colors duration-200" onClick={() => setIsOpen(false)}>
              Case Studies
            </a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 w-full">
              Documentation
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 