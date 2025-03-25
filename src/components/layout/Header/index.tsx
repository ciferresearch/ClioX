import MobileNav from './MobileNav';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-w">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo with link to homepage */}
          <Link href="/" className="font-bold text-xl hover:text-blue-600">
            Clio-X
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#ecosystem" className="hover:text-blue-600">Ecosystem</Link>
          <Link href="/#portals" className="hover:text-blue-600">Portals</Link>
          <Link href="/#features" className="hover:text-blue-600">Features</Link>
          <Link href="/#resources" className="hover:text-blue-600">Resources</Link>
          <Link href="/#cases" className="hover:text-blue-600">Case Studies</Link>
        </div>
        <div className="hidden md:block">
          <Link 
            href="/docs" 
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 inline-block"
          >
            Documentation
          </Link>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
} 