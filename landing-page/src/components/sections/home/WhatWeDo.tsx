import Container from '@/components/layout/Container';
import PartnerCarousel from './PartnerCarousel';

export default function WhatWeDo() {
  const partners = [
    { id: 1, name: 'Partner 1' },
    { id: 2, name: 'Partner 2' },
    { id: 3, name: 'Partner 3' },
    { id: 4, name: 'Partner 4' },
    { id: 5, name: 'Partner 5' },
    { id: 6, name: 'Partner 6' },
    { id: 7, name: 'Partner 7' },
    { id: 8, name: 'Partner 8' },
    { id: 9, name: 'Partner 9' },
    { id: 10, name: 'Partner 10' },
  ];

  return (
    <section id="what-we-do" className="pt-18 pb-24 bg-white">
      <Container>
        {/* Top Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Welcoming Values-Aligned Partners
          </h2>
          
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed">
            This platform was designed to be built together. From memory
            institutions to research labs, our partners are shaping a shared
            ecosystem grounded in community, care, and transparency.
          </p>
        </div>

        {/* Partner logos carousel */}
        <PartnerCarousel partners={partners} />

        {/* Bottom Content Section */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <p>
              As public institutions increasingly digitize and share records online, and as more digital-born records become accessible, the risk of exposing sensitive personal data has grown significantly.
            </p>
            
            <p>
              ClioX addresses these challenges by allowing archives to manage consent and usage rights for their data while ensuring that computations are performed where the data is stored. This means that the raw data is never moved or exposed; only the results or insights from the computations are shared.
            </p>
            
            <p>
              The platform also provides AI + visual analytic tools to help researchers analyze large volumes of archival data and discover connections among them.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
} 