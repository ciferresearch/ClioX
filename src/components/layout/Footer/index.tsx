import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Clio-X */}
          <div>
            <h3 className="font-bold mb-6">Clio-X</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/portal" className="hover:text-blue-300">
                  Portal
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-blue-300">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="hover:text-blue-300">
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 2: Legal */}
          <div>
            <h3 className="font-bold mb-6">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="hover:text-blue-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/imprint" className="hover:text-blue-300">
                  Imprint
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Newsletter */}
          <div>
            <h3 className="font-bold text-xl mb-4">Join the community</h3>
            <p className="mb-6">Our newsletter provides you with latest data economy happenings on a monthly basis.</p>
            <Link 
              href="/subscribe" 
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-md inline-block"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom section with logo and copyright */}
      <div className="border-t border-slate-700">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <div className="mr-4">
            <Image
              src="/logo-clio-x.svg" 
              alt="Clio-X Logo"
              width={120}
              height={32}
            />
          </div>
          <div className="text-sm text-slate-400">
            Copyright © {currentYear} Clio-X
          </div>
        </div>
      </div>
    </footer>
  );
} 