import Button from '@/components/common/Button';
import Container from '@/components/layout/Container';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="py-32 bg-gradient-to-br from-slate-900 to-teal-900 relative overflow-hidden">
      {/* Decorative background - we'll need to add the actual wave SVG or pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/images/background-placeholder.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <Container>
        <div className="flex flex-col max-w-2xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Access archival data securely. Build knowledge collectively.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-12 opacity-90 leading-relaxed">
            ClioX is a new kind of privacy-first platform—built by and for researchers, 
            archivists, and cultural institutions. It's designed to help you explore, share, 
            and collaborate on sensitive archival material without compromising on privacy or ownership.
          </p>

          <div className="flex gap-4">
            <Link href="#choose-role">
              <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                Get Started
              </Button>
            </Link>
            <Link href="#what-we-do">
              <Button variant="secondary" size="lg" className="bg-white text-slate-900 hover:bg-gray-100 cursor-pointer">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
} 