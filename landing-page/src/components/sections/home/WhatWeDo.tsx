import Container from '@/components/layout/Container';
import PartnerCarousel from './PartnerCarousel';
import { BodyText, DisplayLarge } from '@/components/common/Typography';
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
        <div className="w-full mb-20">
          <DisplayLarge>Welcoming Values-Aligned Partners</DisplayLarge>
        </div>

        {/* Partner logos carousel */}
        <PartnerCarousel partners={partners} />

        {/* Bottom Content Section */}
        <div className="w-full mx-auto">
          <div className="space-y-8 text-lg text-gray-700">
            <BodyText align="left">
              This platform was designed to be built together. From memory
              institutions to research labs, our partners are shaping a shared
              Web3 ecosystem grounded in community, care, and transparency.
            </BodyText>

            <BodyText align="left">
              As public institutions increasingly digitize and share records
              online, and as more digital-born records become accessible, the
              risk of using AI, including exposing sensitive personal data, has
              grown significantly.
            </BodyText>

            <BodyText align="left">
              ClioX addresses these risks by allowing archives to manage consent
              and usage rights for their data while ensuring that computations
              are performed where the data is stored. This means that the raw
              data is never moved or exposed; only the results or insights from
              the computations are shared.
            </BodyText>

            <BodyText align="left">
              The platform also provides AI + visual analytic tools to help
              researchers analyze large volumes of archival data and discover
              new insights among them.
            </BodyText>
          </div>
        </div>
      </Container>
    </section>
  );
} 